const assert = require('assert');
const Chat = require('../../src');
const { login } = require('../helpers/users');
const { create } = require('../helpers/messages');
const request = require('./../helpers/request');

const chat = new Chat(global.SERVICES);
const fakeRoomId = '00000000-0000-0000-0000-000000000000';
const messages = ['foo', 'bar', 'baz', 'qux'];
const uri = 'http://0.0.0.0:3000/api/chat/messages/pins-history';

describe('messages.pins-history', function suite() {
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
      .tap(({ jwt }) => (this.userToken = jwt))
  );

  before('create room', () =>
    chat.services.room
      .create({ name: 'test room', createdBy: 'admin@foo.com' })
      .tap((createdRoom) => {
        this.room = createdRoom;
        this.roomId = createdRoom.id.toString();
      })
  );

  before('create second room', () =>
    chat.services.room
      .create({ name: 'second room', createdBy: 'admin@foo.com' })
      .tap((createdRoom) => {
        this.secondRoom = createdRoom;
        this.secondRoomId = createdRoom.id.toString();
      })
  );

  before('create messages', () => {
    this.pins = {};

    return create(chat.services.message, messages, { roomId: this.room.id })
      .mapSeries(message => chat.services.pin.pin(this.room.id, message, this.admin))
      .each(pin => (this.pins[pin.message.text] = pin));
  });

  it('should not be able to get pins history if not authorized', () =>
    request(uri, { roomId: this.roomId })
      .then((response) => {
        const { body, statusCode } = response;

        assert.equal(statusCode, 400);
        assert.equal(body.statusCode, 400);
        assert.equal(body.error, 'Bad Request');
        assert.equal(body.message, 'messages.pins-history validation failed:' +
          ' data should have required property \'token\'');
        assert.equal(body.name, 'ValidationError');
      })
  );

  it('should not be able to get pins history if not admin', () =>
    request(uri, { roomId: this.roomId, token: this.userToken })
      .then((response) => {
        const { body, statusCode } = response;

        assert.equal(statusCode, 403);
        assert.equal(body.statusCode, 403);
        assert.equal(body.error, 'Forbidden');
        assert.equal(body.message, 'An attempt was made to perform an operation that'
          + ` is not permitted: Access to room #${this.roomId} is denied`);
        assert.equal(body.name, 'NotPermittedError');
      })
  );

  it('should not be able to pin in non existent room', () =>
    request(uri, { roomId: fakeRoomId, token: this.adminToken })
      .then((response) => {
        const { body, statusCode } = response;

        assert.equal(statusCode, 404);
        assert.equal(body.statusCode, 404);
        assert.equal(body.error, 'Not Found');
        assert.equal(body.message, 'Not Found:' +
          ' "Room #00000000-0000-0000-0000-000000000000 not found"');
        assert.equal(body.name, 'NotFoundError');
      })
  );

  it('should be able to return pins history', () =>
    request(uri, { roomId: this.roomId, token: this.adminToken })
      .then((response) => {
        const { meta, data } = response.body;
        const [fourth, third, second, first] = data;

        assert.equal(data.length, 4);
        assert.equal(meta.last, first.attributes.pinnedAt);
        assert.equal(meta.count, 4);
        assert.equal(fourth.attributes.roomId, this.roomId);
        assert.equal(fourth.attributes.message.text, 'qux');
        assert.ok(fourth.attributes.message.createdAt);
        assert.equal(third.attributes.roomId, this.roomId);
        assert.equal(third.attributes.message.text, 'baz');
        assert.ok(third.attributes.message.createdAt);
        assert.equal(second.attributes.roomId, this.roomId);
        assert.equal(second.attributes.message.text, 'bar');
        assert.ok(second.attributes.message.createdAt);
        assert.equal(first.attributes.roomId, this.roomId);
        assert.equal(first.attributes.message.text, 'foo');
        assert.ok(first.attributes.message.createdAt);
      })
  );

  it('should be able to paginate', () => {
    const params = {
      before: this.pins.qux.pinnedAt.toISOString(),
      limit: 2,
      roomId: this.roomId,
      token: this.adminToken,
    };

    return request(uri, params)
      .then((response) => {
        const { meta, data } = response.body;
        const [second, first] = data;

        assert.equal(data.length, 2);
        assert.equal(meta.before, this.pins.qux.pinnedAt.toISOString());
        assert.equal(meta.count, 2);
        assert.equal(meta.last, first.attributes.pinnedAt);
        assert.equal(second.attributes.roomId, params.roomId);
        assert.equal(second.attributes.message.text, 'baz');
        assert.equal(first.attributes.roomId, params.roomId);
        assert.equal(first.attributes.message.text, 'bar');
      });
  });

  it('should be able to paginate last item', () => {
    const params = {
      before: this.pins.bar.pinnedAt.toISOString(),
      limit: 2,
      roomId: this.roomId,
      token: this.adminToken,
    };

    return request(uri, params)
      .then((response) => {
        const { meta, data } = response.body;
        const [first] = data;

        assert.equal(data.length, 1);
        assert.equal(meta.before, this.pins.bar.pinnedAt.toISOString());
        assert.equal(meta.count, 1);
        assert.equal(meta.last, first.attributes.pinnedAt);
        assert.equal(first.attributes.roomId, this.roomId);
        assert.equal(first.attributes.message.text, 'foo');
      });
  });

  it('should be able to get empty collection if room hasn\'t pins', () => {
    const params = {
      roomId: this.secondRoomId,
      token: this.adminToken,
    };

    return request(uri, params)
      .then((response) => {
        const { meta, data } = response.body;
        assert.equal(meta.count, 0);
        assert.deepEqual(data, []);
      });
  });

  after('shutdown chat', () => chat.close());
});
