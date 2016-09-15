const Errors = require('common-errors');
const isElevated = require('../services/roles/isElevated');
const fetchRoom = require('../fetchers/room')('roomId');
const fetchMessage = require('../fetchers/message')();

/**
 * @api {http} <prefix>.messages.pin Pin a message
 * @apiVersion 1.0.0
 * @apiName messages.pin
 * @apiGroup Messages
 * @apiSchema {jsonschema=../../schemas/messages.pin.json} apiParam
 * @apiSchema {jsonschema=../../schemas/messages.pin.response.json} apiSuccess
 */
 /**
  * @api {socket.io} messages.pin.<roomId> Pin a message
  * @apiDescription Fired when somebody pin a message
  * @apiVersion 1.0.0
  * @apiName messages.pin.broadcast
  * @apiGroup MessagesBroadcast
  * @apiSchema {jsonschema=../../schemas/messages.pin.broadcast.json} apiSuccess
  */
function messagesPinAction(request) {
  const { socketIO } = this;
  const { auth, room, message, params } = request;
  const admin = auth.credentials.user;
  const pinService = this.services.pin;

  return pinService.pinAndBroadcast(room.id, message, admin);
}

function allowed(request) {
  const { auth, room, params } = request;
  const admin = auth.credentials.user;

  if (isElevated(admin, room) !== true) {
    throw new Errors.NotPermittedError(`Access to room #${params.roomId} is denied`);
  }

  return Promise.resolve(request);
}

messagesPinAction.allowed = allowed;
messagesPinAction.auth = 'token';
messagesPinAction.syncFetchers = [fetchRoom, fetchMessage];
messagesPinAction.schema = 'messages.pin';
messagesPinAction.transports = ['http'];

module.exports = messagesPinAction;
