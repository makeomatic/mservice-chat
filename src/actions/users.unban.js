const Errors = require('common-errors');
const isElevated = require('../services/roles/isElevated');
const fetchBan = require('../fetchers/ban');
const fetchRoom = require('../fetchers/room');
const makeModelResponse = require('../services/response/model');

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

  return ban.deleteAsync()
    .then(() => makeModelResponse(ban))
    .tap(response => socketIO.in(params.roomId).emit(`users.unban.${params.roomId}`, response));
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