const Errors = require('common-errors');
const auth = require('./../../services/auth');

function getAuthMiddleware(application) {
  return function authMiddleware(socket, callback) {
    return auth(socket.handshake.query.token, application).asCallback((error, user) => {
      if (error) {
        switch (error.constructor) {
          case Errors.AuthenticationRequired:
          case Errors.AuthenticationRequiredError:
          case Errors.HttpStatusError:
            return callback(error);
          default:
            application.log.error(error);
            return callback(new Errors.AuthenticationRequiredError('Auth failed'));
        }
      }

      socket.user = user;
      return callback();
    });
  };
}

module.exports = getAuthMiddleware;
