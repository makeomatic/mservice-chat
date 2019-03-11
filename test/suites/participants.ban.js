const assert = require('assert');
const is = require('is');
const Promise = require('bluebird');
const socketIOClient = require('socket.io-client');

describe('participants.ban', function suite() {
  const Chat = require('../../src');
  const { isISODate } = require('../helpers/asserts');
  const { login } = require('../helpers/users');
  const request = require('../helpers/request');

  const chat = new Chat(global.SERVICES);
  const uri = 'http://0.0.0.0:3000/api/chat/participants/ban';

  before('start up chat', () => chat.connect());

  before('login root admin', () => login(chat.amqp, 'root@foo.com', 'rootpassword000000')
    .tap(({ jwt }) => (this.rootToken = jwt)));

  before('login admin', () => login(chat.amqp, 'admin@foo.com', 'adminpassword00000')
    .tap(({ jwt }) => (this.adminToken = jwt)));

  before('login user', () => login(chat.amqp, 'user@foo.com', 'userpassword000000')
    .tap(({ jwt }) => (this.userToken = jwt)));

  before('create room', () => {
    const params = { name: 'test room', createdBy: 'admin@foo.com' };

    return chat.services.room
      .create(params)
      .tap((createdRoom) => {
        this.room = createdRoom;
        this.roomId = createdRoom.id.toString();
      });
  });

  before('create participants', () => {
    const service = chat.services.participant;
    const participants = [
      {
        id: 'root@foo.com',
        name: 'Root Admin',
        roles: ['root'],
      },
      {
        id: 'admin@foo.com',
        name: 'Admin Admin',
        roles: ['admin'],
      },
      {
        id: 'user@foo.com',
        name: 'User User',
        roles: [],
      },
      {
        id: 'second.user@foo.com',
        name: 'Second User',
        roles: [],
      },
    ];

    return Promise.map(
      participants,
      participant => service.create(Object.assign({ roomId: this.roomId }, participant))
    );
  });

  it('should not be able to ban if not authorized', () => {
    const params = { id: 'user@foo.com', reason: 'foo', roomId: this.roomId };

    return request(uri, params)
      .then((response) => {
        const { body, statusCode } = response;

        assert.equal(statusCode, 400);
        assert.equal(body.statusCode, 400);
        assert.equal(body.error, 'Bad Request');
        assert.equal(body.message, 'participants.ban validation failed:'
          + ' data should have required property \'token\'');
        assert.equal(body.name, 'HttpStatusError');
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
        assert.equal(body.message, 'participants.ban validation failed:'
          + ' data should have required property \'reason\'');
        assert.equal(body.name, 'HttpStatusError');
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
        assert.equal(body.message, 'Not Found:'
          + ' "Room #123e4567-e89b-12d3-a456-426655440000 not found"');
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
        assert.equal(body.message, 'Not Found:'
          + ' "Participant #non.existent.user@foo.com not found"');
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
        const { type, attributes, id } = body.data;

        assert.equal(statusCode, 200);
        assert.equal(type, 'participant');
        assert.equal(id, 'user@foo.com');
        assert.equal(attributes.roomId, this.roomId);
        assert.equal(attributes.name, 'User User');
        assert.deepEqual(attributes.roles, []);
        assert.equal(isISODate(attributes.lastActivityAt), true);
        assert.equal(isISODate(attributes.bannedAt), true);
        assert.deepEqual(attributes.bannedBy, {
          id: 'admin@foo.com',
          name: 'Admin Admin',
          roles: ['admin'],
        });
        assert.equal(attributes.reason, 'foo');
      })
      .then(() => chat.services.participant.getById(this.roomId, 'user@foo.com'))
      .tap((participant) => {
        assert.equal(participant.roomId, this.roomId);
        assert.equal(participant.id, 'user@foo.com');
        assert.equal(is.date(participant.bannedAt), true);
        assert.deepEqual(participant.bannedBy, {
          id: 'admin@foo.com',
          name: 'Admin Admin',
          roles: ['admin'],
        });
        assert.equal(participant.reason, 'foo');
      });
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
        client.on(`participants.ban.${this.roomId}`, (response) => {
          const { type, attributes, id } = response.data;

          assert.equal(type, 'participant');
          assert.equal(id, 'second.user@foo.com');
          assert.equal(attributes.roomId, this.roomId);
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
        const { type, attributes, id } = body.data;

        assert.equal(statusCode, 200);
        assert.equal(type, 'participant');
        assert.equal(id, 'admin@foo.com');
        assert.equal(attributes.roomId, this.roomId);
        assert.equal(isISODate(attributes.bannedAt), true);
        assert.deepEqual(attributes.bannedBy, {
          id: 'root@foo.com',
          name: 'Root Admin',
          roles: ['admin', 'root'],
        });
        assert.equal(attributes.reason, 'foo');
      });
  });

  after('shutdown chat', () => chat.close());
});
