const Errors = require('common-errors');
const fetchRoom = require('../fetchers/room');
const isElevated = require('../services/roles/isElevated');
const Promise = require('bluebird');

/**
 * @api {socket.io} <prefix>.rooms.message Send message to a room
 * @apiVersion 1.0.0
 * @apiName rooms.message
 * @apiGroup Rooms
 * @apiSchema {jsonschema=../../schemas/rooms.message.json} apiParam
 */
 /**
  * @api {socket.io} rooms.message.<roomId> Send message to a room
  * @apiDescription Fired when somebody sends message to a room
  * @apiVersion 1.0.0
  * @apiName rooms.message.event
  * @apiGroup SocketIO Events
  * @apiSchema {jsonschema=../../schemas/rooms.message.event.json} apiSuccess
  */
function RoomsMessageAction(request) {
  const { params, room, socket } = request;
  const roomId = room.id.toString();
  const response = {
    user: socket.user,
    message: params.message,
  };

  socket.nsp.in(roomId).emit(`rooms.message.${roomId}`, response);

  return Promise.resolve(response);
}

function allowed(request) {
  const { params, room, socket } = request;

  if (!socket.rooms[room.id.toString()]) {
    return Promise.reject(new Errors.NotPermittedError('Not in the room'));
  }

  if (params.message.type && isElevated(socket.user, room) !== true) {
    return Promise.reject(
      new Errors.NotPermittedError(`Access denied for message type "${params.message.type}"`)
    );
  }

  return Promise.resolve(request);
}

RoomsMessageAction.allowed = allowed;
RoomsMessageAction.fetch = fetchRoom;
RoomsMessageAction.schema = 'rooms.message';
RoomsMessageAction.transports = ['socketIO'];

module.exports = RoomsMessageAction;
