const assert = require('assert');
const Chance = require('chance');
const { expect } = require('chai');

describe('rooms.create', function testSuite() {
  const Chat = require('../../src');
  const request = require('./../helpers/request');

  const chance = new Chance();
  const chat = new Chat(global.SERVICES);
  const uri = 'http://0.0.0.0:3000/api/chat/rooms/create';

  before('start up chat', () => chat.connect());

  before('login admin', () => chat.amqp.publishAndWait('users.login', {
    username: 'root@foo.com',
    password: 'rootpassword000000',
    audience: '*.localhost',
  }).tap((reply) => {
    this.adminToken = reply.jwt;
  }));

  it('should return error if request is not valid', () => {
    const token = this.adminToken;

    return request(uri, { token })
      .then((response) => {
        expect(response.statusCode).to.be.equals(400);
        expect(response.body.name).to.be.equals('HttpStatusError');
        expect(response.body.message).to.be.equals('rooms.create validation failed:'
          + ' data should have required property \'name\'');
      });
  });

  it('should return error if user is not admin', () => {
    const username = chance.email();
    const userParams = {
      activate: true,
      audience: '*.localhost',
      password: 'mynicepassword',
      username,
    };

    return chat.amqp.publishAndWait('users.register', userParams)
      .then(response => request(uri, { name: 'test room', token: response.jwt }))
      .then((response) => {
        expect(response.statusCode).to.be.equals(403);
        expect(response.body.name).to.be.equals('NotPermittedError');
        expect(response.body.message).to.be.equals('An attempt was made to perform an operation'
          + ' that is not permitted: Not an root');
      });
  });

  it('should be able create a room if the user is an admin', () => {
    const token = this.adminToken;

    return request(uri, { token, name: 'test room' })
      .then((response) => {
        expect(response.statusCode).to.be.equals(200);
        expect(response.body.data.attributes.name).to.be.equals('test room');
        assert.equal(response.body.data.attributes.createdBy, 'root@foo.com');

        return response;
      })
      .then(response => chat.services.room.getById(response.body.data.id))
      .then((room) => {
        expect(room.name).to.be.equals('test room');

        return room.deleteAsync();
      });
  });

  after('shutdown chat', () => chat.close());
});
