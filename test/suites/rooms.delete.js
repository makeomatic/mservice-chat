const Chance = require('chance');
const Chat = require('../../src');
const { expect } = require('chai');
const request = require('./../helpers/request');

const chance = new Chance();
const chat = new Chat(global.SERVICES);
const uri = 'http://0.0.0.0:3000/api/chat/rooms/delete';

describe('rooms.delete', function testSuite() {
  before('start up chat', () => chat.connect());

  before('create room', () => {
    const params = { name: 'test', createdBy: 'admin@foo.com' };

    return chat.services.room
      .create(params)
      .then(room => (this.room = room));
  });

  before('login first admin', () => chat.amqp.publishAndWait('users.login', {
    username: 'admin@foo.com',
    password: 'adminpassword00000',
    audience: '*.localhost',
  }).tap((reply) => {
    this.firstAdminToken = reply.jwt;
  })
  );

  before('login second admin', () => chat.amqp.publishAndWait('users.login', {
    username: 'second.admin@foo.com',
    password: 'secondadminpassword',
    audience: '*.localhost',
  }).tap((reply) => {
    this.secondAdminToken = reply.jwt;
  })
  );

  it('should return error if request is not valid', (done) => {
    const token = this.firstAdminToken;
    request(uri, { token, id: 'invalid-id' })
      .then((response) => {
        expect(response.statusCode).to.be.equals(400);
        expect(response.body.name).to.be.equals('ValidationError');
        expect(response.body.message).to.be.equals('rooms.delete validation failed:' +
          ' data.id should match format "uuid"');
        done();
      });
  });

  it('should return error if user is not admin', () => {
    const id = this.room.id.toString();
    const userParams = {
      activate: true,
      audience: '*.localhost',
      password: 'mynicepassword',
      username: chance.email(),
    };

    return chat.amqp.publishAndWait('users.register', userParams)
      .then(response => request(uri, { id, token: response.jwt }))
      .then((response) => {
        expect(response.statusCode).to.be.equals(403);
        expect(response.body.name).to.be.equals('NotPermittedError');
        expect(response.body.message).to.be.equals('An attempt was made to perform' +
          ' an operation that is not permitted: Has not access');
      });
  });

  it('should return error if user is not room creator', (done) => {
    const id = this.room.id.toString();
    const token = this.secondAdminToken;
    request(uri, { id, token })
      .then((response) => {
        expect(response.statusCode).to.be.equals(403);
        expect(response.body.name).to.be.equals('NotPermittedError');
        expect(response.body.message).to.be.equals('An attempt was made to perform' +
          ' an operation that is not permitted: Has not access');
        done();
      });
  });

  it('should delete room if user is admin and room creator', (done) => {
    const id = this.room.id.toString();
    const token = this.firstAdminToken;

    chat.services.room.find()
      .then(roomsBefore => expect(roomsBefore.length).to.be.equals(1))
      .then(() => request(uri, { id, token }))
      .then((response) => {
        expect(response.statusCode).to.be.equals(200);
        expect(response.body).to.be.equals(true);
      })
      .then(() => chat.services.room.find())
      .then((roomsAfter) => {
        expect(roomsAfter.length).to.be.equals(0);
        done();
      });
  });

  after('delete first room', () => this.room.deleteAsync());
  after('shutdown chat', () => chat.close());
});
