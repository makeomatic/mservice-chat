const assert = require('assert');
const socketIOClient = require('socket.io-client');
const Chat = require('../../src');
const { login } = require('../helpers/users');

const action = 'chat.rooms.size';
const chat = new Chat(global.SERVICES);

describe('rooms.size', function testSuite() {
  before('start up chat', () => chat.connect());

  before('login user', () => login(chat.amqp, 'user@foo.com', 'userpassword000000')
    .tap(({ jwt }) => (this.userToken = jwt)));

  before('create room', () => chat.services.room
    .create({ name: 'test', createdBy: 'admin@foo.com' })
    .tap((room) => {
      this.room = room;
      this.roomId = room.id.toString();
    }));

  it('should be able to return number of users in the room including guests', (done) => {
    const client1 = socketIOClient('http://0.0.0.0:3000', { query: `token=${this.userToken}` });
    const client2 = socketIOClient('http://0.0.0.0:3000');
    const { roomId } = this;

    client1.on('error', done);
    client2.on('error', done);

    client1.on('connect', () => {
      client1.emit('chat.rooms.join', { id: roomId }, () => {
        client2.emit('chat.rooms.join', { id: roomId }, () => {
          client2.emit(action, { roomId }, (err1, res1) => {
            assert.equal(res1.data.attributes.size, 2);
            client2.emit('chat.rooms.leave', { roomId }, () => {
              client2.disconnect();
              client1.emit(action, { roomId }, (err2, res2) => {
                assert.equal(res2.data.attributes.size, 1);
                client1.disconnect();
                done();
              });
            });
          });
        });
      });
    });
  });

  after('shutdown chat', () => chat.close());
});
