const { expect } = require('chai');
const request = require('./../helpers/request');
const Chat = require('../../src');

const chat = new Chat(global.SERVICES);
const uri = 'http://0.0.0.0:3000/api/chat/rooms/list';

describe('rooms.list', function testSuite() {
  before('start up a chat', () => chat.connect());

  before('create first room', () => {
    const params = { name: 'first room', createdBy: 'test@test.ru' };

    return chat.services.room
      .create(params)
      .then(room => (this.firstRoom = room));
  });

  before('create second room', () => {
    const params = { name: 'second room', createdBy: 'test@test.ru' };

    return chat.services.room
      .create(params)
      .then(room => (this.secondRoom = room));
  });

  it('should return list of rooms', (done) => {
    request(uri)
      .then((response) => {
        expect(response.statusCode).to.be.equals(200);
        expect(response.body.length).to.be.equals(2);
        done();
      });
  });

  after('delete first room', () => this.firstRoom.deleteAsync());
  after('delete second room', () => this.secondRoom.deleteAsync());
  after('shutdown chat', () => chat.close());
});
