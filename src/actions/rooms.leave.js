const Errors = require('common-errors');
const fetchRoom = require('./../fetchers/room')();
const Promise = require('bluebird');
const { successResponse, modelResponse, TYPE_USER } = require('../utils/response');

/**
 * @api {socket.io} <prefix>.rooms.join Leave a room
 * @apiVersion 1.0.0
 * @apiName rooms.leave
 * @apiGroup Rooms
 * @apiSchema {jsonschema=../../schemas/rooms.leave.json} apiParam
 * @apiSchema {jsonschema=../../schemas/rooms.leave.response.json} apiSuccess
 */
 /**
  * @api {socket.io} rooms.leave.<roomId> Leave a room
  * @apiDescription Fired when somebody leaves a room
  * @apiVersion 1.0.0
  * @apiName rooms.leave.event
  * @apiGroup RoomsBroadcast
  * @apiSchema {jsonschema=../../schemas/rooms.leave.broadcast.json} apiSuccess
  */
function RoomsLeaveAction(request) {
  const { room, socket } = request;
  const roomId = room.id.toString();

  return Promise
    .fromCallback(callback => socket.leave(roomId, callback))
    .then(() => modelResponse(socket.user, TYPE_USER))
    .tap(response => socket.broadcast.to(roomId).emit(`rooms.leave.${roomId}`, response))
    .then(successResponse);
}

const allowed = (request) => {
  const { room, socket } = request;

  if (!socket.rooms[room.id.toString()]) {
    return Promise.reject(new Errors.NotPermittedError('Not in the room'));
  }

  return Promise.resolve(request);
};

RoomsLeaveAction.allowed = allowed;
RoomsLeaveAction.fetcher = fetchRoom;
RoomsLeaveAction.schema = 'rooms.leave';
RoomsLeaveAction.transports = ['socketIO'];

module.exports = RoomsLeaveAction;
