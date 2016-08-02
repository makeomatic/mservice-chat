const Promise = require('bluebird');

/**
 * @api {socket.io} <prefix>.users.me Get current user
 * @apiVersion 1.0.0
 * @apiName users.me
 * @apiGroup Users
 * @apiDescription Get an information about current user
 * @apiSchema {jsonschema=../../schemas/users.me.json} apiParam
 */
function UsersMeAction(request) {
  return Promise.resolve(request.socket.user);
}

UsersMeAction.schema = 'users.me';
UsersMeAction.transports = ['socketIO'];

module.exports = UsersMeAction;
