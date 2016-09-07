const assert = require('assert');
const Chance = require('chance');
const request = require('./../helpers/request');
const SocketIOClient = require('socket.io-client');

const chance = new Chance();
const Chat = require('../../src');

describe('rooms.delete', function testSuite() {
  const chat = new Chat(global.SERVICES);
  const uri = 'http://0.0.0.0:3000/api/chat/messages/delete';
  let adminToken;
  let room;
  let roomService;
  let userId;
  let userToken;

  before('start up chat', () => chat.connect());

  before('create room', () => {
    const params = { name: 'test room', createdBy: 'test@test.ru' };
    roomService = chat.services.room;

    return roomService
      .create(params)
      .tap(createdRoom => {
        room = createdRoom;
      });
  });

  before('login admin', () => {
    const params = {
      username: 'test@test.ru',
      password: 'megalongsuperpasswordfortest',
      audience: '*.localhost'
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
        roles: ['user'],
      },
    };

    return chat.amqp
      .publishAndWait('users.register', params)
      .tap(({ jwt }) => {
        userToken = jwt;
      });
  });

  it('should returns error if invalid `id`', () => {
    return request(uri, { token: adminToken, id: 0, roomId: room.id.toString() })
      .then(({ statusCode, body }) => {
        assert.equal(statusCode, 400);
        assert.equal(body.name, 'ValidationError');
        assert.equal(body.message, 'messages.delete validation failed:' +
          ' data.id should be string');
      });
  });

  it('should returns error if room not found', () => {
    return request(uri, { token: adminToken, id: '0', roomId: room.id.toString() })
      .then(({ statusCode, body }) => {
        assert.equal(statusCode, 404);
        assert.equal(body.name, 'NotFoundError');
        assert.equal(body.message, 'Not Found: "Message #0 not found"');
      });
  });

  it('should returns error user is not message owner', () => {
    const params = {
      userId: 'test@test.ru',
      roomId: room.id,
      text: 'foo',
      user: { id: 'test@test.ru', name: 'Root Admin', roles: ['root'] },
    };

    return chat.services.message
      .create(params)
      .then(message => request(uri, { token: userToken, id: message.id, roomId: room.id.toString() }))
      .then(({ statusCode, body }) => {
        assert.equal(statusCode, 403);
        assert.equal(body.name, 'NotPermittedError');
        assert.equal(body.message, 'An attempt was made to perform an operation that' +
          ' is not permitted: Has not access');
      });
  });

  it('should delete message by user', done => {
    const params = {
      userId,
      roomId: room.id,
      text: 'foo',
      user: { id: userId, name: 'Simple User', roles: ['user'] },
    };
    const client = SocketIOClient('http://0.0.0.0:3000', { query: `token=${userToken}` });

    client.on('error', done);
    client.on('connect', () => {
      client.emit('chat.rooms.join', { id: room.id.toString() }, () => {
        const messageParams = { roomId: room.id.toString(), message: { text: 'foo' } };

        client.emit('chat.messages.send', messageParams, (error, message) => {
          request(uri, { token: userToken, id: message.id, roomId: room.id.toString() })
            .then(({ statusCode, body }) => {
              assert.equal(statusCode, 200);
              assert.equal(body.id, message.id);
              done();
            });
        });
      });
    });
  });

  it('should delete message by admin', done => {
    const params = {
      userId,
      roomId: room.id,
      text: 'foo',
      user: { id: userId, name: 'Simple User', roles: ['user'] },
    };
    const client = SocketIOClient('http://0.0.0.0:3000', { query: `token=${userToken}` });

    client.on('error', done);
    client.on('connect', () => {
      client.emit('chat.rooms.join', { id: room.id.toString() }, () => {
        const messageParams = { roomId: room.id.toString(), message: { text: 'foo' } };

        client.emit('chat.messages.send', messageParams, (error, message) => {
          request(uri, { token: adminToken, id: message.id, roomId: room.id.toString() })
            .then(({ statusCode, body }) => {
              assert.equal(statusCode, 200);
              assert.equal(body.id, message.id);
              done();
            });
        });
      });
    });
  });

  it('should emits event when delete a message', done => {
    const params = {
      userId,
      roomId: room.id,
      text: 'foo',
      user: { id: userId, name: 'Simple User', roles: ['user'] },
    };
    const client = SocketIOClient('http://0.0.0.0:3000', { query: `token=${userToken}` });

    client.on('error', done);
    client.on('connect', () => {
      client.emit('chat.rooms.join', { id: room.id.toString() }, () => {
        const messageParams = { roomId: room.id.toString(), message: { text: 'foo' } };

        client.emit('chat.messages.send', messageParams, (error, message) => {
          client.on(`messages.delete.${room.id}`, result => {
            assert.equal(result.id, message.id);
            done();
          });
          request(uri, { token: userToken, id: message.id, roomId: room.id.toString() });
        });
      });
    });
  });

  after('delete first room', () => room.deleteAsync());
  after('shutdown chat', () => chat.close());
});
