const assert = require('assert');
const Chance = require('chance');
const socketIOClient = require('socket.io-client');

describe('messages.delete', function testSuite() {
  const { create } = require('../helpers/messages');
  const request = require('./../helpers/request');
  const Chat = require('../../src');

  const chance = new Chance();
  const chat = new Chat(global.SERVICES);
  const uri = 'http://0.0.0.0:3000/api/chat/messages/delete';
  const admin = { id: 'admin@foo.com', name: 'Admin Admin', roles: ['admin'] };
  let adminToken;
  let room;
  let userId;
  let userToken;

  before('start up chat', () => chat.connect());

  before('create room', () => {
    const params = { name: 'test room', createdBy: 'admin@foo.com' };

    return chat.services.room
      .create(params)
      .tap((createdRoom) => {
        room = createdRoom;
      });
  });

  before('login admin', () => {
    const params = {
      username: 'admin@foo.com',
      password: 'adminpassword00000',
      audience: '*.localhost',
    };

    return chat.amqp
      .publishAndWait('users.login', params)
      .tap(({ jwt }) => {
        adminToken = jwt;
      });
  });

  before('login user', () => {
    userId = chance.email();
    const params = {
      username: userId,
      password: 'megalongsuperpasswordfortest',
      audience: '*.localhost',
      metadata: {
        firstName: 'Simple',
        lastName: 'User',
        roles: [],
      },
    };

    return chat.amqp
      .publishAndWait('users.register', params)
      .tap(({ jwt }) => {
        userToken = jwt;
      });
  });

  before('create messages', () => {
    const messages = ['foo'];

    return create(chat.services.message, messages, { roomId: room.id, user: admin })
      .spread((message) => {
        this.message = message;
        this.messageId = message.id.toString();
      });
  });

  before('create pin', () => chat.services.pin.pin(room.id, this.message, admin));

  it('should returns error if invalid `id`', () => {
    const params = { token: adminToken, id: 0, roomId: room.id.toString() };

    return request(uri, params)
      .then(({ statusCode, body }) => {
        assert.equal(statusCode, 400);
        assert.equal(body.name, 'HttpStatusError');
        assert.equal(body.message, 'messages.delete validation failed:'
          + ' data.id should be string');
      });
  });

  it('should returns error if message not found', () => {
    const params = { token: adminToken, id: '0', roomId: room.id.toString() };

    return request(uri, params)
      .then(({ statusCode, body }) => {
        assert.equal(statusCode, 404);
        assert.equal(body.name, 'NotFoundError');
        assert.equal(body.message, 'Not Found: "Message #0 not found"');
      });
  });

  it('should returns error user is not message owner', () => {
    const params = {
      userId: 'admin@foo.com',
      roomId: room.id,
      text: 'foo',
      user: { id: 'admin@foo.com', name: 'Admin Admin', roles: ['admin'] },
    };

    return chat.services.message
      .create(params)
      .then((message) => {
        const requestParams = { token: userToken, id: message.id, roomId: room.id.toString() };

        return request(uri, requestParams);
      })
      .then(({ statusCode, body }) => {
        assert.equal(statusCode, 403);
        assert.equal(body.name, 'NotPermittedError');
        assert.equal(body.message, 'An attempt was made to perform an operation that'
          + ' is not permitted: Has not access');
      });
  });

  it('should delete message by user', (done) => {
    const client = socketIOClient('http://0.0.0.0:3000', { query: `token=${userToken}` });

    client.on('error', done);
    client.on('connect', () => {
      client.emit('chat.rooms.join', { id: room.id.toString() }, () => {
        const messageParams = { roomId: room.id.toString(), message: { text: 'foo' } };

        client.emit('chat.messages.send', messageParams, (error, message) => {
          request(uri, { token: userToken, id: message.data.id, roomId: room.id.toString() })
            .then(({ statusCode, body }) => {
              assert.equal(statusCode, 200);
              assert.equal(body.meta.status, 'success');
              done();
            })
            .catch(done);
        });
      });
    });
  });

  it('should delete message by admin', (done) => {
    const client = socketIOClient('http://0.0.0.0:3000', { query: `token=${userToken}` });

    client.on('error', done);
    client.on('connect', () => {
      client.emit('chat.rooms.join', { id: room.id.toString() }, () => {
        const messageParams = { roomId: room.id.toString(), message: { text: 'foo' } };

        client.emit('chat.messages.send', messageParams, (error, message) => {
          request(uri, { token: adminToken, id: message.data.id, roomId: room.id.toString() })
            .then(({ statusCode, body }) => {
              assert.equal(statusCode, 200);
              assert.equal(body.meta.status, 'success');
              done();
            })
            .catch(done);
        });
      });
    });
  });

  it('should emits event when delete a message', (done) => {
    const client = socketIOClient('http://0.0.0.0:3000', { query: `token=${userToken}` });

    client.on('error', done);
    client.on('connect', () => {
      client.emit('chat.rooms.join', { id: room.id.toString() }, () => {
        const messageParams = { roomId: room.id.toString(), message: { text: 'foo' } };

        client.emit('chat.messages.send', messageParams, (error, message) => {
          client.on(`messages.delete.${room.id.toString()}`, (result) => {
            assert.equal(result.data.type, 'message');

            client.disconnect();
            done();
          });
          request(uri, { token: userToken, id: message.data.id, roomId: room.id.toString() });
        });
      });
    });
  });

  it('should be able to remove last pinned message', () => request(uri, { token: adminToken, id: this.messageId, roomId: room.id.toString() })
    .then(() => chat.services.pin.last(room.id.toString()))
    .then((pin) => {
      assert.equal(pin, null);
    }));

  after('delete first room', () => room.deleteAsync());
  after('shutdown chat', () => chat.close());
});
