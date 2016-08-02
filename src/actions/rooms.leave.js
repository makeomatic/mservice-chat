const Errors = require('common-errors');
const fetchRoom = require('./../fetchers/room');
const Promise = require('bluebird');

/**
 * @api {socket.io} <prefix>.rooms.join Leave from a room
 * @apiVersion 1.0.0
 * @apiName rooms.leave
 * @apiGroup Rooms
 * @apiSchema {jsonschema=../../schemas/rooms.leave.json} apiParam
 */
function RoomsLeaveAction(request) {
  const { room, socket } = request;

  return Promise.fromCallback(callback => socket.leave(room.id.toString(), callback))
    .then(() => {
      const response = {
        room: room.id.toString(),
        user: socket.user,
      };
      socket.nsp.in(room.id.toString()).emit('rooms.leave', response);
      return Promise.resolve(response);
    });
}

const allowed = request => {
  const { room, socket } = request;

  if (!socket.rooms[room.id.toString()]) {
    return Promise.reject(new Errors.NotPermittedError('Not in the room'));
  }

  return Promise.resolve(request);
};

RoomsLeaveAction.allowed = allowed;
RoomsLeaveAction.fetch = fetchRoom;
RoomsLeaveAction.schema = 'rooms.leave';
RoomsLeaveAction.transports = ['socketIO'];

module.exports = RoomsLeaveAction;
