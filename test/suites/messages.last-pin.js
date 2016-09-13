const assert = require('assert');
const Chat = require('../../src');
const { create } = require('../helpers/messages');
const request = require('../helpers/request');

const chat = new Chat(global.SERVICES);
const uri = 'http://0.0.0.0:3000/api/chat/messages/last-pin';
const admin = { id: 'admin@foo.com', name: 'Admin Admin', roles: ['admin'] };

describe('messages.last-pin', function suite() {
  before('start up chat', () => chat.connect());

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

    return create(chat.services.message, messages, { roomId: this.room.id, user: admin })
      .spread((message, secondMessage) => {
        this.message = message;
        this.messageId = message.id.toString();
        this.secondMessage = secondMessage;
        this.secondMessageId = secondMessage.id.toString();
      });
  });

  before('create pin', () => chat.services.pin.pin(this.room.id, this.message, admin));

  it('should not be able to get las pin from non existent room', () => {
    const params = { roomId: '123e4567-e89b-12d3-a456-426655440000' };

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

  it('should be able get last pin', () => {
    const params = { roomId: this.roomId };

    return request(uri, params)
      .then((response) => {
        const { body, statusCode } = response;

        assert.equal(statusCode, 200);
        assert.equal(body.data.messageId, this.messageId);
        assert.equal(body.data.message.id, this.messageId);
        assert.equal(body.data.message.text, 'foo');
        assert.deepEqual(body.data.message.user, {
          id: 'admin@foo.com',
          name: 'Admin Admin',
          roles: ['admin'],
        });
        assert.equal(body.data.roomId, this.roomId);
        assert.ok(body.data.pinnedAt);
        assert.deepEqual(body.data.pinnedBy, {
          id: 'admin@foo.com',
          name: 'Admin Admin',
          roles: ['admin'],
        });
      });
  });

  it('should be able get last pin if no one pinned', () => {
    const params = { roomId: this.roomId };

    return chat.services.pin.unpin(this.room.id, admin)
      .then(() => request(uri, params))
      .then((response) => {
        const { body, statusCode } = response;

        assert.equal(statusCode, 200);
        assert.equal(body.data, null);
      });
  });

  after('delete room', () => this.room.deleteAsync());

  after('shutdown chat', () => chat.close());
});
