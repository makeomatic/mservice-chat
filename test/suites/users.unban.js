const assert = require('assert');
const Chat = require('../../src');
const { isISODate } = require('../helpers/asserts');
const { login } = require('../helpers/users');
const request = require('../helpers/request');
const socketIOClient = require('socket.io-client');

const chat = new Chat(global.SERVICES);
const uri = 'http://0.0.0.0:3000/api/chat/users/unban';

describe('users.unban', function suite() {
  before('start up chat', () => chat.connect());

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

  before('create room ban', () => {
    const bannedUser = { id: 'user@foo.com', name: 'User User', roles: ['user'] };
    const admin = { id: 'admin@foo.com', name: 'Admin Admin', roles: ['admin'] };

    return chat.services.ban.add(this.room.id, bannedUser, admin, 'foo');
  });

  before('create room second ban', () => {
    const bannedUser = { id: 'second.user@foo.com', name: 'SecondUser User', roles: ['user'] };
    const admin = { id: 'admin@foo.com', name: 'Admin Admin', roles: ['admin'] };

    return chat.services.ban.add(this.room.id, bannedUser, admin, 'foo');
  });

  before('create second room', () => {
    const params = { name: 'second test room', createdBy: 'admin@foo.com' };

    return chat.services.room
      .create(params)
      .tap((createdRoom) => {
        this.secondRoom = createdRoom;
        this.secondRoomId = createdRoom.id.toString();
      });
  });

  before('create second room ban', () => {
    const bannedUser = { id: 'admin@foo.com', name: 'Admin Admin', roles: ['admin'] };
    const admin = { id: 'root@foo.com', name: 'Root User', roles: ['admin', 'root'] };

    return chat.services.ban.add(this.room.id, bannedUser, admin, 'bar');
  });

  it('should not be able to unban if not authorized', () => {
    const params = { id: 'user@foo.com', roomId: this.roomId };

    return request(uri, params)
      .then((response) => {
        const { body, statusCode } = response;

        assert.equal(statusCode, 400);
        assert.equal(body.statusCode, 400);
        assert.equal(body.error, 'Bad Request');
        assert.equal(body.message, 'users.unban validation failed:' +
          ' data should have required property \'token\'');
        assert.equal(body.name, 'ValidationError');
      });
  });

  it('should not be able to unban if not admin', () => {
    const params = { id: 'user@foo.com', roomId: this.roomId, token: this.userToken };

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

  it('should not be able to unban in non existent room', () => {
    const params = {
      id: 'user@foo.com',
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

  it('should not be able to unban self', () => {
    const params = {
      id: 'admin@foo.com',
      roomId: this.secondRoomId,
      token: this.adminToken,
    };

    return request(uri, params)
      .then((response) => {
        const { body, statusCode } = response;

        assert.equal(statusCode, 403);
        assert.equal(body.statusCode, 403);
        assert.equal(body.error, 'Forbidden');
        assert.equal(body.message, 'An attempt was made to perform an operation that'
          + ' is not permitted: Can\'t unban yourself');
        assert.equal(body.name, 'NotPermittedError');
      });
  });

  it('should be able to unban user', () => {
    const params = { id: 'user@foo.com', roomId: this.roomId, token: this.adminToken };

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
          roles: ['user'],
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
      .then((ban) => {
        assert.equal(ban, null);
      });
  });

  it('should not be able to ban user if not banned', () => {
    const params = { id: 'user@foo.com', roomId: this.roomId, token: this.adminToken };

    return request(uri, params)
      .then((response) => {
        const { body, statusCode } = response;

        assert.equal(statusCode, 403);
        assert.equal(body.statusCode, 403);
        assert.equal(body.error, 'Forbidden');
        assert.equal(body.message, 'An attempt was made to perform an operation that'
          + ' is not permitted: User #user@foo.com isn\'t banned');
        assert.equal(body.name, 'NotPermittedError');
      });
  });

  it('should be able to broadcast when unban an user', (done) => {
    const client = socketIOClient('http://0.0.0.0:3000', { query: `token=${this.userToken}` });
    const params = {
      id: 'second.user@foo.com',
      roomId: this.roomId,
      token: this.adminToken,
    };

    client.on('error', done);
    client.on('connect', () => {
      client.emit('chat.rooms.join', { id: this.roomId }, () => {
        client.on(`users.unban.${this.roomId}`, (response) => {
          const { attributes } = response.data;

          assert.equal(attributes.roomId, this.roomId);
          assert.equal(attributes.userId, 'second.user@foo.com');
          assert.deepEqual(attributes.user, {
            id: 'second.user@foo.com',
            name: 'SecondUser User',
            roles: ['user'],
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

  after('shutdown chat', () => chat.close());

  after('delete room', () => this.room.deleteAsync());
});
