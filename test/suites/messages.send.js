const assert = require('assert');
const Chat = require('../../src');
const { expect } = require('chai');
const { login } = require('../helpers/users');
const socketIOClient = require('socket.io-client');

const action = 'chat.messages.send';
const chat = new Chat(global.SERVICES);
const fakeRoomId = '00000000-0000-0000-0000-000000000000';

describe('messages.send', function testSuite() {
  before('start up chat', () => chat.connect());

  before('login admin', () =>
    login(chat.amqp, 'admin@foo.com', 'adminpassword00000')
        .tap(({ jwt }) => (this.adminToken = jwt))
  );

  before('login user', () =>
    login(chat.amqp, 'user@foo.com', 'userpassword000000')
      .tap(({ jwt }) => (this.userToken = jwt))
  );

  before('login second user', () =>
    login(chat.amqp, 'second.user@foo.com', 'seconduserpassword')
      .tap(({ jwt }) => (this.secondUserToken = jwt))
  );

  before('create room', () => {
    const params = {
      name: 'test room',
      createdBy: 'admin@foo.com',
      banned: ['second.user@foo.com'],
    };

    return chat.services.room
      .create(params)
      .tap((createdRoom) => {
        this.room = createdRoom;
        this.roomId = createdRoom.id.toString();
      });
  });

  it('should return validation error if invalid params', (done) => {
    const client = socketIOClient('http://0.0.0.0:3000');
    client.on('error', done);
    client.on('connect', () => {
      client.emit(action, { roomId: fakeRoomId, message: { foo: 'bar' } }, (error) => {
        expect(error.name).to.be.equals('ValidationError');
        client.disconnect();
        done();
      });
    });
  });

  it('should return validation error if invalid message', (done) => {
    const client = socketIOClient('http://0.0.0.0:3000');
    client.on('error', done);
    client.on('connect', () => {
      client.emit(action, { roomId: fakeRoomId, message: { text: 'bar', foo: 'baz' } }, (error) => {
        expect(error.name).to.be.equals('ValidationError');
        client.disconnect();
        done();
      });
    });
  });

  it('should return validation error if invalid sticky message', (done) => {
    const client = socketIOClient('http://0.0.0.0:3000');
    client.on('error', done);
    client.on('connect', () => {
      client.emit(action, {
        roomId: '00000000-0000-0000-0000-000000000000',
        message: { type: 'sticky', foo: 'bar' },
      }, (error) => {
        expect(error.name).to.be.equals('ValidationError');
        client.disconnect();
        done();
      });
    });
  });

  it('should return validation error if invalid room id', (done) => {
    const client = socketIOClient('http://0.0.0.0:3000');
    client.on('error', done);
    client.on('connect', () => {
      client.emit(action, { roomId: '1', message: { text: 'foo' } }, (error) => {
        expect(error.name).to.be.equals('ValidationError');
        expect(error.message).to.be.equals('messages.send validation failed:' +
          ' data.roomId should match format "uuid"');
        client.disconnect();
        done();
      });
    });
  });

  it('should return not found error if room not found', (done) => {
    const client = socketIOClient('http://0.0.0.0:3000');
    client.on('error', done);
    client.on('connect', () => {
      client.emit(action, { roomId: fakeRoomId, message: { text: 'foo' } }, (error) => {
        expect(error.name).to.be.equals('NotFoundError');
        expect(error.message).to.be.equals('Not Found:' +
          ' "Room #00000000-0000-0000-0000-000000000000 not found"');
        client.disconnect();
        done();
      });
    });
  });

  it('should return not permitted error if not in the room', (done) => {
    const client = socketIOClient('http://0.0.0.0:3000');
    client.on('error', done);
    client.on('connect', () => {
      client.emit(action, { roomId: this.room.id.toString(), message: { text: 'foo' } }, (error) => {
        expect(error.name).to.be.equals('NotPermittedError');
        expect(error.message).to.be.equals('An attempt was made to perform an operation that' +
          ' is not permitted: Not in the room');
        client.disconnect();
        done();
      });
    });
  });

  it('should return error if sticky message and user is not admin', (done) => {
    const client = socketIOClient('http://0.0.0.0:3000', { query: `token=${this.userToken}` });

    client.on('error', done);
    client.on('connect', () => {
      client.emit('chat.rooms.join', { id: this.room.id.toString() }, () => {
        const message = { type: 'sticky', text: 'foo' };

        client.emit(action, { roomId: this.room.id.toString(), message }, (error) => {
          expect(error.name).to.be.equals('NotPermittedError');
          expect(error.message).to.be.equals('An attempt was made to perform an operation' +
            ' that is not permitted: Access denied for message type "sticky"');
          client.disconnect();
          done();
        });
      });
    });
  });

  it('should send message', (done) => {
    const client = socketIOClient('http://0.0.0.0:3000', { query: `token=${this.userToken}` });
    const roomId = this.room.id.toString();

    client.on('error', done);
    client.on('connect', () => {
      client.emit('chat.rooms.join', { id: roomId }, () => {
        client.emit(action, { roomId, message: { text: 'foo' } }, (error, response) => {
          assert.equal(error, null);

          assert.ok(response.id);
          assert.equal(response.text, 'foo');
          assert.equal(response.roomId, roomId);
          assert.ok(response.createdAt);
          assert.equal(response.userId, 'user@foo.com');
          assert.equal(response.user.id, 'user@foo.com');
          assert.equal(response.user.name, 'User User');
          assert.deepEqual(response.user.roles, ['user']);
          assert.deepEqual(response.properties, {});
          assert.deepEqual(response.attachments, {});

          client.disconnect();
          done();
        });
      });
    });
  });

  it('should not be able to send message if banned', (done) => {
    const client = socketIOClient('http://0.0.0.0:3000', {
      query: `token=${this.secondUserToken}`,
    });
    const roomId = this.roomId;

    client.on('error', done);
    client.on('connect', () => {
      client.emit('chat.rooms.join', { id: roomId }, () => {
        client.emit(action, { roomId, message: { text: 'foo' } }, (error) => {
          assert.equal(error.message, 'An attempt was made to perform an operation that' +
            ' is not permitted: User #second.user@foo.com is banned');
          assert.equal(error.name, 'NotPermittedError');

          client.disconnect();
          done();
        });
      });
    });
  });

  it('should save message', (done) => {
    const client = socketIOClient('http://0.0.0.0:3000', { query: `token=${this.adminToken}` });
    const roomId = this.room.id.toString();

    client.on('error', done);
    client.on('connect', () => {
      client.emit('chat.rooms.join', { id: roomId }, () => {
        client.emit(action, { roomId, message: { text: 'foo' } }, () => {
          client.emit(action, { roomId, message: { text: 'bar' } }, () => {
            client.emit(action, { roomId, message: { text: 'baz' } }, () => {
              chat.services.message
                .find({ roomId }, { $desc: 'id' }, 2)
                .then((messages) => {
                  const [first, second] = messages;

                  assert.ok(first.id);
                  assert.equal(first.text, 'baz');
                  assert.equal(first.roomId, roomId);
                  assert.ok(first.createdAt);
                  assert.equal(first.userId, 'admin@foo.com');
                  assert.equal(first.user.id, 'admin@foo.com');
                  assert.equal(first.user.name, 'Admin Admin');
                  assert.deepEqual(first.user.roles, ['admin']);
                  assert.equal(first.properties, null);
                  assert.equal(first.attachments, null);

                  assert.ok(second.id);
                  assert.equal(second.text, 'bar');
                  assert.equal(second.roomId, roomId);
                  assert.ok(second.createdAt);
                  assert.equal(second.userId, 'admin@foo.com');
                  assert.equal(second.user.id, 'admin@foo.com');
                  assert.equal(second.user.name, 'Admin Admin');
                  assert.deepEqual(second.user.roles, ['admin']);
                  assert.equal(second.properties, null);
                  assert.equal(second.attachments, null);

                  client.disconnect();
                  done();
                });
            });
          });
        });
      });
    });
  });

  it('should emit when send message', (done) => {
    const client1 = socketIOClient('http://0.0.0.0:3000', { query: `token=${this.adminToken}` });
    const client2 = socketIOClient('http://0.0.0.0:3000', { query: `token=${this.userToken}` });
    const roomId = this.room.id.toString();

    client1.on(`messages.send.${roomId}`, (response) => {
      assert.ok(response.id);
      assert.equal(response.text, 'foo');
      assert.equal(response.roomId, roomId);
      assert.ok(response.createdAt);
      assert.equal(response.userId, 'user@foo.com');
      assert.equal(response.user.id, 'user@foo.com');
      assert.equal(response.user.name, 'User User');
      assert.deepEqual(response.user.roles, ['user']);
      assert.deepEqual(response.properties, {});
      assert.deepEqual(response.attachments, {});

      client1.disconnect();
      client2.disconnect();
      done();
    });

    client1.on('connect', () => {
      client1.emit('chat.rooms.join', { id: roomId }, () => {
        client2.emit('chat.rooms.join', { id: roomId }, () => {
          client2.emit(action, { roomId, message: { text: 'foo' } }, (error) => {
            expect(error).to.be.equals(null);
          });
        });
      });
    });
  });

  after('delete room', () => this.room.deleteAsync());

  after('shutdown chat', () => chat.close());
});
