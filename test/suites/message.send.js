const assert = require('assert');
const { expect } = require('chai');
const Chance = require('chance');

describe('message', function testSuite() {
  const SocketIOClient = require('socket.io-client');
  const Chat = require('../../src');
  const chance = new Chance();
  const action = 'chat.message.send';
  const fakeRoomId = '00000000-0000-0000-0000-000000000000';

  before('start up chat', () => {
    const chat = this.chat = new Chat(global.SERVICES);
    return chat.connect();
  });

  before('create room', () => {
    return this.chat.services.room
      .create({ name: 'test', createdBy: 'test@test.ru' })
      .tap(room => {
        this.room = room
      });
  });

  before('login admin', () => this.chat.amqp
    .publishAndWait('users.login', {
      username: 'test@test.ru',
      password: 'megalongsuperpasswordfortest',
      audience: '*.localhost'
    })
    .tap(reply => {
      this.adminToken = reply.jwt;
    })
  );

  before('create user', () => {
    const userParams = {
      username: chance.email(),
      password: 'megalongsuperpasswordfortest',
      audience: '*.localhost',
      metadata: {
        firstName: 'Simple',
        lastName: 'User',
        roles: ['user'],
      },
    };

    return this.chat.amqp
      .publishAndWait('users.register', userParams)
      .tap(({ jwt }) => {
        this.userToken = jwt;
      });
  });

  it('should return validation error if invalid params', done => {
    const client = SocketIOClient('http://0.0.0.0:3000');
    client.on('error', done);
    client.on('connect', () => {
      client.emit(action, { id: fakeRoomId, message: { foo: 'bar' } }, error => {
        expect(error.name).to.be.equals('ValidationError');
        client.disconnect();
        done();
      });
    });
  });

  it('should return validation error if invalid message', done => {
    const client = SocketIOClient('http://0.0.0.0:3000');
    client.on('error', done);
    client.on('connect', () => {
      client.emit(action, { id: fakeRoomId, message: { text: 'bar', foo: 'baz' } }, error => {
        expect(error.name).to.be.equals('ValidationError');
        client.disconnect();
        done();
      });
    });
  });

  it('should return validation error if invalid sticky message', done => {
    const client = SocketIOClient('http://0.0.0.0:3000');
    client.on('error', done);
    client.on('connect', () => {
      client.emit(action, {
        id: '00000000-0000-0000-0000-000000000000',
        message: { type: 'sticky', foo: 'bar' }
      }, error => {
        expect(error.name).to.be.equals('ValidationError');
        client.disconnect();
        done();
      });
    });
  });

  it('should return validation error if invalid room id', done => {
    const client = SocketIOClient('http://0.0.0.0:3000');
    client.on('error', done);
    client.on('connect', () => {
      client.emit(action, { id: '1', message: { text: 'foo' } }, error => {
        expect(error.name).to.be.equals('ValidationError');
        expect(error.message).to.be.equals('message.send validation failed:' +
          ' data.id should match format "uuid"');
        client.disconnect();
        done();
      });
    });
  });

  it('should return not found error if room not found', done => {
    const client = SocketIOClient('http://0.0.0.0:3000');
    client.on('error', done);
    client.on('connect', () => {
      client.emit(action, { id: fakeRoomId, message: { text: 'foo' } }, error => {
        expect(error.name).to.be.equals('NotFoundError');
        expect(error.message).to.be.equals('Not Found:' +
          ' "Room #00000000-0000-0000-0000-000000000000 not found"');
        client.disconnect();
        done();
      });
    });
  });

  it('should return not permitted error if not in the room', done => {
    const client = SocketIOClient('http://0.0.0.0:3000');
    client.on('error', done);
    client.on('connect', () => {
      client.emit(action, { id: this.room.id.toString(), message: { text: 'foo' } }, error => {
        expect(error.name).to.be.equals('NotPermittedError');
        expect(error.message).to.be.equals('An attempt was made to perform an operation that' +
          ' is not permitted: Not in the room');
        client.disconnect();
        done();
      });
    });
  });

  it('should return error if sticky message and user is not admin', done => {
    const client = SocketIOClient('http://0.0.0.0:3000', { query: `token=${this.userToken}` });

    client.on('error', done);
    client.on('connect', () => {
      client.emit('chat.rooms.join', { id: this.room.id.toString() }, error => {
        expect(error).to.be.equals(null);

        const message = { type: 'sticky', text: 'foo' };

        client.emit(action, { id: this.room.id.toString(), message }, error => {
          expect(error.name).to.be.equals('NotPermittedError');
          expect(error.message).to.be.equals('An attempt was made to perform an operation' +
            ' that is not permitted: Access denied for message type "sticky"');
          client.disconnect();
          done();
        });
      });
    });
  });

  it('should send message', done => {
    const client = SocketIOClient('http://0.0.0.0:3000', { query: `token=${this.adminToken}` });

    client.on('error', done);
    client.on('connect', () => {
      client.emit('chat.rooms.join', { id: this.room.id.toString() }, error => {
        expect(error).to.be.equals(null);
        client.emit(action, { id: this.room.id.toString(), message: { text: 'foo' } }, (error, response) => {
          expect(error).to.be.equals(null);
          expect(response).to.have.property('user').that.is.an('object');
          expect(response.message).to.be.deep.equals({ text: 'foo' });
          client.disconnect();
          done();
        });
      });
    });
  });

  it('should save message', done => {
    const client = SocketIOClient('http://0.0.0.0:3000', { query: `token=${this.adminToken}` });
    const roomId = this.room.id.toString();

    client.on('error', done);
    client.on('connect', () => {
      client.emit('chat.rooms.join', { id: roomId }, () => {
        client.emit(action, { id: roomId, message: { text: 'foo' } }, () => {
          client.emit(action, { id: roomId, message: { text: 'bar' } }, () => {
            client.emit(action, { id: roomId, message: { text: 'baz' } }, () => {
              this.chat.services.message
                .find({ roomId }, { $desc: 'createdAt' }, 2)
                .then(messages => {
                  const [first, second] = messages;

                  assert.ok(first.id);
                  assert.equal(first.text, 'baz');
                  assert.equal(first.roomId, roomId);
                  assert.ok(first.createdAt);
                  assert.equal(first.userId, 'test@test.ru');
                  assert.equal(first.user.id, 'test@test.ru');
                  assert.equal(first.user.name, 'Root Admin');
                  assert.deepEqual(first.user.roles, ['admin', 'root']);
                  assert.equal(first.properties, null);
                  assert.equal(first.attachments, null);

                  assert.ok(second.id);
                  assert.equal(second.text, 'bar');
                  assert.equal(second.roomId, roomId);
                  assert.ok(second.createdAt);
                  assert.equal(second.userId, 'test@test.ru');
                  assert.equal(second.user.id, 'test@test.ru');
                  assert.equal(second.user.name, 'Root Admin');
                  assert.deepEqual(second.user.roles, ['admin', 'root']);
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

  it('should emit when send message', done => {
    const client1 = SocketIOClient('http://0.0.0.0:3000', { query: `token=${this.adminToken}` });
    const client2 = SocketIOClient('http://0.0.0.0:3000', { query: `token=${this.userToken}` });
    const roomId = this.room.id.toString();

    client1.on(`message.send.${roomId}`, response => {
      expect(response).to.have.property('user').that.is.an('object');
      expect(response.message).to.be.deep.equals({ text: 'foo' });
      client1.disconnect();
      client2.disconnect();
      done();
    });

    client1.on('connect', () => {
      client1.emit('chat.rooms.join', { id: roomId }, error => {
        expect(error).to.be.equals(null);
        client2.emit('chat.rooms.join', { id: roomId }, error => {
          expect(error).to.be.equals(null);
          client2.emit(action, { id: roomId, message: { text: 'foo' } }, error => {
            expect(error).to.be.equals(null);
          });
        });
      });
    });
  });

  after('delete room', () => this.room.deleteAsync());
  after('shutdown chat', () => this.chat.close());
});
