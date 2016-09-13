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
function messagesPinAction(request) {
  const { auth, room, message } = request;
  const admin = auth.credentials.user;
  const pinService = this.services.pin;

  return pinService
    .pin(room.id, message, admin)
    .then(pin => (
      {
        data: pin,
      }
    ));
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
