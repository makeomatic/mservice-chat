const assert = require('assert');
const Promise = require('bluebird');
const socketIOClient = require('socket.io-client');

describe('participants.unban', function suite() {
  const Chat = require('../../src');
  const { login } = require('../helpers/users');
  const request = require('../helpers/request');

  const chat = new Chat(global.SERVICES);
  const uri = 'http://0.0.0.0:3000/api/chat/participants/unban';

  before('start up chat', () => chat.connect());

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

  before('create second room', () => {
    const params = { name: 'second test room', createdBy: 'admin@foo.com' };

    return chat.services.room
      .create(params)
      .tap((createdRoom) => {
        this.secondRoom = createdRoom;
        this.secondRoomId = createdRoom.id.toString();
      });
  });

  before('create participants', () => {
    const service = chat.services.participant;
    const root = { id: 'root@foo.com', name: 'Root Admin', roles: ['root'] };
    const admin = { id: 'admin@foo.com', name: 'Admin Admin', roles: ['admin'] };
    const participants = [
      Object.assign({ roomId: this.roomId }, root),
      Object.assign({ roomId: this.roomId }, admin),
      {
        id: 'user@foo.com',
        name: 'User User',
        roles: [],
        roomId: this.roomId,
        bannedBy: admin,
        bannedAt: new Date(),
        reason: 'foo',
      },
      {
        id: 'second.user@foo.com',
        name: 'Second User',
        roles: [],
        roomId: this.roomId,
        bannedBy: admin,
        bannedAt: new Date(),
        reason: 'foo',
      },
      Object.assign({ roomId: this.secondRoomId }, root),
      Object.assign({
        roomId: this.secondRoomId,
        bannedBy: root,
        bannedAt: new Date(),
        reason: 'bar',
      }, admin),
    ];

    return Promise.map(participants, participant => service.create(participant));
  });

  it('should not be able to unban if not authorized', () => {
    const params = { id: 'user@foo.com', roomId: this.roomId };

    return request(uri, params)
      .then((response) => {
        const { body, statusCode } = response;

        assert.equal(statusCode, 400);
        assert.equal(body.statusCode, 400);
        assert.equal(body.error, 'Bad Request');
        assert.equal(body.message, 'participants.unban validation failed:'
          + ' data should have required property \'token\'');
        assert.equal(body.name, 'HttpStatusError');
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
        assert.equal(body.message, 'Not Found:'
          + ' "Room #123e4567-e89b-12d3-a456-426655440000 not found"');
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
        const { id, type, attributes } = body.data;

        assert.equal(statusCode, 200);
        assert.equal(type, 'participant');
        assert.equal(id, 'user@foo.com');
        assert.equal(attributes.roomId, this.roomId);
        assert.equal(attributes.name, 'User User');
        assert.deepEqual(attributes.roles, []);
        assert.equal(attributes.bannedAt, null);
        assert.equal(attributes.bannedBy, null);
        assert.equal(attributes.reason, null);
      })
      .then(() => chat.services.participant.getById(this.roomId, 'user@foo.com'))
      .tap((participant) => {
        assert.equal(participant.roomId, this.roomId);
        assert.equal(participant.id, 'user@foo.com');
        assert.equal(participant.bannedAt, null);
        assert.equal(participant.bannedBy, null);
        assert.equal(participant.reason, null);
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
          + ' is not permitted: Participant #user@foo.com isn\'t banned');
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
        client.on(`participants.unban.${this.roomId}`, (response) => {
          const { id, type, attributes } = response.data;

          assert.equal(type, 'participant');
          assert.equal(id, 'second.user@foo.com');
          assert.equal(attributes.roomId, this.roomId);
          assert.equal(attributes.name, 'Second User');
          assert.deepEqual(attributes.roles, []);
          assert.equal(attributes.bannedAt, null);
          assert.equal(attributes.bannedBy, null);
          assert.equal(attributes.reason, null);

          client.disconnect();
          done();
        });

        request(uri, params);
      });
    });
  });

  after('shutdown chat', () => chat.close());
});
