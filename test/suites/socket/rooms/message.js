const { expect } = require('chai');
const Promise = require('bluebird');

describe('rooms.message', function testSuite() {
  const SocketIOClient = require('socket.io-client');
  const Chat = require('../../../../src');

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

  it('should not returns validation error: { "text": "foo" }', done => {
    const client = SocketIOClient('http://0.0.0.0:3000/testChat');
    client.on('connect', () => {
      client.emit('rooms.message', {
        id: '00000000-0000-0000-0000-000000000000',
        message: { text: 'foo' }
      }, error => {
        expect(error.name).to.be.equals('NotPermittedError');
        client.disconnect();
        done();
      });
    });
  });

  it('should not returns validation error: { "text": "foo", "type": "simple" }', done => {
    const client = SocketIOClient('http://0.0.0.0:3000/testChat');
    client.on('connect', () => {
      client.emit('rooms.message', {
        id: '00000000-0000-0000-0000-000000000000',
        message: { text: 'foo', type: 'simple' }
      }, error => {
        expect(error.name).to.be.equals('NotPermittedError');
        client.disconnect();
        done();
      });
    });
  });

  it('should not returns validation error: { "text": "foo", "type": "simple", "color": "red" }', done => {
    const client = SocketIOClient('http://0.0.0.0:3000/testChat');
    client.on('connect', () => {
      client.emit('rooms.message', {
        id: '00000000-0000-0000-0000-000000000000',
        message: { text: 'foo', type: 'color', color: 'red' }
      }, error => {
        expect(error.name).to.be.equals('NotPermittedError');
        client.disconnect();
        done();
      });
    });
  });

  it('should returns validation error: { "color": "red" }', done => {
    const client = SocketIOClient('http://0.0.0.0:3000/testChat');
    client.on('connect', () => {
      client.emit('rooms.message', {
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

  it('should returns validation error: { "type": "color", "text": "foo" }', done => {
    const client = SocketIOClient('http://0.0.0.0:3000/testChat');
    client.on('connect', () => {
      client.emit('rooms.message', {
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

  it('should returns validation error: { "type": "simple", "text": "foo", "color": "red" }', done => {
    const client = SocketIOClient('http://0.0.0.0:3000/testChat');
    client.on('connect', () => {
      client.emit('rooms.message', {
        id: '00000000-0000-0000-0000-000000000000',
        message: { type: 'simple', text: 'foo', color: 'red' }
      }, error => {
        expect(error.name).to.be.equals('ValidationError');
        expect(error.message).to.be.equals('rooms.message validation failed: data.message should NOT have additional properties');
        client.disconnect();
        done();
      });
    });
  });

  it('should returns validation error if invalid room id', done => {
    const client = SocketIOClient('http://0.0.0.0:3000/testChat');
    client.on('connect', () => {
      client.emit('rooms.message', {
        id: '1',
        message: { text: 'foo' }
      }, error => {
        expect(error.name).to.be.equals('ValidationError');
        expect(error.message).to.be.equals('rooms.message validation failed: data.id should match pattern'
          + ' "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"');
        client.disconnect();
        done();
      });
    });
  });

  it('should returns not permitted error if not in the room', done => {
    const client = SocketIOClient('http://0.0.0.0:3000/testChat');
    client.on('connect', () => {
      client.emit('rooms.message', {
        id: '00000000-0000-0000-0000-000000000000',
        message: { text: 'foo' },
      }, error => {
        expect(error.name).to.be.equals('NotPermittedError');
        expect(error.message).to.be.equals('An attempt was made to perform an operation that is '
          + 'not permitted: Not in the room');
        client.disconnect();
        done();
      });
    });
  });

  it.skip('should returns error if message is not simple and user is not admin', done => {
    const client = SocketIOClient('http://0.0.0.0:3000/testChat');
    client.on('connect', () => {
      client.emit('rooms.message', {
        id: this.room.id,
        message: { type: 'color', text: 'foo', color: 'red' },
      }, error => {
        expect(error.name).to.be.equals('NotPermittedError');
        expect(error.message).to.be.equals('An attempt was made to perform an operation that is '
          + 'not permitted: Access denied');
        client.disconnect();
        done();
      });
    });
  });

  it('should send message', done => {
    const client = SocketIOClient('http://0.0.0.0:3000/testChat');

    client.on('connect', () => {
      client.emit('rooms.join', { id: this.room.id.toString() }, () => {
        Promise.delay(100).tap(() => {
          client.emit('rooms.message', {
            id: this.room.id.toString(),
            message: { text: 'foo' }
          }, (error, data) => {
            expect(error).to.be.equals(null);
            expect(data).to.be.equals(true);
            done();
          });
        });
      });
    });
  });

  it('should emit when send message', done => {
    const client1 = SocketIOClient('http://0.0.0.0:3000/testChat');
    const client2 = SocketIOClient('http://0.0.0.0:3000/testChat');

    client1.on('rooms.message', data => {
      expect(data).to.have.property('user').that.is.an('object');
      expect(data.room).to.be.equals(this.room.id.toString());
      expect(data.message).to.be.deep.equals({ text: 'foo', type: 'simple' });
      client1.disconnect();
      client2.disconnect();
      done();
    });

    client1.on('connect', () => {
      client1.emit('rooms.join', { id: this.room.id.toString() }, () => {
        client2.emit('rooms.join', { id: this.room.id.toString() }, () => {
          Promise.delay(100).tap(() => {
            client2.emit('rooms.message', {
              id: this.room.id.toString(),
              message: { text: 'foo' }
            }, () => {});
          });
        });
      });
    });
  });

  after('delete room', () => this.room.deleteAsync());

  after('shutdown chat', () => this.chat.close());
});
