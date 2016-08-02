const Errors = require('common-errors');
const fetchRoom = require('./../fetchers/room');
const Promise = require('bluebird');

/**
 * @api {socket.io} <prefix>.rooms.message Send message to a room
 * @apiVersion 1.0.0
 * @apiName rooms.message
 * @apiGroup Rooms
 * @apiSchema {jsonschema=../../schemas/rooms.message.json} apiParam
 */
function RoomsMessageAction(request) {
  const { params, room, socket } = request;
  const response = {
    user: socket.user,
    room: room.id.toString(),
    message: params.message,
  };
  socket.nsp.in(room.id.toString()).emit('message', response);
  return Promise.resolve(response);
}

const allowed = request => {
  const { params, room, socket } = request;

  if (!socket.rooms[room.id.toString()]) {
    return Promise.reject(new Errors.NotPermittedError('Not in the room'));
  }

  if (params.message.type !== 'simple' && socket.user.isAdmin !== true) {
    return Promise.reject(new Errors.NotPermittedError('Access denied'));
  }

  return Promise.resolve(request);
};

RoomsMessageAction.allowed = allowed;
RoomsMessageAction.fetch = fetchRoom;
RoomsMessageAction.schema = 'rooms.message';
RoomsMessageAction.transports = ['socketIO'];

module.exports = RoomsMessageAction;
