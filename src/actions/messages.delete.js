const Errors = require('common-errors');
const Promise = require('bluebird');
const fetchMessage = require('../fetchers/message')();
const fetchRoom = require('../fetchers/room')('roomId');
const isElevated = require('../services/roles/isElevated');
const { successResponse } = require('../responses/success');
const { modelResponse } = require('../responses/message');

/**
 * @api {http} <prefix>.messages.delete Delete a message
 * @apiVersion 1.0.0
 * @apiName messages.delete
 * @apiGroup Messages
 * @apiSchema {jsonschema=../../schemas/messages.delete.json} apiParam
 * @apiSchema {jsonschema=../../schemas/messages.delete.response.json} apiSuccess
 */
/**
  * @api {socket.io} messages.delete.<roomId> Delete a message
  * @apiDescription Fired when somebody delete a message
  * @apiVersion 1.0.0
  * @apiName messages.delete.broadcast
  * @apiGroup MessagesBroadcast
  * @apiSchema {jsonschema=../../schemas/messages.delete.broadcast.json} apiSuccess
  */
function messageDeleteAction(request) {
  const { message, params } = request;
  const { id, roomId } = params;
  const { socketIO } = this;

  return this.services.message
    .delete({ id, roomId })
    .then(() => modelResponse(message))
    .tap(response => socketIO.in(roomId).emit(`messages.delete.${roomId}`, response))
    .then(successResponse);
}

function allowed(request) {
  const { auth, message, room } = request;
  const { user } = auth.credentials;

  if (user.id === message.userId) {
    return Promise.resolve(request);
  }

  if (isElevated(user, room) === true) {
    return Promise.resolve(request);
  }

  return Promise.reject(new Errors.NotPermittedError('Has not access'));
}

messageDeleteAction.allowed = allowed;
messageDeleteAction.auth = 'token';
messageDeleteAction.fetchers = [fetchMessage, fetchRoom];
messageDeleteAction.schema = 'messages.delete';
messageDeleteAction.transports = ['http'];

module.exports = messageDeleteAction;
