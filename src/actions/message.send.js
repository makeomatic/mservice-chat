const Errors = require('common-errors');
const fetchRoom = require('../fetchers/room');
const isElevated = require('../services/roles/isElevated');
const Promise = require('bluebird');

/**
 * @api {socket.io} <prefix>.message.send Send message to a room
 * @apiVersion 1.0.0
 * @apiName message.send
 * @apiGroup Rooms
 * @apiSchema {jsonschema=../../schemas/message.send.json} apiParam
 */
 /**
  * @api {socket.io} message.send.<roomId> Send message to a room
  * @apiDescription Fired when somebody sends message to a room
  * @apiVersion 1.0.0
  * @apiName message.send.broadcast
  * @apiGroup SocketIO Events
  * @apiSchema {jsonschema=../../schemas/message.send.broadcast.json} apiSuccess
  */
function RoomsMessageSendAction(request) {
  const { params, room, socket } = request;
  const { user } = socket;
  const { message: messageService } = this.services;
  const roomId = room.id.toString();
  const response = {
    user,
    message: params.message,
  };
  const message = {
    roomId: room.id,
    text: params.message.text,
    userId: socket.user.id,
    user: socket.user,
  };

  socket.nsp.in(roomId).emit(`message.send.${roomId}`, response);

  return messageService
    .create(message)
    .return(response);
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

  if (params.message.type && isElevated(user, room) !== true) {
    return Promise.reject(
      new Errors.NotPermittedError(`Access denied for message type "${params.message.type}"`)
    );
  }

  return Promise.resolve(request);
}

RoomsMessageSendAction.allowed = allowed;
RoomsMessageSendAction.fetch = fetchRoom;
RoomsMessageSendAction.schema = 'message.send';
RoomsMessageSendAction.transports = ['socketIO'];

module.exports = RoomsMessageSendAction;
