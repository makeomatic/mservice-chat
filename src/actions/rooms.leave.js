const Errors = require('common-errors');
const fetchRoom = require('./../fetchers/room')();
const Promise = require('bluebird');

/**
 * @api {socket.io} <prefix>.rooms.join Leave from a room
 * @apiVersion 1.0.0
 * @apiName rooms.leave
 * @apiGroup Rooms
 * @apiSchema {jsonschema=../../schemas/rooms.leave.json} apiParam
 */
 /**
  * @api {socket.io} rooms.leave.<roomId> Leave from a room
  * @apiDescription Fired when somebody leaves a room
  * @apiVersion 1.0.0
  * @apiName rooms.leave.event
  * @apiGroup SocketIO Events
  * @apiSchema {jsonschema=../../schemas/rooms.leave.event.json} apiSuccess
  */
function RoomsLeaveAction(request) {
  const { room, socket } = request;
  const roomId = room.id.toString();

  return Promise
    .fromCallback(callback => socket.leave(roomId, callback))
    .then(() => {
      const response = {
        user: socket.user,
      };

      socket.nsp.in(roomId).emit(`rooms.leave.${roomId}`, response);

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
