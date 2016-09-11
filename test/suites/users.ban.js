const assert = require('assert');
const Chat = require('../../src');
const { login } = require('../helpers/users');
const request = require('../helpers/request');

const chat = new Chat(global.SERVICES);
const uri = 'http://0.0.0.0:3000/api/chat/users/ban';

describe('users.ban', function suite() {
  before('start up chat', () => chat.connect());

  before('login root admin', () =>
    login(chat.amqp, 'root@foo.com', 'rootpassword000000')
      .tap(({ jwt }) => (this.rootToken = jwt))
  );

  before('login admin', () =>
    login(chat.amqp, 'admin@foo.com', 'adminpassword00000')
      .tap(({ jwt }) => (this.adminToken = jwt))
  );

  before('login user', () =>
    login(chat.amqp, 'user@foo.com', 'userpassword000000')
      .tap(({ jwt }) => (this.userToken = jwt))
  );

  before('create room', () => {
    const params = { name: 'test room', createdBy: 'admin@foo.com' };

    return chat.services.room
      .create(params)
      .tap(createdRoom => {
        this.room = createdRoom;
        this.roomId = createdRoom.id.toString();
      });
  });

  it('should not be able to ban if not authorized', () => {
    const params = { userId: 'user@foo.com', roomId: this.roomId };

    return request(uri, params)
      .then(response => {
        const { body, statusCode } = response;

        assert.equal(statusCode, 403);
        assert.equal(body.statusCode, 403);
        assert.equal(body.error, 'Forbidden');
        assert.equal(body.message, 'An attempt was made to perform an operation that'
          + ` is not permitted: Access to room #${this.roomId} is denied`);
        assert.equal(body.name, 'NotPermittedError');
      });
  });

  it('should not be able to ban if not admin', () => {
    const params = { userId: 'second.user@foo.com', roomId: this.roomId, token: this.userToken };

    return request(uri, params)
      .then(response => {
        const { body, statusCode } = response;

        assert.equal(statusCode, 403);
        assert.equal(body.statusCode, 403);
        assert.equal(body.error, 'Forbidden');
        assert.equal(body.message, 'An attempt was made to perform an operation that'
          + ` is not permitted: Access to room #${this.roomId} is denied`);
        assert.equal(body.name, 'NotPermittedError');
      });
  });

  it('should not be able to ban in non existent room', () => {
    const params = {
      userId: 'user@foo.com',
      roomId: '123e4567-e89b-12d3-a456-426655440000',
      token: this.adminToken,
    };

    return request(uri, params)
      .then(response => {
        const { body, statusCode } = response;

        assert.equal(statusCode, 404);
        assert.equal(body.statusCode, 404);
        assert.equal(body.error, 'Not Found');
        assert.equal(body.message, 'Not Found:' +
          ' "Room #123e4567-e89b-12d3-a456-426655440000 not found"');
        assert.equal(body.name, 'NotFoundError');
      });
  });

  it('should not be able to ban non existent user', () => {
    const params = {
      userId: 'non.existent.user@foo.com',
      roomId: this.roomId,
      token: this.adminToken,
    };

    return request(uri, params)
      .then(response => {
        const { body, statusCode } = response;

        assert.equal(statusCode, 404);
        assert.equal(body.statusCode, 404);
        assert.equal(body.error, 'Not Found');
        assert.equal(body.message, 'Not Found:' +
          ' "User #non.existent.user@foo.com not found"');
        assert.equal(body.name, 'NotFoundError');
      });
  });

  it('should not be able to ban self', () => {
    const params = { userId: 'admin@foo.com', roomId: this.roomId, token: this.adminToken };

    return request(uri, params)
      .then(response => {
        const { body, statusCode } = response;

        assert.equal(statusCode, 403);
        assert.equal(body.statusCode, 403);
        assert.equal(body.error, 'Forbidden');
        assert.equal(body.message, 'An attempt was made to perform an operation that'
          + ' is not permitted: Can\'t ban yourself');
        assert.equal(body.name, 'NotPermittedError');
      });
  });

  it('should not be able to ban root admin', () => {
    const params = { userId: 'root@foo.com', roomId: this.roomId, token: this.adminToken };

    return request(uri, params)
      .then(response => {
        const { body, statusCode } = response;

        assert.equal(statusCode, 403);
        assert.equal(body.statusCode, 403);
        assert.equal(body.error, 'Forbidden');
        assert.equal(body.message, 'An attempt was made to perform an operation that'
          + ' is not permitted: Can\'t ban root admin');
        assert.equal(body.name, 'NotPermittedError');
      });
  });

  it('should be able to ban user', () => {
    const params = { userId: 'user@foo.com', roomId: this.roomId, token: this.adminToken };

    return request(uri, params)
      .then(response => {
        const { body, statusCode } = response;

        assert.equal(statusCode, 200);
        assert.equal(body.meta.status, 'success');
      })
      .then(() => chat.services.room.getById(this.roomId))
      .then(room => {
        assert.deepEqual(room.banned, ['user@foo.com']);
      });
  });

  it('should not be able to ban user if already banned', () => {
    const params = { userId: 'user@foo.com', roomId: this.roomId, token: this.adminToken };

    return request(uri, params)
      .then(response => {
        const { body, statusCode } = response;

        assert.equal(statusCode, 403);
        assert.equal(body.statusCode, 403);
        assert.equal(body.error, 'Forbidden');
        assert.equal(body.message, 'An attempt was made to perform an operation that'
          + ' is not permitted: User #user@foo.com is already banned');
        assert.equal(body.name, 'NotPermittedError');
      });
  });

  it('should be able to ban admin if root', () => {
    const params = { userId: 'admin@foo.com', roomId: this.roomId, token: this.rootToken };

    return request(uri, params)
      .then(response => {
        const { body, statusCode } = response;

        assert.equal(statusCode, 200);
        assert.equal(body.meta.status, 'success');
      })
      .then(() => chat.services.room.getById(this.roomId))
      .then(room => {
        assert.deepEqual(room.banned, ['admin@foo.com', 'user@foo.com']);
      });
  });

  after('shutdown chat', () => chat.close());

  after('delete room', () => this.room.deleteAsync());
});
