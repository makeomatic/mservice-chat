const Errors = require('common-errors');
const isElevated = require('../services/roles/isElevated');
const fetchRoom = require('../fetchers/room')('roomId');

/**
 * @api {http} <prefix>.users.unban Unban an user
 * @apiVersion 1.0.0
 * @apiName users.unban
 * @apiGroup Users
 * @apiSchema {jsonschema=../../schemas/users.unban.json} apiParam
 * @apiSchema {jsonschema=../../schemas/users.unban.response.json} apiSuccess
 */
function usersUnbanAction(request) {
  const { roomId, userId } = request.params;

  return this.services.room
    .unban(roomId, userId)
    .return({
      meta: {
        status: 'success',
      },
    });
}

function allowed(request) {
  const { auth, room, params } = request;
  const admin = auth.credentials.user;

  if (isElevated(admin, room) !== true) {
    throw new Errors.NotPermittedError(`Access to room #${params.roomId} is denied`);
  }

  if (admin.id === params.userId) {
    throw new Errors.NotPermittedError('Can\'t unban yourself');
  }

  // @todo try to move it to model method
  if (room.banned === null || room.banned.includes(params.userId) === false) {
    throw new Errors.NotPermittedError(`User #${params.userId} isn\'t banned`);
  }

  return Promise.resolve(request);
}

usersUnbanAction.allowed = allowed;
usersUnbanAction.auth = 'token';
usersUnbanAction.fetchers = [fetchRoom];
usersUnbanAction.schema = 'users.unban';
usersUnbanAction.transports = ['http'];

module.exports = usersUnbanAction;
