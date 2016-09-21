const assert = require('assert');
const Chat = require('../../src');
const { connect, emit } = require('../helpers/socketIO');
const { login } = require('../helpers/users');
const socketIOClient = require('socket.io-client');

const action = 'chat.rooms.leave';
const chat = new Chat(global.SERVICES);

describe('rooms.leave', function testSuite() {
  before('start up chat', () => chat.connect());

  before('login user', () =>
    login(chat.amqp, 'user@foo.com', 'userpassword000000')
      .tap(({ jwt }) => (this.userToken = jwt))
  );

  before('create room', () => {
    const params = { name: 'test', createdBy: 'admin@foo.com' };

    return chat.services.room
      .create(params)
      .then((room) => {
        this.room = room;
        this.roomId = room.id.toString();
      });
  });

  it('should return validation error if invalid room id', (done) => {
    const client = socketIOClient('http://0.0.0.0:3000');
    client.on('error', done);
    client.on('connect', () => {
      client.emit(action, { id: '1' }, (error) => {
        assert.equal(error.name, 'ValidationError');
        assert.equal(error.message, 'rooms.leave validation failed:' +
          ' data.id should match format "uuid"');

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
        assert.equal(error.name, 'NotFoundError');
        assert.equal(error.message, 'Not Found:' +
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
      client.emit(action, { id: this.roomId }, (error) => {
        assert.equal(error.name, 'NotPermittedError');
        assert.equal(error.message, 'An attempt was made to perform an operation that is '
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
      client.emit('chat.rooms.join', { id: this.roomId }, (joinError) => {
        assert.equal(joinError, null);

        client.emit(action, { id: this.roomId }, (error, response) => {
          const { status } = response.meta;

          assert.equal(status, 'success');

          client.disconnect();
          done();
        });
      });
    });
  });

  it('should emit when leave room', (done) => {
    const client1 = socketIOClient('http://0.0.0.0:3000');
    const client2 = socketIOClient('http://0.0.0.0:3000');

    client1.on(`rooms.leave.${this.roomId}`, (response) => {
      const { type, attributes } = response.data;

      assert.equal(type, 'user');
      assert.deepEqual(attributes.roles, []);

      client1.disconnect();
      client2.disconnect();
      done();
    });

    client1.on('connect', () => {
      client1.emit('chat.rooms.join', { id: this.roomId }, () => {
        client2.emit('chat.rooms.join', { id: this.roomId }, () => {
          client2.emit(action, { id: this.roomId });
        });
      });
    });
  });

  it('should be able to remove a participant', () => {
    const client = socketIOClient('http://0.0.0.0:3000', { query: `token=${this.userToken}` });

    return connect(client)
      .then(() => emit(client, 'chat.rooms.join', { id: this.roomId }))
      .then(() => emit(client, action, { id: this.roomId }))
      .then(() => chat.services.participant.findOne({ roomId: this.roomId, id: 'user@foo.com' }))
      .then((participant) => {
        assert.equal(participant, null);
      })
      .tap(() => client.disconnect());
  });

  after('delete room', () => this.room.deleteAsync());

  after('shutdown chat', () => chat.close());
});
