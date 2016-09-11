const Errors = require('common-errors');
const fetchMessage = require('../fetchers/message')();
const fetchRoom = require('../fetchers/room')('roomId');
const isElevated = require('../services/roles/isElevated');
const Promise = require('bluebird');

/**
 * @api {http} <prefix>.messages.delete Delete a message
 * @apiVersion 1.0.0
 * @apiName messages.delete
 * @apiGroup Messages
 * @apiSchema {jsonschema=../../schemas/messages.delete.json} apiParam
 */
 /**
  * @api {socket.io} messages.delete.<roomId> Delete a message
  * @apiDescription Fired when somebody delete a message
  * @apiVersion 1.0.0
  * @apiName messages.delete.broadcast
  * @apiGroup SocketIO Events
  * @apiSchema {jsonschema=../../schemas/messages.delete.broadcast.json} apiSuccess
  */
function messageDeleteAction(request) {
  const { message, room } = request;
  const { socketIO } = this;
  const response = { id: message.id.toString() };
  const roomId = room.id.toString();

  return message
    .deleteAsync()
    .then(() => {
      socketIO.in(roomId).emit(`messages.delete.${roomId}`, response);

      return response;
    });
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
