const Errors = require('common-errors');
const fetchRoom = require('./../fetchers/room')();
const Promise = require('bluebird');

/**
 * @api {socket.io} <prefix>.rooms.join Join a room
 * @apiVersion 1.0.0
 * @apiName rooms.join
 * @apiGroup Rooms
 * @apiSchema {jsonschema=../../schemas/rooms.join.json} apiParam
 */
/**
 * @api {socket.io} rooms.join.<roomId> Join a room
 * @apiDescription Fired when somebody joins a room
 * @apiVersion 1.0.0
 * @apiName rooms.join.broadcast
 * @apiGroup SocketIO Events
 * @apiSchema {jsonschema=../../schemas/rooms.join.broadcast.json} apiSuccess
 */
function RoomsJoinAction(request) {
  const { room, socket } = request;
  const roomId = room.id.toString();

  return Promise
    .fromCallback(callback => socket.join(roomId, callback))
    .then(() => {
      const response = {
        user: socket.user,
      };

      socket.nsp.in(roomId).emit(`rooms.join.${roomId}`, response);

      return Promise.resolve(response);
    });
}

const allowed = request => {
  const { room, socket } = request;

  if (socket.rooms[room.id.toString()]) {
    return Promise.reject(new Errors.NotPermittedError('Already in the room'));
  }

  return Promise.resolve(request);
};

RoomsJoinAction.allowed = allowed;
RoomsJoinAction.fetch = fetchRoom;
RoomsJoinAction.schema = 'rooms.join';
RoomsJoinAction.transports = ['socketIO'];

module.exports = RoomsJoinAction;
