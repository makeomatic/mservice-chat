const { expect } = require('chai');

describe('message', function testSuite() {
  const SocketIOClient = require('socket.io-client');
  const Chat = require('../../src');
  const action = 'api.chat.rooms.message';

  before('start up chat', () => {
    const chat = this.chat = new Chat(global.SERVICES);
    return chat.connect();
  });

  before('create room', () => this.chat.services.room.create({ name: 'test' })
    .then(room => {
      this.room = room
    })
  );

  it('should not return validation error: { "text": "foo" }', done => {
    const client = SocketIOClient('http://0.0.0.0:3000');
    client.on('error', done);
    client.on('connect', () => {
      client.emit('action', {
        action,
        id: '00000000-0000-0000-0000-000000000000',
        message: { text: 'foo' }
      }, error => {
        expect(error.name).to.be.equals('NotFoundError');
        client.disconnect();
        done();
      });
    });
  });

  it('should not return validation error: { "text": "foo", "type": "simple" }', done => {
    const client = SocketIOClient('http://0.0.0.0:3000');
    client.on('error', done);
    client.on('connect', () => {
      client.emit('action', {
        action,
        id: '00000000-0000-0000-0000-000000000000',
        message: { text: 'foo', type: 'simple' }
      }, error => {
        expect(error.name).to.be.equals('NotFoundError');
        client.disconnect();
        done();
      });
    });
  });

  it('should not return validation error: { "text": "foo", "type": "simple", "color": "red" }', done => {
    const client = SocketIOClient('http://0.0.0.0:3000');
    client.on('error', done);
    client.on('connect', () => {
      client.emit('action', {
        action,
        id: '00000000-0000-0000-0000-000000000000',
        message: { text: 'foo', type: 'color', color: 'red' }
      }, error => {
        expect(error.name).to.be.equals('NotFoundError');
        client.disconnect();
        done();
      });
    });
  });

  it('should return validation error: { "color": "red" }', done => {
    const client = SocketIOClient('http://0.0.0.0:3000');
    client.on('error', done);
    client.on('connect', () => {
      client.emit('action', {
        action,
        id: '00000000-0000-0000-0000-000000000000',
        message: { color: 'red' }
      }, error => {
        expect(error.name).to.be.equals('ValidationError');
        expect(error.message).to.be.equals('rooms.message validation failed: data.message should NOT have additional properties, data.message should have required property \'text\'');
        client.disconnect();
        done();
      });
    });
  });

  it('should return validation error: { "type": "color", "text": "foo" }', done => {
    const client = SocketIOClient('http://0.0.0.0:3000');
    client.on('error', done);
    client.on('connect', () => {
      client.emit('action', {
        action,
        id: '00000000-0000-0000-0000-000000000000',
        message: { type: 'color', text: 'foo' }
      }, error => {
        expect(error.name).to.be.equals('ValidationError');
        expect(error.message).to.be.equals('rooms.message validation failed: data.message should have required property \'color\'');
        client.disconnect();
        done();
      });
    });
  });

  it('should return validation error: { "type": "simple", "text": "foo", "color": "red" }', done => {
    const client = SocketIOClient('http://0.0.0.0:3000');
    client.on('error', done);
    client.on('connect', () => {
      client.emit('action', {
        action,
        id: '00000000-0000-0000-0000-000000000000',
        message: { type: 'simple', text: 'foo', color: 'red' }
      }, error => {
        expect(error.name).to.be.equals('ValidationError');
        expect(error.message)
          .to.be.equals('rooms.message validation failed: data.message should NOT have additional properties');
        client.disconnect();
        done();
      });
    });
  });

  it('should return validation error if invalid room id', done => {
    const client = SocketIOClient('http://0.0.0.0:3000');
    client.on('error', done);
    client.on('connect', () => {
      client.emit('action', { action, id: '1', message: { text: 'foo' } }, error => {
        expect(error.name).to.be.equals('ValidationError');
        expect(error.message).to.be.equals('rooms.message validation failed: data.id should match format "uuid"');
        client.disconnect();
        done();
      });
    });
  });

  it('should return not found error if room not found', done => {
    const client = SocketIOClient('http://0.0.0.0:3000');
    client.on('error', done);
    client.on('connect', () => {
      client.emit('action', { action, id: '00000000-0000-0000-0000-000000000000', message: { text: 'foo' } }, error => {
        expect(error.name).to.be.equals('NotFoundError');
        expect(error.message).to.be.equals('Not Found: "Room #00000000-0000-0000-0000-000000000000 not found"');
        client.disconnect();
        done();
      });
    });
  });

  it('should return not permitted error if not in the room');

  it('should return error if message is not simple and user is not admin', done => {
    const client = SocketIOClient('http://0.0.0.0:3000');
    client.on('error', done);
    client.on('connect', () => {
      client.emit('action', { action: 'api.chat.rooms.join', id: this.room.id.toString() }, error => {
        expect(error).to.be.equals(null);
        client.emit('action', { action, id: this.room.id.toString(), message: { type: 'color', text: 'foo', color: 'red' } }, error => {
          expect(error.name).to.be.equals('NotPermittedError');
          expect(error.message).to.be.equals('An attempt was made to perform an operation that is not permitted: Access denied');
          client.disconnect();
          done();
        });
      });
    });
  });

  it('should send message', done => {
    const client = SocketIOClient('http://0.0.0.0:3000');
    client.on('error', done);
    client.on('connect', () => {
      client.emit('action', { action: 'api.chat.rooms.join', id: this.room.id.toString() }, error => {
        expect(error).to.be.equals(null);
        client.emit('action', { action, id: this.room.id.toString(), message: { text: 'foo' } }, (error, response) => {
          expect(error).to.be.equals(null);
          expect(response.message).to.be.deep.equals({ text: 'foo', type: 'simple' });
          done();
        });
      });
    });
  });

  it('should emit when send message', done => {
    const client1 = SocketIOClient('http://0.0.0.0:3000');
    const client2 = SocketIOClient('http://0.0.0.0:3000');

    client1.on('message', response => {
      expect(response).to.have.property('user').that.is.an('object');
      expect(response.room).to.be.equals(this.room.id.toString());
      expect(response.message).to.be.deep.equals({ text: 'foo', type: 'simple' });
      client1.disconnect();
      client2.disconnect();
      done();
    });

    client1.on('connect', () => {
      client1.emit('action', { action: 'api.chat.rooms.join', id: this.room.id.toString() }, error => {
        expect(error).to.be.equals(null);
        client2.emit('action', { action: 'api.chat.rooms.join', id: this.room.id.toString() }, error => {
          expect(error).to.be.equals(null);
          client2.emit('action', { action, id: this.room.id.toString(), message: { text: 'foo' }}, error => {
            expect(error).to.be.equals(null);
          });
        });
      });
    });
  });

  after('delete room', () => this.room.deleteAsync());
  after('shutdown chat', () => this.chat.close());
});
