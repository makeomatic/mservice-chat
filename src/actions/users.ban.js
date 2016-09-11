const Errors = require('common-errors');
const isElevated = require('../services/roles/isElevated');
const fetchRoom = require('../fetchers/room')('roomId');
const fetchUser = require('../fetchers/user')('userId');

/**
 * @api {http} <prefix>.users.ban Ban an user
 * @apiVersion 1.0.0
 * @apiName users.ban
 * @apiGroup Users
 * @apiSchema {jsonschema=../../schemas/users.ban.json} apiParam
 * @apiSchema {jsonschema=../../schemas/users.ban.response.json} apiSuccess
 */
function usersBanAction(request) {
  const { roomId, userId } = request.params;

  return this.services.room
    .ban(roomId, userId)
    .return({
      meta: {
        status: 'success',
      },
    });
}

function allowed(request) {
  const { auth, room, user: bannedUser, params } = request;
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

  // @todo try to move it to model method
  if (room.banned !== null && room.banned.includes(bannedUser.id) === true) {
    throw new Errors.NotPermittedError(`User #${bannedUser.id} is already banned`);
  }

  return Promise.resolve(request);
}

usersBanAction.allowed = allowed;
usersBanAction.auth = 'token';
usersBanAction.fetchers = [fetchRoom, fetchUser];
usersBanAction.schema = 'users.ban';
usersBanAction.transports = ['http'];

module.exports = usersBanAction;
