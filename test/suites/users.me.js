const {expect} = require('chai');

describe('users.me', function testSuite() {
  const SocketIOClient = require('socket.io-client');
  const Chat = require('../../src');
  const action = 'chat.users.me';

  before('start up chat', () => {
    const chat = this.chat = new Chat(global.SERVICES);
    return chat.connect();
  });

  it('should auth as a guest', done => {
    const client = SocketIOClient('http://0.0.0.0:3000');
    client.on('error', done);
    client.on('connect', () => {
      client.emit(action, {}, (error, user) => {
        expect(error).to.be.equals(null);
        expect(user.name.startsWith('Guest')).to.be.equal(true);
        expect(user.roles).to.be.deep.equal([]);
        client.disconnect();
        done();
      });
    });
  });

  it('should return invalid token error', done => {
    const client = SocketIOClient('http://0.0.0.0:3000', {query: 'token=invalidToken'});
    client.on('error', error => {
      expect(error).to.be.equals('An attempt was made to perform an operation without authentication: Auth failed');
      client.disconnect();
      done();
    });
  });

  it('should auth as an admin', done => {
    this.chat.amqp.publishAndWait('users.login', {
        username: 'test@test.ru',
        password: 'megalongsuperpasswordfortest',
        audience: '*.localhost'
      }
    ).then(reply => {
      const client = SocketIOClient('http://0.0.0.0:3000', { query: `token=${reply.jwt}` });
      client.on('error', done);
      client.on('connect', () => {
        client.emit(action, {}, (error, user) => {
          expect(error).to.be.equals(null);
          expect(user.id).to.be.equal('test@test.ru');
          expect(user.name).to.be.equal('Admin Admin');
          expect(user.roles).to.be.deep.equal(['admin']);
          client.disconnect();
          done();
        });
      });
    });
  });

  after('shutdown chat', () => this.chat.close());
});
