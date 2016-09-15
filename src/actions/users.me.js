const Promise = require('bluebird');
const { modelResponse, TYPE_USER } = require('../utils/response');

/**
 * @api {socket.io} <prefix>.users.me Get current user
 * @apiVersion 1.0.0
 * @apiName users.me
 * @apiGroup Users
 * @apiDescription Get an information about current user
 */
function UsersMeAction(request) {
  return Promise
    .resolve(request.socket.user)
    .then(user => modelResponse(user, TYPE_USER));
}

UsersMeAction.transports = ['socketIO'];

module.exports = UsersMeAction;
