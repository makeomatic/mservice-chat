const assert = require('assert');
const Chat = require('../../src');
const { login } = require('../helpers/users');
const { create } = require('../helpers/messages');
const request = require('../helpers/request');
const socketIOClient = require('socket.io-client');

const chat = new Chat(global.SERVICES);
const uri = 'http://0.0.0.0:3000/api/chat/messages/pin';

describe('messages.pin', function suite() {
  before('start up chat', () => chat.connect());

  before('login admin', () =>
    login(chat.amqp, 'admin@foo.com', 'adminpassword00000')
      .tap(({ jwt }) => (this.adminToken = jwt))
  );

  before('login user', () =>
    login(chat.amqp, 'user@foo.com', 'userpassword000000')
      .tap(({ jwt }) => (this.userToken = jwt))
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

  before('create messages', () => {
    const messages = ['foo', 'bar'];
    const user = { id: 'admin@foo.com', name: 'Admin Admin', roles: ['admin'] };

    return create(chat.services.message, messages, { roomId: this.room.id, user })
      .spread((message, secondMessage) => {
        this.message = message;
        this.messageId = message.id.toString();
        this.secondMessage = secondMessage;
        this.secondMessageId = secondMessage.id.toString();
      });
  });

  it('should not be able to pin if not authorized', () => {
    const params = { id: this.messageId, roomId: this.roomId };

    return request(uri, params)
      .then((response) => {
        const { body, statusCode } = response;

        assert.equal(statusCode, 400);
        assert.equal(body.statusCode, 400);
        assert.equal(body.error, 'Bad Request');
        assert.equal(body.message, 'messages.pin validation failed:' +
          ' data should have required property \'token\'');
        assert.equal(body.name, 'ValidationError');
      });
  });

  it('should not be able to pin if not admin', () => {
    const params = { id: this.messageId, roomId: this.roomId, token: this.userToken };

    return request(uri, params)
      .then((response) => {
        const { body, statusCode } = response;

        assert.equal(statusCode, 403);
        assert.equal(body.statusCode, 403);
        assert.equal(body.error, 'Forbidden');
        assert.equal(body.message, 'An attempt was made to perform an operation that'
          + ` is not permitted: Access to room #${this.roomId} is denied`);
        assert.equal(body.name, 'NotPermittedError');
      });
  });

  it('should not be able to pin in non existent room', () => {
    const params = {
      id: this.messageId,
      roomId: '123e4567-e89b-12d3-a456-426655440000',
      token: this.adminToken,
    };

    return request(uri, params)
      .then((response) => {
        const { body, statusCode } = response;

        assert.equal(statusCode, 404);
        assert.equal(body.statusCode, 404);
        assert.equal(body.error, 'Not Found');
        assert.equal(body.message, 'Not Found:' +
          ' "Room #123e4567-e89b-12d3-a456-426655440000 not found"');
        assert.equal(body.name, 'NotFoundError');
      });
  });

  it('should not be able to pin non existent message', () => {
    const params = { id: '12345', roomId: this.roomId, token: this.adminToken };

    return request(uri, params)
      .then((response) => {
        const { body, statusCode } = response;

        assert.equal(statusCode, 404);
        assert.equal(body.statusCode, 404);
        assert.equal(body.error, 'Not Found');
        assert.equal(body.message, 'Not Found: "Message #12345 not found"');
        assert.equal(body.name, 'NotFoundError');
      });
  });

  it('should be able to pin first message', () => {
    const params = { id: this.messageId, roomId: this.roomId, token: this.adminToken };

    return request(uri, params)
      .then((response) => {
        const { body, statusCode } = response;
        const data = body.data.attributes;

        assert.equal(statusCode, 200);
        assert.equal(body.data.type, 'pin');
        assert.equal(body.data.id.startsWith(this.roomId), true);
        assert.equal(data.messageId, this.messageId);
        assert.equal(data.message.id, this.messageId);
        assert.equal(data.message.text, 'foo');
        assert.deepEqual(data.message.user, {
          id: 'admin@foo.com',
          name: 'Admin Admin',
          roles: ['admin'],
        });
        assert.equal(data.roomId, this.roomId);
        assert.ok(data.pinnedAt);
        assert.deepEqual(data.pinnedBy, {
          id: 'admin@foo.com',
          name: 'Admin Admin',
          roles: ['admin'],
        });
        assert.equal(data.unpinnedAt, undefined);
        assert.equal(data.unpinnedBy, undefined);
      })
      .then(() => chat.services.pin.find({ roomId: this.roomId }))
      .then((pins) => {
        assert.equal(pins.length, 1);

        assert.equal(pins[0].messageId, this.messageId);
        assert.equal(pins[0].message.id, this.messageId);
        assert.equal(pins[0].message.text, 'foo');
        assert.deepEqual(pins[0].message.user, {
          id: 'admin@foo.com',
          name: 'Admin Admin',
          roles: ['admin'],
        });
        assert.equal(pins[0].roomId, this.roomId);
        assert.ok(pins[0].pinnedAt);
        assert.deepEqual(pins[0].pinnedBy, {
          id: 'admin@foo.com',
          name: 'Admin Admin',
          roles: ['admin'],
        });
        assert.equal(pins[0].unpinnedAt, undefined);
        assert.equal(pins[0].unpinnedBy, undefined);
      });
  });

  it('should be able to pin second message', () => {
    const params = { id: this.secondMessageId, roomId: this.roomId, token: this.adminToken };

    return request(uri, params)
      .then((response) => {
        const { body, statusCode } = response;
        const data = body.data.attributes;

        assert.equal(statusCode, 200);
        assert.equal(data.messageId, this.secondMessageId);
        assert.equal(data.message.id, this.secondMessageId);
        assert.equal(data.message.text, 'bar');
        assert.deepEqual(data.message.user, {
          id: 'admin@foo.com',
          name: 'Admin Admin',
          roles: ['admin'],
        });
        assert.equal(data.roomId, this.roomId);
        assert.ok(data.pinnedAt);
        assert.deepEqual(data.pinnedBy, {
          id: 'admin@foo.com',
          name: 'Admin Admin',
          roles: ['admin'],
        });
        assert.equal(data.unpinnedAt, undefined);
        assert.equal(data.unpinnedBy, undefined);
      })
      .then(() => chat.services.pin.history(this.roomId))
      .then((pins) => {
        const [pin, secondPin] = pins;

        assert.equal(pins.length, 2);
        // pinned pin
        assert.equal(pin.messageId, this.secondMessageId);
        assert.equal(pin.message.id, this.secondMessageId);
        assert.equal(pin.message.text, 'bar');
        assert.deepEqual(pin.message.user, {
          id: 'admin@foo.com',
          name: 'Admin Admin',
          roles: ['admin'],
        });
        assert.equal(pin.roomId, this.roomId);
        assert.ok(pin.pinnedAt);
        assert.deepEqual(pin.pinnedBy, {
          id: 'admin@foo.com',
          name: 'Admin Admin',
          roles: ['admin'],
        });
        assert.equal(pin.unpinnedAt, undefined);
        assert.equal(pin.unpinnedBy, undefined);
        // unpinned pin
        assert.equal(secondPin.messageId, this.messageId);
        assert.equal(secondPin.message.id, this.messageId);
        assert.equal(secondPin.message.text, 'foo');
        assert.deepEqual(secondPin.message.user, {
          id: 'admin@foo.com',
          name: 'Admin Admin',
          roles: ['admin'],
        });
        assert.equal(secondPin.roomId, this.roomId);
        assert.ok(secondPin.pinnedAt);
        assert.deepEqual(secondPin.pinnedBy, {
          id: 'admin@foo.com',
          name: 'Admin Admin',
          roles: ['admin'],
        });
        assert.ok(secondPin.unpinnedAt, undefined);
        assert.deepEqual(secondPin.unpinnedBy, {
          id: 'admin@foo.com',
          name: 'Admin Admin',
          roles: ['admin'],
        });
      });
  });

  it('should be able to broadcast when pin a message', (done) => {
    const client = socketIOClient('http://0.0.0.0:3000', { query: `token=${this.userToken}` });
    const params = { id: this.messageId, roomId: this.roomId, token: this.adminToken };

    client.on('error', done);
    client.on('connect', () => {
      client.emit('chat.rooms.join', { id: this.roomId }, () => {
        client.on(`messages.pin.${this.roomId}`, (response) => {
          const pin = response.data.attributes;

          assert.equal(pin.messageId, this.messageId);
          assert.equal(pin.message.id, this.messageId);
          assert.equal(pin.message.text, 'foo');
          assert.deepEqual(pin.message.user, {
            id: 'admin@foo.com',
            name: 'Admin Admin',
            roles: ['admin'],
          });
          assert.equal(pin.roomId, this.roomId);
          assert.ok(pin.pinnedAt);
          assert.deepEqual(pin.pinnedBy, {
            id: 'admin@foo.com',
            name: 'Admin Admin',
            roles: ['admin'],
          });
          assert.equal(pin.unpinnedAt, undefined);
          assert.equal(pin.unpinnedBy, undefined);

          client.disconnect();
          done();
        });

        request(uri, params);
      });
    });
  });

  after('delete room', () => this.room.deleteAsync());

  after('shutdown chat', () => chat.close());
});
