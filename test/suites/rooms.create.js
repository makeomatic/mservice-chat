const { expect } = require('chai');
const request = require('./../helpers/request');

describe('rooms.create', function testSuite() {
  const Chat = require('../../src');
  const uri = 'http://0.0.0.0:3000/api/chat/rooms/create';

  before('start up chat', () => {
    const chat = this.chat = new Chat(global.SERVICES);
    return chat.connect();
  });

  before('login admin', done => {
    this.chat.amqp.publishAndWait('users.login', {
        username: 'test@test.ru',
        password: 'megalongsuperpasswordfortest',
        audience: '*.localhost'
      }).tap(reply => {
        this.adminToken = reply.jwt;
      }).asCallback(done);
    }
  );

  it('should return error if request is not valid', done => {
    const token = this.adminToken;

    request(uri, { token })
      .then(response => {
        expect(response.statusCode).to.be.equals(400);
        expect(response.body.name).to.be.equals('ValidationError');
        expect(response.body.message).to.be.equals('rooms.create validation failed: data should have required property \'name\'');
        done();
      });
  });

  it.skip('should return error if user is not admin', done => {
    request(uri, { name: 'test room' })
      .then(response => {
        expect(response.statusCode).to.be.equals(403);
        expect(response.body.name).to.be.equals('NotPermittedError');
        expect(response.body.message).to.be.equals('An attempt was made to perform an operation that is not permitted: Not an admin');
        done();
      });
  });

  it('should create room if user is admin', done => {
    const token = this.adminToken;

    request(uri, { token, name: 'test room'})
      .then(response => {
        expect(response.statusCode).to.be.equals(200);
        expect(response.body.name).to.be.equals('test room');
        expect(response.body.createdBy).to.be.equals('test@test.ru');
        return response;
      })
      .then(response => this.chat.services.room.getById(response.body.id))
      .then(room => {
        expect(room.name).to.be.equals('test room');
        return room.deleteAsync();
      })
      .asCallback(done);
  });

  after('shutdown chat', () => this.chat.close());
});
