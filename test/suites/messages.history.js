const assert = require('assert');
const Chat = require('../../src');
const { create } = require('../helpers/messages');
const request = require('./../helpers/request');
const { uuid } = require('express-cassandra');

const chat = new Chat(global.SERVICES);
const fakeRoomId = '00000000-0000-0000-0000-000000000000';
const roomId = uuid();
const messages = ['foo', 'bar', 'baz', 'qux'];
const uri = 'http://0.0.0.0:3000/api/chat/messages/history';

describe('messages.history', function suite() {
  before('start up chat', () => chat.connect());
  before('create messages', () => {
    const params = { roomId };

    return create(chat.services.message, messages, params)
      .then((createdMessages) => {
        function reducer(previous, current) {
          previous[current.text] = current;

          return previous;
        }

        this.messages = createdMessages.reduce(reducer, {});
      });
  });

  it('should be able to return message history', () => {
    const params = { roomId: roomId.toString() };

    return request(uri, params)
      .then((response) => {
        const { meta, data } = response.body;
        const [fourth, third, second, first] = data;

        assert.equal(data.length, 4);
        assert.equal(meta.last, first.id);
        assert.equal(meta.count, 4);
        assert.equal(fourth.attributes.roomId, params.roomId);
        assert.equal(fourth.attributes.text, 'qux');
        assert.equal(third.attributes.roomId, params.roomId);
        assert.equal(third.attributes.text, 'baz');
        assert.equal(second.attributes.roomId, params.roomId);
        assert.equal(second.attributes.text, 'bar');
        assert.equal(first.attributes.roomId, params.roomId);
        assert.equal(first.attributes.text, 'foo');
      });
  });

  it('should be able to paginate', () => {
    const params = {
      before: this.messages.qux.id.toString(),
      limit: 2,
      roomId: roomId.toString(),
    };

    return request(uri, params)
      .then((response) => {
        const { meta, data } = response.body;
        const [second, first] = data;

        assert.equal(data.length, 2);
        assert.equal(meta.before, this.messages.qux.id);
        assert.equal(meta.count, 2);
        assert.equal(meta.last, first.id);
        assert.equal(second.attributes.roomId, params.roomId);
        assert.equal(second.attributes.text, 'baz');
        assert.equal(first.attributes.roomId, params.roomId);
        assert.equal(first.attributes.text, 'bar');
      });
  });

  it('should be able to paginate last item', () => {
    const params = {
      before: this.messages.bar.id.toString(),
      limit: 2,
      roomId: roomId.toString(),
    };

    return request(uri, params)
      .then((response) => {
        const { meta, data } = response.body;
        const [first] = data;

        assert.equal(data.length, 1);
        assert.equal(meta.before, this.messages.bar.id);
        assert.equal(meta.count, 1);
        assert.equal(meta.last, first.id);
        assert.equal(first.attributes.roomId, params.roomId);
        assert.equal(first.attributes.text, 'foo');
        assert.equal(first.attributes.user.id, 'user@foo.com');
        assert.equal(first.attributes.user.name, 'User User');
        assert.deepEqual(first.attributes.user.roles, []);
        assert.equal(first.attributes.user.avatar, 'foto.jpg');
      });
  });

  it('should be able to request history from non existen room', () => {
    const params = { roomId: fakeRoomId };

    return request(uri, params)
      .then((response) => {
        const { meta, data } = response.body;

        assert.equal(data.length, 0);
        assert.equal(meta.count, 0);
      });
  });

  after('shutdown chat', () => chat.close());
});
