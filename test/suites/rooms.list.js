const assert = require('assert');
const request = require('./../helpers/request');
const Chat = require('../../src');

const chat = new Chat(global.SERVICES);
const uri = 'http://0.0.0.0:3000/api/chat/rooms/list';

describe('rooms.list', function testSuite() {
  before('start up a chat', () => chat.connect());

  before('create first room', () => {
    const params = { name: 'first room', createdBy: 'admin@foo.com' };

    return chat.services.room
      .create(params)
      .then(room => (this.firstRoom = room));
  });

  before('create second room', () => {
    const params = { name: 'second room', createdBy: 'admin@foo.com' };

    return chat.services.room
      .create(params)
      .then(room => (this.secondRoom = room));
  });

  it('should return list of rooms', () => (
    request(uri)
      .then((response) => {
        assert.equal(response.statusCode, 200);
        assert.equal(response.body.data.length > 1, true);
      })
  ));

  after('delete first room', () => this.firstRoom.deleteAsync());
  after('delete second room', () => this.secondRoom.deleteAsync());
  after('shutdown chat', () => chat.close());
});
