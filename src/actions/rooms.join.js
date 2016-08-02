const Errors = require('common-errors');
const fetchRoom = require('./../fetchers/room');
const Promise = require('bluebird');

/**
 * @api {socket.io} <prefix>.rooms.join Join to a room
 * @apiVersion 1.0.0
 * @apiName rooms.join
 * @apiGroup Rooms
 * @apiSchema {jsonschema=../../schemas/rooms.join.json} apiParam
 */
function RoomsJoinAction(request) {
  const { room, socket } = request;

  return Promise.fromCallback(callback => socket.join(room.id.toString(), callback))
    .then(() => {
      const response = {
        room: room.id.toString(),
        user: socket.user,
      };
      socket.nsp.in(room.id.toString()).emit('rooms.join', response);
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
