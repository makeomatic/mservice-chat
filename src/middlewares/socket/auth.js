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
    const action = `${this.config.users.prefix}.${this.config.users.postfix.verify}`;
    const audience = this.config.users.audience;
    const timeout = this.config.users.timeouts.verify;
    const token = socket.handshake.query.token;

    promise = this.amqp.publishAndWait(action, { token, audience }, { timeout })
      .then(reply => {
        const user = reply.metadata[audience];
        const name = `${user.firstName} ${user.lastName}`;
        return new LightUserModel(user.username, name, user.roles);
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
