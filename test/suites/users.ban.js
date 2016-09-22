const assert = require('assert');
const Chat = require('../../src');
const is = require('is');
const { isISODate } = require('../helpers/asserts');
const { login } = require('../helpers/users');
const request = require('../helpers/request');
const socketIOClient = require('socket.io-client');

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
      .tap((createdRoom) => {
        this.room = createdRoom;
        this.roomId = createdRoom.id.toString();
      });
  });

  it('should not be able to ban if not authorized', () => {
    const params = { id: 'user@foo.com', reason: 'foo', roomId: this.roomId };

    return request(uri, params)
      .then((response) => {
        const { body, statusCode } = response;

        assert.equal(statusCode, 400);
        assert.equal(body.statusCode, 400);
        assert.equal(body.error, 'Bad Request');
        assert.equal(body.message, 'users.ban validation failed:' +
          ' data should have required property \'token\'');
        assert.equal(body.name, 'ValidationError');
      });
  });

  it('should not be able to ban without reason', () => {
    const params = {
      id: 'user@foo.com',
      roomId: this.roomId,
      token: this.adminToken,
    };

    return request(uri, params)
      .then((response) => {
        const { body, statusCode } = response;

        assert.equal(statusCode, 400);
        assert.equal(body.statusCode, 400);
        assert.equal(body.error, 'Bad Request');
        assert.equal(body.message, 'users.ban validation failed:' +
          ' data should have required property \'reason\'');
        assert.equal(body.name, 'ValidationError');
      });
  });

  it('should not be able to ban if not admin', () => {
    const params = {
      id: 'second.user@foo.com',
      reason: 'foo',
      roomId: this.roomId,
      token: this.userToken,
    };

    return request(uri, params)
      .then((response) => {
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
      id: 'user@foo.com',
      reason: 'foo',
      roomId: '123e4567-e89b-12d3-a456-426655440000',
      token: this.adminToken,
    };

    return request(uri, params)
      .then((response) => {
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
      id: 'non.existent.user@foo.com',
      reason: 'foo',
      roomId: this.roomId,
      token: this.adminToken,
    };

    return request(uri, params)
      .then((response) => {
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
    const params = {
      id: 'admin@foo.com',
      reason: 'foo',
      roomId: this.roomId,
      token: this.adminToken,
    };

    return request(uri, params)
      .then((response) => {
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
    const params = {
      id: 'root@foo.com',
      reason: 'foo',
      roomId: this.roomId,
      token: this.adminToken,
    };

    return request(uri, params)
      .then((response) => {
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
    const params = {
      id: 'user@foo.com',
      reason: 'foo',
      roomId: this.roomId,
      token: this.adminToken,
    };

    return request(uri, params)
      .then((response) => {
        const { body, statusCode } = response;
        const { type, attributes } = body.data;

        assert.equal(statusCode, 200);
        assert.equal(type, 'ban');
        assert.equal(attributes.roomId, this.roomId);
        assert.equal(attributes.userId, 'user@foo.com');
        assert.deepEqual(attributes.user, {
          id: 'user@foo.com',
          name: 'User User',
          roles: [],
        });
        assert.equal(isISODate(attributes.bannedAt), true);
        assert.deepEqual(attributes.bannedBy, {
          id: 'admin@foo.com',
          name: 'Admin Admin',
          roles: ['admin'],
        });
        assert.equal(attributes.reason, 'foo');
      })
      .then(() => chat.services.ban.findById(this.roomId, 'user@foo.com'))
      .tap((ban) => {
        assert.equal(ban.roomId, this.roomId);
        assert.equal(ban.userId, 'user@foo.com');
        assert.deepEqual(ban.user, {
          id: 'user@foo.com',
          name: 'User User',
          roles: null,
        });
        assert.equal(is.date(ban.bannedAt), true);
        assert.deepEqual(ban.bannedBy, {
          id: 'admin@foo.com',
          name: 'Admin Admin',
          roles: ['admin'],
        });
        assert.equal(ban.reason, 'foo');
      })
      .then(ban => ban.deleteAsync());
  });

  it('should be able to broadcast when ban user', (done) => {
    const client = socketIOClient('http://0.0.0.0:3000', { query: `token=${this.userToken}` });
    const params = {
      id: 'second.user@foo.com',
      reason: 'foo',
      roomId: this.roomId,
      token: this.adminToken,
    };

    client.on('error', done);
    client.on('connect', () => {
      client.emit('chat.rooms.join', { id: this.roomId }, () => {
        client.on(`users.ban.${this.roomId}`, (response) => {
          const { type, attributes } = response.data;

          assert.equal(type, 'ban');
          assert.equal(attributes.roomId, this.roomId);
          assert.equal(attributes.userId, 'second.user@foo.com');
          assert.deepEqual(attributes.user, {
            id: 'second.user@foo.com',
            name: 'SecondUser User',
            roles: [],
          });
          assert.equal(isISODate(attributes.bannedAt), true);
          assert.deepEqual(attributes.bannedBy, {
            id: 'admin@foo.com',
            name: 'Admin Admin',
            roles: ['admin'],
          });
          assert.equal(attributes.reason, 'foo');

          client.disconnect();
          done();
        });

        request(uri, params);
      });
    });
  });

  // depends on previous test
  it('should be able to mark participant as banned', () =>
    chat.services.participant
      .findOne({ roomId: this.roomId, id: 'second.user@foo.com' })
      .then((participant) => {
        assert.equal(participant.id, 'second.user@foo.com');
        assert.equal(participant.banned, true);
      })
  );

  it('should not be able to ban user if already banned', () => {
    const params = {
      id: 'second.user@foo.com',
      reason: 'foo',
      roomId: this.roomId,
      token: this.adminToken,
    };

    return request(uri, params)
      .then((response) => {
        const { body, statusCode } = response;

        assert.equal(statusCode, 403);
        assert.equal(body.statusCode, 403);
        assert.equal(body.error, 'Forbidden');
        assert.equal(body.message, 'An attempt was made to perform an operation that'
          + ' is not permitted: User #second.user@foo.com is already banned');
        assert.equal(body.name, 'NotPermittedError');
      });
  });

  it('should be able to ban admin if root', () => {
    const params = {
      id: 'admin@foo.com',
      reason: 'foo',
      roomId: this.roomId,
      token: this.rootToken,
    };

    return request(uri, params)
      .then((response) => {
        const { body, statusCode } = response;
        const { type, attributes } = body.data;

        assert.equal(statusCode, 200);
        assert.equal(type, 'ban');
        assert.equal(attributes.roomId, this.roomId);
        assert.equal(attributes.userId, 'admin@foo.com');
        assert.deepEqual(attributes.user, {
          id: 'admin@foo.com',
          name: 'Admin Admin',
          roles: ['admin'],
        });
        assert.equal(isISODate(attributes.bannedAt), true);
        assert.deepEqual(attributes.bannedBy, {
          id: 'root@foo.com',
          name: 'Root Admin',
          roles: ['admin', 'root'],
        });
        assert.equal(attributes.reason, 'foo');
      })
      .then(() => chat.services.ban.findById(this.roomId, 'admin@foo.com'))
      .then((ban) => {
        assert.equal(ban.roomId, this.roomId);
        assert.equal(ban.userId, 'admin@foo.com');
        assert.deepEqual(ban.user, {
          id: 'admin@foo.com',
          name: 'Admin Admin',
          roles: ['admin'],
        });
        assert.equal(is.date(ban.bannedAt), true);
        assert.deepEqual(ban.bannedBy, {
          id: 'root@foo.com',
          name: 'Root Admin',
          roles: ['admin', 'root'],
        });
        assert.equal(ban.reason, 'foo');
      });
  });

  after('delete room', () => this.room.deleteAsync());

  after('shutdown chat', () => chat.close());
});
