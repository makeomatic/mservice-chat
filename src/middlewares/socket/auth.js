const Errors = require('common-errors');
const LightUserModel = require('./../../models/lightUserModel');
const Promise = require('bluebird');
const uid2 = require('uid2');

/**
 * @param socket
 * @param callback
 * @returns {*}
 */
function authMiddleware(socket, callback) {
  let promise;

  if (socket.handshake.query.token) {
    promise = this.amqp
      .publishAndWait(
        'users.verify',
        { token: socket.handshake.query.token, audience: '*' },
        { timeout: 5000 }
      )
      .then(reply => {
        const name = `${reply.firstName} ${reply.lastName}`;
        return new LightUserModel(reply.id, name, reply.roles);
      });
  } else {
    promise = Promise.resolve(new LightUserModel(null, `Guest${uid2(8)}`));
  }

  return promise
    .then(user => {
      socket.user = user;
    })
    .asCallback((error) => {
      if (error) {
        switch (error.constructor) {
          case Errors.AuthenticationRequired:
          case Errors.AuthenticationRequiredError:
            return callback(error);
          default:
            if (error.name === 'HttpStatusError') {
              return callback(error);
            }

            if (this._log) { // eslint-disable-line no-underscore-dangle
              this.log.error(error);
            }

            return callback(new Errors.Error('Something went wrong'));
        }
      }

      return callback();
    });
}

module.exports = authMiddleware;
