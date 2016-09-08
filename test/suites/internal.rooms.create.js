const assert = require('assert');
const Chat = require('../../src');

describe('The `internal.rooms.create` action', function suite() {
  const chat = new Chat(global.SERVICES);

  before('start up chat', () => chat.connect());
  after('shutdown chat', () => chat.close());

  it('should returns error if request is not valid', () => {
    const { amqp } = chat;

    return amqp.publishAndWait('chat.internal.rooms.create', {})
      .reflect()
      .then(inspection => {
        assert.equal(inspection.isFulfilled(), false);

        const response = inspection.error();

        assert.equal(response.code, 400);
        assert.equal(response.name, 'ValidationError');
        assert.equal(
          response.message,
          'internal.rooms.create validation failed: data should have required property \'name\',' +
            ' data should have required property \'createdBy\''
        );
      });
  });

  it('should create a room', () => {
    const { amqp } = chat;
    const roomParams = {
      name: 'Test Room',
      createdBy: 'test@gmail.com',
    };

    return amqp.publishAndWait('chat.internal.rooms.create', roomParams)
      .reflect()
      .then(inspection => {
        assert.equal(inspection.isFulfilled(), true);

        const response = inspection.value();

        assert.equal(response.createdBy, 'test@gmail.com');
        assert.equal(response.name, 'Test Room');
        assert.ok(response.id);
        assert.ok(response.createdAt);

        return response.id;
      })
      .then(id => chat.services.room.getById(id))
      .then(room => {
        assert.equal(room.createdBy, 'test@gmail.com');
        assert.equal(room.name, 'Test Room');
        assert.ok(room.id);
        assert.ok(room.createdAt);

        return room.deleteAsync();
      });
  });
});
