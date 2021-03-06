const assert = require('assert');
const Promise = require('bluebird');
const { uuid } = require('express-cassandra');

describe('participants.list', function suite() {
  const Chat = require('../../src');
  const request = require('./../helpers/request');

  const chat = new Chat(global.SERVICES);
  const fakeRoomId = '00000000-0000-0000-0000-000000000000';
  const roomId = uuid();
  const uri = 'http://0.0.0.0:3000/api/chat/participants/list';

  before('start up chat', () => chat.connect());

  before('create participants', () => {
    const users = [
      { id: 'root@foo.com', name: 'Root Admin', roles: ['root', 'admin'] },
      { id: 'admin@foo.com', name: 'Admin Admin', roles: ['admin'] },
      { id: 'user@foo.com', name: 'User User', roles: [] },
      { id: 'second.user@foo.com', name: 'SecondUser User', roles: [] },
    ];

    return Promise
      .mapSeries(users, user => chat.services.participant.add(roomId, user))
      .then(participants => (this.participants = participants));
  });

  it('should be able to return a list of participants', () => {
    const params = { roomId: roomId.toString() };

    return request(uri, params)
      .then((response) => {
        const { meta, data } = response.body;
        const [first, second, third, fourth] = data;

        assert.equal(meta.last, fourth.attributes.joinedAt);
        assert.equal(meta.count, 4);
        assert.equal(data.length, 4);
        assert.equal(first.attributes.roomId, params.roomId);
        assert.equal(first.id, 'root@foo.com');
        assert.equal(second.attributes.roomId, params.roomId);
        assert.equal(second.id, 'admin@foo.com');
        assert.equal(third.attributes.roomId, params.roomId);
        assert.equal(third.id, 'user@foo.com');
        assert.equal(fourth.attributes.roomId, params.roomId);
        assert.equal(fourth.id, 'second.user@foo.com');
      });
  });

  it('should be able to paginate', () => {
    const params = {
      before: this.participants[0].joinedAt.toString(),
      limit: 2,
      roomId: roomId.toString(),
    };

    return request(uri, params)
      .then((response) => {
        const { meta, data } = response.body;
        const [first, second] = data;

        assert.equal(meta.before, this.participants[0].joinedAt.toString());
        assert.equal(meta.count, 2);
        assert.equal(meta.last, second.attributes.joinedAt);
        assert.equal(data.length, 2);
        assert.equal(first.attributes.roomId, params.roomId);
        assert.equal(first.id, 'admin@foo.com');
        assert.equal(second.attributes.roomId, params.roomId);
        assert.equal(second.id, 'user@foo.com');
      });
  });

  it.only('should be able to paginate last item', () => {
    const params = {
      before: this.participants[2].joinedAt.toString(),
      limit: 2,
      roomId: roomId.toString(),
    };

    return request(uri, params)
      .then((response) => {
        const { meta, data } = response.body;
        const [first] = data;

        assert.equal(data.length, 1);
        assert.equal(meta.before, this.participants[2].joinedAt.toString());
        assert.equal(meta.count, 1);
        assert.equal(meta.last, first.attributes.joinedAt);
        assert.equal(first.id, 'second.user@foo.com');
        assert.equal(first.attributes.roomId, params.roomId);
        // fetched user
        assert.equal(first.attributes.user.id, 'second.user@foo.com');
        assert.equal(first.attributes.user.name, 'SecondUser User');
        assert.deepEqual(first.attributes.user.roles, []);
        // old staff
        assert.equal(first.attributes.name, 'SecondUser User');
        assert.deepEqual(first.attributes.roles, []);
        // express-cassandra serialization issue
        assert.equal(first.attributes._validators, undefined);
      });
  });

  it('should be able to request a list of participants from non existen room', () => {
    const params = { roomId: fakeRoomId };

    return request(uri, params)
      .then((response) => {
        const { meta, data } = response.body;

        assert.equal(data.length, 0);
        assert.equal(meta.count, 0);
      });
  });

  after('shutdown chat', () => chat.close());
});
