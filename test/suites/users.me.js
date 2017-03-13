const assert = require('assert');
const Chat = require('../../src');
const socketIOClient = require('socket.io-client');

const action = 'chat.users.me';
const chat = new Chat(global.SERVICES);

describe('users.me', function testSuite() {
  before('start up chat', () => chat.connect());

  it('should auth as a guest', (done) => {
    const client = socketIOClient('http://0.0.0.0:3000');
    client.on('error', done);
    client.on('connect', () => {
      client.emit(action, {}, (error, response) => {
        const { type, attributes } = response.data;

        assert.equal(error, null);
        assert.equal(type, 'user');
        assert.equal(attributes.name.startsWith('Guest'), true);
        assert.deepEqual(attributes.roles, ['guest']);

        client.disconnect();
        done();
      });
    });
  });

  it('should return invalid token error', (done) => {
    const client = socketIOClient('http://0.0.0.0:3000', { query: 'token=invalidToken' });
    client.on('error', (error) => {
      assert.equal(error, 'An attempt was made to perform an operation' +
        ' without authentication: Auth failed');

      client.disconnect();
      done();
    });
  });

  it('should auth as an admin', (done) => {
    chat
      .amqp
      .publishAndWait('users.login', {
        username: 'root@foo.com',
        password: 'rootpassword000000',
        audience: '*.localhost',
      })
      .then((reply) => {
        const client = socketIOClient('http://0.0.0.0:3000', { query: `token=${reply.jwt}` });

        client.on('error', done);
        client.on('connect', () => {
          client.emit(action, {}, (error, response) => {
            const { id, type, attributes } = response.data;

            assert.equal(error, null);
            assert.equal(type, 'user');
            assert.equal(id, 'root@foo.com');
            assert.equal(attributes.name, 'Root Admin');
            assert.deepEqual(attributes.roles, ['admin', 'root']);

            client.disconnect();
            done();
          });
        });
      })
      .catch(done);
  });

  after('shutdown chat', () => chat.close());
});
