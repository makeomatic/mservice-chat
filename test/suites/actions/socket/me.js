const { expect } = require('chai');

describe('me', function testSuite() {
  const SocketIOClient = require('socket.io-client');
  const Chat = require('../../../../src');

  before('start up chat', () => {
    const chat = this.chat = new Chat(global.SERVICES);
    return chat.connect();
  });

  it('should auth as a guest', done => {
    const client = SocketIOClient('http://0.0.0.0:3000/testChat');
    client.on('connect', () => {
      client.emit('me', {}, (error, user) => {
        expect(error).to.be.equals(null);
        expect(user.name.startsWith('Guest')).to.be.true;
        client.disconnect();
        done();
      });
    });
  });

  it('should returns invalid token error', done => {
    const client = SocketIOClient('http://0.0.0.0:3000/testChat', { query: 'token=invalidToken' });

    client.on('error', error => {
      expect(error).to.be.equals('invalid token');
      client.disconnect();
      done();
    });
  });

  it.skip('should auth as an admin', done => {
    this.chat.amqp
      .publishAndWait(
        'users.login',
        {
          username: 'test@test.ru',
          password: 'megalongsuperpasswordfortest',
          audience: '*'
        },
        { timeout: 5000 }
      )
      .then(reply => {
        console.log(reply)
        const client = SocketIOClient('http://0.0.0.0:3000/testChat', { query: 'token=1' });

        client.on('connect', () => {
          client.emit('me', {}, (error, user) => {
            console.log(user)
            expect(error).to.be.equals(null);
            client.disconnect();
            done();
          });
        });
      });
  });

  after('shutdown chat', () => this.chat.close());
});
