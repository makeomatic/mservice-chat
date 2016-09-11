const Errors = require('common-errors');
const fetchRoom = require('../fetchers/room')('roomId');
const isElevated = require('../services/roles/isElevated');
const Promise = require('bluebird');

/**
 * @api {socket.io} <prefix>.messages.send Send message to a room
 * @apiVersion 1.0.0
 * @apiName messages.send
 * @apiGroup Messages
 * @apiParam (Payload) {String} roomId - Room identificator
 * @apiParam (Payload) {Object} message - Message object
 * @apiParam (Payload) {String} message.text - Text
 * @apiParam (Payload) {String} [message.type] - `sticky` if sticky message
 */
 /**
  * @api {socket.io} messages.send.<roomId> Send message to a room
  * @apiDescription Fired when somebody sends message to a room
  * @apiVersion 1.0.0
  * @apiName messages.send.broadcast
  * @apiGroup SocketIO Events
  * @apiSchema {jsonschema=../../schemas/messages.send.broadcast.json} apiSuccess
  */
function messageSendAction(request) {
  const { params, room, socket } = request;
  const { message: messageService } = this.services;
  const roomId = room.id.toString();
  const message = {
    roomId: room.id,
    text: params.message.text,
    userId: socket.user.id,
    user: socket.user,
  };

  return messageService
    .create(message)
    .tap(createdMessage => socket.nsp.in(roomId).emit(`messages.send.${roomId}`, createdMessage));
}

function allowed(request) {
  const { params, room, socket } = request;
  const { user } = socket;

  if (!socket.rooms[room.id.toString()]) {
    return Promise.reject(new Errors.NotPermittedError('Not in the room'));
  }

  if (user.isGuest === true) {
    return Promise.reject(new Errors.NotPermittedError('Access denied for guests'));
  }

  // @todo try to move it to model method
  if (room.banned !== null && room.banned.includes(user.id) === true) {
    throw new Errors.NotPermittedError(`User #${user.id} is banned`);
  }

  if (params.message.type && isElevated(user, room) !== true) {
    return Promise.reject(
      new Errors.NotPermittedError(`Access denied for message type "${params.message.type}"`)
    );
  }

  return Promise.resolve(request);
}

messageSendAction.allowed = allowed;
messageSendAction.fetcher = fetchRoom;
messageSendAction.schema = 'messages.send';
messageSendAction.transports = ['socketIO'];

module.exports = messageSendAction;
