const Errors = require('common-errors');
const isElevated = require('../services/roles/isElevated');
const fetchBan = require('../fetchers/ban');
const fetchRoom = require('../fetchers/room');
const { modelResponse, TYPE_BAN } = require('../utils/response');

/**
 * @api {http} <prefix>.users.unban Unban an user
 * @apiVersion 1.0.0
 * @apiName users.unban
 * @apiGroup Users
 * @apiSchema {jsonschema=../../schemas/users.unban.json} apiParam
 * @apiSchema {jsonschema=../../schemas/users.unban.response.json} apiSuccess
 */
 /**
  * @api {socket.io} users.unban.<roomId> Unban an user
  * @apiDescription Fired when somebody unban an user
  * @apiVersion 1.0.0
  * @apiName users.unban.broadcast
  * @apiGroup UsersBroadcast
  * @apiSchema {jsonschema=../../schemas/users.unban.broadcast.json} apiSuccess
  */
function usersUnbanAction(request) {
  const { socketIO } = this;
  const { ban, params } = request;
  const { roomId, id } = params;

  return ban.deleteAsync()
    .tap(() => this.services.participant.markAsBanned(roomId, id, false))
    .then(() => modelResponse(ban, TYPE_BAN))
    .tap(response => socketIO.in(roomId).emit(`users.unban.${roomId}`, response));
}

function allowed(request) {
  const { auth, ban, room, params } = request;
  const admin = auth.credentials.user;

  if (isElevated(admin, room) !== true) {
    throw new Errors.NotPermittedError(`Access to room #${params.roomId} is denied`);
  }

  if (admin.id === params.id) {
    throw new Errors.NotPermittedError('Can\'t unban yourself');
  }

  if (ban === undefined) {
    throw new Errors.NotPermittedError(`User #${params.id} isn\'t banned`);
  }

  return Promise.resolve(request);
}

usersUnbanAction.allowed = allowed;
usersUnbanAction.auth = 'token';
usersUnbanAction.fetchers = [fetchRoom('roomId'), fetchBan('id')];
usersUnbanAction.schema = 'users.unban';
usersUnbanAction.transports = ['http'];

module.exports = usersUnbanAction;
