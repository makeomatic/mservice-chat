const { expect } = require('chai');
const Promise = require('bluebird');

describe('rooms.leave', function testSuite() {
  const SocketIOClient = require('socket.io-client');
  const Chat = require('../../src');
  const action = 'chat.rooms.leave';

  before('start up chat', () => {
    const chat = this.chat = new Chat(global.SERVICES);
    return chat.connect();
  });

  before('create room', () => this.chat.services.room.create({ name: 'test', createdBy: 'test@test.ru' })
    .then(room => {
      this.room = room
    })
  );

  it('should return validation error if invalid room id', done => {
    const client = SocketIOClient('http://0.0.0.0:3000');
    client.on('error', done);
    client.on('connect', () => {
      client.emit(action, { id: '1' }, error => {
        expect(error.name).to.be.equals('ValidationError');
        expect(error.message).to.be
          .equals('rooms.leave validation failed: data.id should match format "uuid"');
        client.disconnect();
        done();
      });
    });
  });

  it('should return not found error if room is not exists', done => {
    const client = SocketIOClient('http://0.0.0.0:3000');
    client.on('error', done);
    client.on('connect', () => {
      client.emit(action, { id: '00000000-0000-0000-0000-000000000000' }, error => {
        expect(error.name).to.be.equals('NotFoundError');
        expect(error.message).to.be.equals('Not Found: "Room #00000000-0000-0000-0000-000000000000 not found"');
        client.disconnect();
        done();
      });
    });
  });

  it('should return not permitted error if not in the room', done => {
    const client = SocketIOClient('http://0.0.0.0:3000');
    client.on('error', done);
    client.on('connect', () => {
      client.emit(action, { id: this.room.id.toString() }, error => {
        expect(error.name).to.be.equals('NotPermittedError');
        expect(error.message).to.be.equals('An attempt was made to perform an operation that is '
          + 'not permitted: Not in the room');
        client.disconnect();
        done();
      });
    });
  });

  it('should leave room', done => {
    const client = SocketIOClient('http://0.0.0.0:3000');
    client.on('error', done);
    client.on('connect', () => {
      client.emit('chat.rooms.join', { id: this.room.id.toString() }, (error) => {
        expect(error).to.be.equals(null);
        client.emit(action, { id: this.room.id.toString() }, (error, response) => {
          expect(error).to.be.equals(null);
          expect(response).to.have.property('user').that.is.an('object');
          client.disconnect();
          done();
        });
      });
    });
  });

  it('should emit when leave room', done => {
    const client1 = SocketIOClient('http://0.0.0.0:3000');
    const client2 = SocketIOClient('http://0.0.0.0:3000');
    const roomId = this.room.id.toString();

    client1.on(`rooms.leave.${roomId}`, response => {
      expect(response).to.have.property('user').that.is.an('object');
      client1.disconnect();
      client2.disconnect();
      done();
    });

    client1.on('connect', () => {
      client1.emit('chat.rooms.join', { id: roomId }, (error) => {
        expect(error).to.be.equals(null);
        client2.emit('chat.rooms.join', { id: roomId }, (error) => {
          expect(error).to.be.equals(null);
          client2.emit(action, { id: roomId }, (error) => {
            expect(error).to.be.equals(null);
          });
        });
      });
    });
  });

  after('delete room', () => this.room.deleteAsync());
  after('shutdown chat', () => this.chat.close());
});
