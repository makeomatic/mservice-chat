const assert = require('assert');
const Chat = require('../../src');
const { connect, emit } = require('../helpers/socketIO');
const { expect } = require('chai');
const { login } = require('../helpers/users');
const Promise = require('bluebird');
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
    const params = { name: 'test room', createdBy: 'admin@foo.com' };

    return chat.services.room
      .create(params)
      .tap((createdRoom) => {
        this.room = createdRoom;
        this.roomId = createdRoom.id.toString();
      });
  });

  before('create participants', () => {
    const service = chat.services.participant;
    const admin = { id: 'admin@foo.com', name: 'Admin Admin', roles: ['admin'] };
    const participants = [
      {
        id: 'second.user@foo.com',
        name: 'Second User',
        roles: [],
        roomId: this.roomId,
        bannedBy: admin,
        bannedAt: new Date(),
        reason: 'foo',
      },
    ];

    return Promise.map(participants, participant => service.create(participant));
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
        expect(error.name).to.be.equals('NotFoundError');
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
        client.emit(action, { roomId, message: { text: 'foo bar ass' } }, (error, response) => {
          assert.equal(error, null);

          const { data } = response;

          assert.ok(data.id);
          assert.equal(data.attributes.text, 'foo bar ass');
          assert.ok(/^foo bar [!@#$%~*]{3}$/.test(data.attributes.sanitizedText));
          assert.equal(data.attributes.roomId, roomId);
          assert.ok(data.attributes.createdAt);
          assert.equal(data.attributes.userId, 'user@foo.com');
          assert.equal(data.attributes.user.id, 'user@foo.com');
          assert.equal(data.attributes.user.name, 'User User');
          assert.deepEqual(data.attributes.user.roles, []);

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
        client.emit(action, { roomId, message: { text: 'foo bar ass' } }, () => {
          client.emit(action, { roomId, message: { text: 'bar baz ass' } }, () => {
            client.emit(action, { roomId, message: { text: 'baz qux ass' } }, () => {
              chat.services.message
                .find({ roomId }, { $desc: 'id' }, 2)
                .then((messages) => {
                  const [first, second] = messages;

                  assert.ok(first.id);
                  assert.equal(first.text, 'baz qux ass');
                  assert.ok(/^baz qux [!@#$%~*]{3}$/.test(first.sanitizedText));
                  assert.equal(first.roomId, roomId);
                  assert.ok(first.createdAt);
                  assert.equal(first.userId, 'admin@foo.com');
                  assert.equal(first.user.id, 'admin@foo.com');
                  assert.equal(first.user.name, 'Admin Admin');
                  assert.deepEqual(first.user.roles, ['admin']);

                  assert.ok(second.id);
                  assert.equal(second.text, 'bar baz ass');
                  assert.ok(/^bar baz [!@#$%~*]{3}$/.test(second.sanitizedText));
                  assert.equal(second.roomId, roomId);
                  assert.ok(second.createdAt);
                  assert.equal(second.userId, 'admin@foo.com');
                  assert.equal(second.user.id, 'admin@foo.com');
                  assert.equal(second.user.name, 'Admin Admin');
                  assert.deepEqual(second.user.roles, ['admin']);

                  client.disconnect();
                  done();
                })
                .catch(done);
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
      const { attributes, id, type } = response.data;

      assert.ok(id);
      assert.equal(type, 'message');
      assert.equal(attributes.text, 'foo bar ass');
      assert.ok(/^foo bar [!@#$%~*]{3}$/.test(attributes.sanitizedText));
      assert.equal(attributes.roomId, roomId);
      assert.ok(attributes.createdAt);
      assert.equal(attributes.userId, 'user@foo.com');
      assert.equal(attributes.user.id, 'user@foo.com');
      assert.equal(attributes.user.name, 'User User');
      assert.deepEqual(attributes.user.roles, []);

      client1.disconnect();
      client2.disconnect();
      done();
    });

    client1.on('connect', () => {
      client1.emit('chat.rooms.join', { id: roomId }, () => {
        client2.emit('chat.rooms.join', { id: roomId }, () => {
          client2.emit(action, { roomId, message: { text: 'foo bar ass' } }, (error) => {
            expect(error).to.be.equals(null);
          });
        });
      });
    });
  });

  it('should be able to pin sticky message', (done) => {
    const client = socketIOClient('http://0.0.0.0:3000', { query: `token=${this.adminToken}` });

    client.on('error', done);
    client.on('connect', () => {
      client.emit('chat.rooms.join', { id: this.roomId }, () => {
        const message = { type: 'sticky', text: 'pin me plz' };

        client.emit(action, { roomId: this.roomId, message }, () => {
          chat.services.pin
            .last(this.roomId)
            .then((pin) => {
              assert.equal(pin.message.text, 'pin me plz');

              client.disconnect();
              done();
            })
            .catch(done);
        });
      });
    });
  });

  it('should be able to pin sticky message', (done) => {
    const client = socketIOClient('http://0.0.0.0:3000', { query: `token=${this.adminToken}` });

    client.on('error', done);
    client.on('connect', () => {
      client.emit('chat.rooms.join', { id: this.roomId }, () => {
        const message = { type: 'sticky', text: 'pin me plz' };

        client.on(`messages.pin.${this.roomId}`, (response) => {
          const { attributes, type } = response.data;

          assert.equal(type, 'pin');
          assert.equal(attributes.message.text, 'pin me plz');

          client.disconnect();
          done();
        });

        client.emit(action, { roomId: this.roomId, message });
      });
    });
  });

  it('should be able to update participant\'s activity', () => {
    const { userToken, roomId } = this;
    const client = socketIOClient('http://0.0.0.0:3000', { query: `token=${userToken}` });
    const testCase = [
      () => chat.services.participant.findOne({ roomId, id: 'user@foo.com' }),
      () => emit(client, action, { roomId, message: { text: 'foo' } }),
      () => chat.services.participant.findOne({ roomId, id: 'user@foo.com' }),
    ];

    return connect(client)
      .then(() => emit(client, 'chat.rooms.join', { id: this.roomId }))
      .then(() => Promise.mapSeries(testCase, handler => handler()))
      .spread((prev, message, current) => {
        assert.equal(prev.lastActivityAt < current.lastActivityAt, true);
      })
      .tap(() => client.disconnect());
  });

  after('shutdown chat', () => chat.close());
});
