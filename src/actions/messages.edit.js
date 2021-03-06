const Promise = require('bluebird');
const Errors = require('common-errors');
const fetchMessage = require('../fetchers/message')();
const fetchRoom = require('../fetchers/room')('roomId');
const isElevated = require('../services/roles/isElevated');
const { successResponse } = require('../responses/success');
const { modelResponse } = require('../responses/message');

/**
 * @api {http} <prefix>.messages.edit Edit a message
 * @apiVersion 1.0.0
 * @apiName messages.edit
 * @apiGroup Messages
 * @apiSchema {jsonschema=../../schemas/messages.edit.json} apiParam
 * @apiSchema {jsonschema=../../schemas/messages.edit.response.json} apiSuccess
 */
/**
  * @api {socket.io} messages.edit.<roomId> Edit a message
  * @apiDescription Fired when somebody edit a message
  * @apiVersion 1.0.0
  * @apiName messages.edit.broadcast
  * @apiGroup MessagesBroadcast
  * @apiSchema {jsonschema=../../schemas/messages.edit.broadcast.json} apiSuccess
  */
function messageEditAction(request) {
  const { auth, message, params } = request;
  const { roomId, text } = params;
  const { socketIO, services } = this;
  const { user } = auth.credentials;

  return services.message
    .edit(message, text, user)
    .then(() => modelResponse(message))
    .tap(response => socketIO.in(roomId).emit(`messages.edit.${roomId}`, response))
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

messageEditAction.allowed = allowed;
messageEditAction.auth = 'token';
messageEditAction.fetchers = [fetchMessage, fetchRoom];
messageEditAction.schema = 'messages.edit';
messageEditAction.transports = ['http'];

module.exports = messageEditAction;
