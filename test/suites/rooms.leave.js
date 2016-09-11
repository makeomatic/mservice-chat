const { expect } = require('chai');
const Chat = require('../../src');
const socketIOClient = require('socket.io-client');

const action = 'chat.rooms.leave';
const chat = new Chat(global.SERVICES);

describe('rooms.leave', function testSuite() {
  before('start up chat', () => chat.connect());

  before('create room', () => {
    const params = { name: 'test', createdBy: 'test@test.ru' };

    return chat.services.room
      .create(params)
      .then(room => (this.room = room));
  });

  it('should return validation error if invalid room id', (done) => {
    const client = socketIOClient('http://0.0.0.0:3000');
    client.on('error', done);
    client.on('connect', () => {
      client.emit(action, { id: '1' }, (error) => {
        expect(error.name).to.be.equals('ValidationError');
        expect(error.message).to.be
          .equals('rooms.leave validation failed: data.id should match format "uuid"');
        client.disconnect();
        done();
      });
    });
  });

  it('should return not found error if room is not exists', (done) => {
    const client = socketIOClient('http://0.0.0.0:3000');
    client.on('error', done);
    client.on('connect', () => {
      client.emit(action, { id: '00000000-0000-0000-0000-000000000000' }, (error) => {
        expect(error.name).to.be.equals('NotFoundError');
        expect(error.message).to.be.equals('Not Found:' +
          ' "Room #00000000-0000-0000-0000-000000000000 not found"');
        client.disconnect();
        done();
      });
    });
  });

  it('should return not permitted error if not in the room', (done) => {
    const client = socketIOClient('http://0.0.0.0:3000');
    client.on('error', done);
    client.on('connect', () => {
      client.emit(action, { id: this.room.id.toString() }, (error) => {
        expect(error.name).to.be.equals('NotPermittedError');
        expect(error.message).to.be.equals('An attempt was made to perform an operation that is '
          + 'not permitted: Not in the room');
        client.disconnect();
        done();
      });
    });
  });

  it('should leave room', (done) => {
    const client = socketIOClient('http://0.0.0.0:3000');
    client.on('error', done);
    client.on('connect', () => {
      client.emit('chat.rooms.join', { id: this.room.id.toString() }, (joinError) => {
        expect(joinError).to.be.equals(null);
        client.emit(action, { id: this.room.id.toString() }, (error, response) => {
          expect(error).to.be.equals(null);
          expect(response).to.have.property('user').that.is.an('object');
          client.disconnect();
          done();
        });
      });
    });
  });

  it('should emit when leave room', (done) => {
    const client1 = socketIOClient('http://0.0.0.0:3000');
    const client2 = socketIOClient('http://0.0.0.0:3000');
    const roomId = this.room.id.toString();

    client1.on(`rooms.leave.${roomId}`, (response) => {
      expect(response).to.have.property('user').that.is.an('object');
      client1.disconnect();
      client2.disconnect();
      done();
    });

    client1.on('connect', () => {
      client1.emit('chat.rooms.join', { id: roomId }, (firstJoinError) => {
        expect(firstJoinError).to.be.equals(null);
        client2.emit('chat.rooms.join', { id: roomId }, (secondJoinError) => {
          expect(secondJoinError).to.be.equals(null);
          client2.emit(action, { id: roomId }, (error) => {
            expect(error).to.be.equals(null);
          });
        });
      });
    });
  });

  after('delete room', () => this.room.deleteAsync());
  after('shutdown chat', () => chat.close());
});
