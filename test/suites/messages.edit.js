const assert = require('assert');
const Chat = require('../../src');
const { create } = require('../helpers/messages');
const is = require('is');
const { isISODate } = require('../helpers/asserts');
const { login } = require('../helpers/users');
const request = require('./../helpers/request');
const socketIOClient = require('socket.io-client');

const chat = new Chat(global.SERVICES);
const uri = 'http://0.0.0.0:3000/api/chat/messages/edit';

describe('messages.edit', function testSuite() {
  before('start up chat', () => chat.connect());

  before('login admin', () =>
    login(chat.amqp, 'admin@foo.com', 'adminpassword00000')
      .tap(({ jwt }) => {
        this.adminToken = jwt;
        this.admin = { id: 'admin@foo.com', name: 'Admin Admin', roles: ['admin'] };
      })
  );

  before('login user', () =>
    login(chat.amqp, 'user@foo.com', 'userpassword000000')
      .tap(({ jwt }) => {
        this.userToken = jwt;
        this.user = { id: 'user@foo.com', name: 'User User', roles: ['user'] };
      })
  );

  before('create room', () =>
    chat.services.room
      .create({ name: 'test room', createdBy: 'admin@foo.com' })
      .tap((createdRoom) => {
        this.room = createdRoom;
        this.roomId = createdRoom.id.toString();
      })
  );

  before('create admin message', () =>
    create(chat.services.message, ['foo'], { roomId: this.room.id, user: this.admin })
      .spread((message) => {
        this.message = message;
        this.messageId = message.id.toString();
      })
  );

  before('create user message', () =>
    create(chat.services.message, ['bar'], { roomId: this.room.id, user: this.user })
      .spread((message) => {
        this.secondMessage = message;
        this.secondMessageId = message.id.toString();
      })
  );

  before('create pin', () => chat.services.pin.pin(this.room.id, this.message, this.admin));

  it('should returns error if invalid `id`', () =>
    request(uri, { token: this.adminToken, id: 0, roomId: this.roomId, text: 'foo' })
      .then(({ statusCode, body }) => {
        assert.equal(statusCode, 400);
        assert.equal(body.name, 'ValidationError');
        assert.equal(body.message, 'messages.edit validation failed:' +
          ' data.id should be string');
      })
  );

  it('should returns error if message not found', () =>
    request(uri, { token: this.adminToken, id: '0', roomId: this.roomId, text: 'foo' })
      .then(({ statusCode, body }) => {
        assert.equal(statusCode, 404);
        assert.equal(body.name, 'NotFoundError');
        assert.equal(body.message, 'Not Found: "Message #0 not found"');
      })
  );

  it('should returns error user is not message owner', () =>
    request(uri, { token: this.userToken, id: this.messageId, roomId: this.roomId, text: 'foo' })
      .then(({ statusCode, body }) => {
        assert.equal(statusCode, 403);
        assert.equal(body.name, 'NotPermittedError');
        assert.equal(body.message, 'An attempt was made to perform an operation that' +
          ' is not permitted: Has not access');
      })
  );

  it('should be able to edit message by user', () => {
    const params = {
      id: this.secondMessageId,
      roomId: this.roomId,
      text: 'baz',
      token: this.userToken,
    };

    return request(uri, params)
      .then(({ statusCode, body }) => {
        assert.equal(statusCode, 200);
        assert.equal(body.meta.status, 'success');
      })
      .then(() => chat.services.message.findOne({ id: this.secondMessageId, roomId: this.roomId }))
      .then((message) => {
        assert.equal(message.text, 'baz');
        assert.equal(is.date(message.editedAt), true);
        assert.equal(message.editedBy.id, 'user@foo.com');
      });
  });

  it('should be able to edit message by admin', () => {
    const params = {
      id: this.secondMessageId,
      roomId: this.roomId,
      text: 'qux',
      token: this.adminToken,
    };

    return request(uri, params)
      .then(({ statusCode, body }) => {
        assert.equal(statusCode, 200);
        assert.equal(body.meta.status, 'success');
      })
      .then(() => chat.services.message.findOne({ id: this.secondMessageId, roomId: this.roomId }))
      .then((message) => {
        assert.equal(message.text, 'qux');
        assert.equal(is.date(message.editedAt), true);
        assert.equal(message.editedBy.id, 'admin@foo.com');
      });
  });

  it('should be able to emit event when edit a message', (done) => {
    const client = socketIOClient('http://0.0.0.0:3000', { query: `token=${this.userToken}` });
    const params = {
      id: this.secondMessageId,
      roomId: this.roomId,
      text: 'quux',
      token: this.userToken,
    };

    client.on('error', done);
    client.on('connect', () => {
      client.emit('chat.rooms.join', { id: this.roomId }, () => {
        client.on(`messages.edit.${this.roomId}`, (result) => {
          assert.equal(result.data.type, 'message');
          assert.equal(result.data.attributes.text, 'quux');
          assert.equal(isISODate(result.data.attributes.editedAt), true);
          assert.equal(result.data.attributes.editedBy.id, 'user@foo.com');

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
