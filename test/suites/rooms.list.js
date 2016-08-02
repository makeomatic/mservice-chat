const { expect } = require('chai');
const request = require('./../helpers/request');

describe('rooms.list', function testSuite() {
  const Chat = require('../../src');
  const uri = 'http://0.0.0.0:3000/api/chat/rooms/list';

  before('start up a chat', () => {
    const chat = this.chat = new Chat(global.SERVICES);
    return chat.connect();
  });

  before('create first room', () => this.chat.services.room.create({ name: 'first room' })
    .then(room => {
      this.firstRoom = room;
    })
  );

  before('create second room', () => this.chat.services.room.create({ name: 'second room' })
    .then(room => {
      this.secondRoom = room;
    })
  );

  it('should return list of rooms', done => {
    request(uri)
      .then(response => {
        expect(response.statusCode).to.be.equals(200);
        expect(response.body.length).to.be.equals(2);
        done();
      });
  });

  after('delete first room', () => this.firstRoom.deleteAsync());
  after('delete second room', () => this.secondRoom.deleteAsync());
  after('shutdown chat', () => this.chat.close());
});
