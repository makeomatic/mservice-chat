const Errors = require('common-errors');
const isElevated = require('../services/roles/isElevated');
const fetchRoom = require('../fetchers/room')('roomId');

/**
 * @api {http} <prefix>.messages.unpin Unpin last message
 * @apiVersion 1.0.0
 * @apiName messages.unpin
 * @apiGroup Messages
 * @apiSchema {jsonschema=../../schemas/messages.unpin.json} apiParam
 * @apiSchema {jsonschema=../../schemas/messages.unpin.response.json} apiSuccess
 */
 /**
  * @api {socket.io} messages.unpin.<roomId> Unpin a message
  * @apiDescription Fired when somebody unpin a message
  * @apiVersion 1.0.0
  * @apiName messages.unpin.broadcast
  * @apiGroup MessagesBroadcast
  * @apiSchema {jsonschema=../../schemas/messages.unpin.broadcast.json} apiSuccess
  */
function messagesUnpinAction(request) {
  const { socketIO } = this;
  const { auth, params, room } = request;
  const admin = auth.credentials.user;

  return this.services.pin
    .unpin(room.id, admin)
    .return({
      meta: {
        user: admin,
        status: 'success',
      },
    })
    .tap(response => socketIO.in(params.roomId).emit(`messages.unpin.${params.roomId}`, response));
}

function allowed(request) {
  const { auth, room, params } = request;
  const admin = auth.credentials.user;

  if (isElevated(admin, room) !== true) {
    throw new Errors.NotPermittedError(`Access to room #${params.roomId} is denied`);
  }

  return Promise.resolve(request);
}

messagesUnpinAction.allowed = allowed;
messagesUnpinAction.auth = 'token';
messagesUnpinAction.fetcher = fetchRoom;
messagesUnpinAction.schema = 'messages.unpin';
messagesUnpinAction.transports = ['http'];

module.exports = messagesUnpinAction;
