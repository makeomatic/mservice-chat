const collectionResponse = require('../services/response/collection');
const Errors = require('common-errors');
const fetchRoom = require('./../fetchers/room')();
const Promise = require('bluebird');

/**
 * @api {socket.io} <prefix>.rooms.join Join a room
 * @apiVersion 1.0.0
 * @apiName rooms.join
 * @apiGroup Rooms
 * @apiSchema {jsonschema=../../schemas/rooms.join.json} apiParam
 * @apiSchema {jsonschema=../../schemas/rooms.join.response.json} apiSuccess
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
  const { user } = socket;
  const roomId = room.id.toString();

  return Promise
    .fromCallback(callback => socket.join(roomId, callback))
    .tap(() => socket.nsp.in(roomId).emit(`rooms.join.${roomId}`, { user }))
    .then(() => this.services.message.history(roomId))
    .then(messages => collectionResponse(messages, request));
}

const allowed = request => {
  const { room, socket } = request;

  if (socket.rooms[room.id.toString()]) {
    return Promise.reject(new Errors.NotPermittedError('Already in the room'));
  }

  return Promise.resolve(request);
};

RoomsJoinAction.allowed = allowed;
RoomsJoinAction.fetcher = fetchRoom;
RoomsJoinAction.schema = 'rooms.join';
RoomsJoinAction.transports = ['socketIO'];

module.exports = RoomsJoinAction;
