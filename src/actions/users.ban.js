const Errors = require('common-errors');
const isElevated = require('../services/roles/isElevated');
const fetchBan = require('../fetchers/ban');
const fetchRoom = require('../fetchers/room');
const fetchUser = require('../fetchers/user');
const makeModelResponse = require('../services/response/model');

/**
 * @api {http} <prefix>.users.ban Ban an user
 * @apiVersion 1.0.0
 * @apiName users.ban
 * @apiGroup Users
 * @apiSchema {jsonschema=../../schemas/users.ban.json} apiParam
 * @apiSchema {jsonschema=../../schemas/users.ban.response.json} apiSuccess
 */
 /**
  * @api {socket.io} users.ban.<roomId> Ban an user
  * @apiDescription Fired when somebody ban an user
  * @apiVersion 1.0.0
  * @apiName users.ban.broadcast
  * @apiGroup UsersBroadcast
  * @apiSchema {jsonschema=../../schemas/users.ban.broadcast.json} apiSuccess
  */
function usersBanAction(request) {
  const { socketIO } = this;
  const { auth, params, room, user: bannedUser } = request;
  const { reason, roomId } = params;
  const admin = auth.credentials.user;

  return this.services.ban
    .add(room.id, bannedUser, admin, reason)
    .then(makeModelResponse)
    .tap(response => socketIO.in(roomId).emit(`users.ban.${roomId}`, response));
}

function allowed(request) {
  const { auth, ban, room, user: bannedUser, params } = request;
  const admin = auth.credentials.user;

  if (isElevated(admin, room) !== true) {
    throw new Errors.NotPermittedError(`Access to room #${params.roomId} is denied`);
  }

  if (admin.id === bannedUser.id) {
    throw new Errors.NotPermittedError('Can\'t ban yourself');
  }

  if (bannedUser.isRoot === true) {
    throw new Errors.NotPermittedError('Can\'t ban root admin');
  }

  if (ban) {
    throw new Errors.NotPermittedError(`User #${bannedUser.id} is already banned`);
  }

  return Promise.resolve(request);
}

usersBanAction.allowed = allowed;
usersBanAction.auth = 'token';
usersBanAction.fetchers = [fetchRoom('roomId'), fetchUser(), fetchBan('id')];
usersBanAction.schema = 'users.ban';
usersBanAction.transports = ['http'];

module.exports = usersBanAction;
