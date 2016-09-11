const assert = require('assert');
const Chat = require('../../src');
const { create } = require('../helpers/messages');
const { expect } = require('chai');
const socketIOClient = require('socket.io-client');

const action = 'chat.rooms.join';
const chat = new Chat(global.SERVICES);

describe('rooms.join', function testSuite() {
  before('start up chat', () => chat.connect());

  before('create room', () => {
    const params = { name: 'test', createdBy: 'admin@foo.com' };

    return chat.services.room
      .create(params)
      .then(room => (this.room = room));
  });

  before('create messages', () => {
    const messages = ['foo', 'bar'];

    return create(chat.services.message, messages, { roomId: this.room.id });
  });

  it('should return validation error if invalid room id', done => {
    const client = socketIOClient('http://0.0.0.0:3000');

    client.on('error', done);
    client.on('connect', () => {
      client.emit(action, { id: '1' }, error => {
        expect(error.name).to.be.equals('ValidationError');
        expect(error.message).to.be
          .equals('rooms.join validation failed: data.id should match format "uuid"');
        client.disconnect();
        done();
      });
    });
  });

  it('should return not found error if room is not exists', done => {
    const client = socketIOClient('http://0.0.0.0:3000');
    client.on('error', done);
    client.on('connect', () => {
      client.emit(action, { id: '00000000-0000-0000-0000-000000000000' }, error => {
        expect(error.name).to.be.equals('NotFoundError');
        expect(error.message).to.be.equals('Not Found:' +
          ' "Room #00000000-0000-0000-0000-000000000000 not found"');
        client.disconnect();
        done();
      });
    });
  });

  it('should return not permitted error if already in the room', done => {
    const client = socketIOClient('http://0.0.0.0:3000');
    client.on('error', done);
    client.on('connect', () => {
      client.emit(action, { id: this.room.id.toString() }, () => {
        client.emit(action, { id: this.room.id.toString() }, error => {
          expect(error.name).to.be.equals('NotPermittedError');
          expect(error.message).to.be.equals('An attempt was made to perform an operation that is '
            + 'not permitted: Already in the room');
          client.disconnect();
          done();
        });
      });
    });
  });

  it('should join a room', done => {
    const client = socketIOClient('http://0.0.0.0:3000');
    client.on('error', done);
    client.on('connect', () => {
      client.emit(action, { id: this.room.id.toString() }, (error, response) => {
        const { meta, data } = response;

        assert.equal(error, null);
        assert.equal(meta.count, 2);
        assert.equal(data[0].text, 'bar');
        assert.equal(data[1].text, 'foo');

        client.disconnect();
        done();
      });
    });
  });

  it('should emit when join to room', done => {
    const client1 = socketIOClient('http://0.0.0.0:3000');
    const client2 = socketIOClient('http://0.0.0.0:3000');
    const roomId = this.room.id.toString();

    client1.on(`rooms.join.${roomId}`, response => {
      expect(response).to.have.property('user').that.is.an('object');
      client1.disconnect();
      client2.disconnect();
      done();
    });

    client1.on('connect', () => {
      client1.emit(action, { id: roomId }, (firstJoinError) => {
        expect(firstJoinError).to.be.equals(null);
        client2.emit(action, { id: roomId }, (error) => {
          expect(error).to.be.equals(null);
        });
      });
    });
  });

  after('delete room', () => this.room.deleteAsync());
  after('shutdown chat', () => chat.close());
});
