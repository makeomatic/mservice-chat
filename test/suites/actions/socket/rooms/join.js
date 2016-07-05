const { expect } = require('chai');

describe('rooms.join', function testSuite() {
  const SocketIOClient = require('socket.io-client');
  const Chat = require('../../../../../src');

  before('start up chat', () => {
    const chat = this.chat = new Chat(global.SERVICES);
    return chat.connect();
  });

  before('create room', () => {
    return this.chat.services.room.create({
      name: 'test'
    }).then(room => {
      this.room = room
    });
  });

  it('should returns validation error if invalid room id', done => {
    const client = SocketIOClient('http://0.0.0.0:3000/testChat');
    client.on('connect', () => {
      client.emit('rooms.join', { id: '1' }, error => {
        expect(error.name).to.be.equals('ValidationError');
        expect(error.message).to.be.equals('rooms.join validation failed: data.id should match pattern'
          + ' "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"');
        client.disconnect();
        done();
      });
    });
  });

  it('should returns not found error if room is not exists', done => {
    const client = SocketIOClient('http://0.0.0.0:3000/testChat');
    client.on('connect', () => {
      client.emit('rooms.join', { id: '00000000-0000-0000-0000-000000000000' }, error => {
        expect(error.name).to.be.equals('NotFoundError');
        expect(error.message).to.be.equals('Not Found: "Room"');
        client.disconnect();
        done();
      });
    });
  });

  it('should join to room', done => {
    const client = SocketIOClient('http://0.0.0.0:3000/testChat');

    client.on('connect', () => {
      client.emit('rooms.join', { id: this.room.id.toString() }, (error, data) => {
        expect(error).to.be.equals(null);
        expect(data.id).to.be.equals(this.room.id.toString());
        client.disconnect();
        done();
      });
    });
  });

  it('should emit when join to room', done => {
    const client1 = SocketIOClient('http://0.0.0.0:3000/testChat');
    const client2 = SocketIOClient('http://0.0.0.0:3000/testChat');

    client1.on('rooms.join', data => {
      expect(data).to.have.property('user').that.is.an('object');
      expect(data.room.id).to.be.equals(this.room.id.toString());
      client1.disconnect();
      client2.disconnect();
      done();
    });

    client1.on('connect', () => {
      client1.emit('rooms.join', { id: this.room.id.toString() }, () => {
        client2.emit('rooms.join', { id: this.room.id.toString() }, () => {});
      });
    });
  });

  after('delete room', () => this.room.deleteAsync());

  after('shutdown chat', () => this.chat.close());
});
