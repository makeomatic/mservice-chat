const assert = require('assert');
const Chat = require('../../src');
const { create } = require('../helpers/messages');
const { connect, emit } = require('../helpers/socketIO');
const is = require('is');
const { login } = require('../helpers/users');
const { expect } = require('chai');
const socketIOClient = require('socket.io-client');
const Promise = require('bluebird');

const action = 'chat.rooms.join';
const chat = new Chat(global.SERVICES);

describe('rooms.join', function testSuite() {
  before('start up chat', () => chat.connect());

  before('login user', () =>
    login(chat.amqp, 'user@foo.com', 'userpassword000000')
      .tap(({ jwt }) => (this.userToken = jwt))
  );

  before('login second user', () =>
    login(chat.amqp, 'second.user@foo.com', 'seconduserpassword')
      .tap(({ jwt }) => (this.secondUserToken = jwt))
  );

  before('create room', () =>
    chat.services.room
      .create({ name: 'test', createdBy: 'admin@foo.com' })
      .tap((room) => {
        this.room = room;
        this.roomId = room.id.toString();
      })
  );

  before('create messages', () => {
    const messages = ['foo', 'bar'];

    return create(chat.services.message, messages, { roomId: this.room.id })
      .spread((message) => {
        this.message = message;
        this.messageId = message.id.toString();
      });
  });

  before('create pin', () => {
    const admin = { id: 'admin@foo.com', name: 'Admin Admin', roles: ['admin'] };

    return chat.services.pin.pin(this.room.id, this.message, admin);
  });

  it('should return validation error if invalid room id', (done) => {
    const client = socketIOClient('http://0.0.0.0:3000');

    client.on('error', done);
    client.on('connect', () => {
      client.emit(action, { id: '1' }, (error) => {
        expect(error.name).to.be.equals('ValidationError');
        expect(error.message).to.be
          .equals('rooms.join validation failed: data.id should match format "uuid"');
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

  it('should return not permitted error if already in the room', (done) => {
    const client = socketIOClient('http://0.0.0.0:3000');
    client.on('error', done);
    client.on('connect', () => {
      client.emit(action, { id: this.room.id.toString() }, () => {
        client.emit(action, { id: this.room.id.toString() }, (error) => {
          expect(error.name).to.be.equals('NotPermittedError');
          expect(error.message).to.be.equals('An attempt was made to perform an operation that is '
            + 'not permitted: Already in the room');
          client.disconnect();
          done();
        });
      });
    });
  });

  it('should join a room', (done) => {
    const client = socketIOClient('http://0.0.0.0:3000');

    client.on('error', done);
    client.on('connect', () => {
      client.emit(action, { id: this.room.id.toString() }, (error, response) => {
        const { meta, data } = response;
        const [first, second, third] = data;

        assert.equal(error, null);
        assert.equal(meta.count, 2);
        assert.equal(meta.last, second.id);
        assert.equal(first.attributes.text, 'bar');
        assert.equal(second.attributes.text, 'foo');
        assert.equal(third.type, 'pin');
        assert.equal(third.attributes.messageId, this.messageId);

        client.disconnect();
        done();
      });
    });
  });

  it('should emit when join to room', (done) => {
    const client1 = socketIOClient('http://0.0.0.0:3000');
    const client2 = socketIOClient('http://0.0.0.0:3000');
    const roomId = this.room.id.toString();

    client1.on(`rooms.join.${roomId}`, (response) => {
      assert.equal(response.data.type, 'user');
      assert.ok(response.data.attributes.name);

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

  it('should be able to create a participant', () => {
    const client = socketIOClient('http://0.0.0.0:3000', { query: `token=${this.userToken}` });

    return connect(client)
      .then(() => emit(client, action, { id: this.roomId }))
      .then(() => chat.services.participant.findOne({ roomId: this.roomId, id: 'user@foo.com' }))
      .then((participant) => {
        assert.equal(participant.roomId.toString(), this.roomId);
        assert.equal(participant.id, 'user@foo.com');
        assert.ok(participant.joinedAt);
        assert.equal(is.date(participant.lastActivityAt), true);
        assert.equal(participant.name, 'User User');
        assert.deepEqual(participant.roles, null);
        assert.equal(participant.bannedAt, null);
        assert.equal(participant.bannedBy, null);
        assert.equal(participant.reason, null);
      })
      .tap(() => client.disconnect());
  });

  it('should be able to emit "leave" event if client was disconnected', (done) => {
    const { userToken, secondUserToken, roomId } = this;
    const client1 = socketIOClient('http://0.0.0.0:3000', { query: `token=${userToken}` });
    const client2 = socketIOClient('http://0.0.0.0:3000', { query: `token=${secondUserToken}` });

    client1.on(`rooms.leave.${roomId}`, (response) => {
      assert.equal(response.data.id, 'second.user@foo.com');

      client1.disconnect();
      done();
    });

    Promise
      .join(connect(client1), connect(client2))
      .tap(() => Promise.join(
        emit(client1, action, { id: roomId }),
        emit(client2, action, { id: roomId })
      ))
      .tap(() => client2.disconnect());
  });

  after('delete room', () => this.room.deleteAsync());

  after('shutdown chat', () => chat.close());
});
