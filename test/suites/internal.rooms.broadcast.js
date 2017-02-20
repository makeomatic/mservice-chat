const assert = require('assert');

describe('internal.rooms.broadcast', function suite() {
  const { connect, emit } = require('../helpers/socketIO');
  const socketIOClient = require('socket.io-client');
  const Chat = require('../../src');

  const chat = new Chat(global.SERVICES);

  before('start up chat', () => chat.connect());

  before('create room', () =>
    chat.services.room
      .create({ name: 'test room', createdBy: 'admin@foo.com' })
      .tap((createdRoom) => {
        this.room = createdRoom;
        this.roomId = createdRoom.id.toString();
      })
  );

  after('shutdown chat', () => chat.close());

  it('should be able return error if request is not valid', () => {
    const { amqp } = chat;

    return amqp
      .publishAndWait('chat.internal.rooms.broadcast', { roomId: this.roomId })
      .reflect()
      .then(inspection => inspection.error())
      .then((response) => {
        assert.equal(response.code, 400);
        assert.equal(response.name, 'ValidationError');
        assert.equal(response.message, 'internal.rooms.broadcast validation failed: data should'
          + ' have required property \'event\', data should have required property \'message\'');
      });
  });

  it('should be able to broadcast message', (done) => {
    const { amqp } = chat;
    const client = socketIOClient('http://0.0.0.0:3000');
    const params = {
      roomId: this.roomId,
      event: 'testEvent',
      message: {
        foo: 'bar',
      },
    };

    client.on(`broadcast.testEvent.${this.roomId}`, (message) => {
      assert.equal(message.foo, 'bar');
      client.disconnect();

      setTimeout(done, 300);
    });

    connect(client)
      .then(() => emit(client, 'chat.rooms.join', { id: this.roomId }))
      .then(() => amqp.publishAndWait('chat.internal.rooms.broadcast', params))
      .then((response) => {
        assert.deepEqual(response, { meta: { status: 'success' } });
        return null;
      })
      .catch(done);
  });
});
