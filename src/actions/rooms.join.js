const {
  collectionResponse,
  modelResponse,
  transform,
  TYPE_USER,
  TYPE_PIN,
  TYPE_MESSAGE,
} = require('../utils/response');
const Errors = require('common-errors');
const fetchRoom = require('./../fetchers/room');
const Promise = require('bluebird');

/**
 * @api {socket.io} <prefix>.rooms.join Join a room
 * @apiDescription Returns collection of `message` objects. If the room has pinned message
 * `pin` object will be first item in collection and will not affect meta.
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
 * @apiGroup RoomsBroadcast
 * @apiSchema {jsonschema=../../schemas/rooms.join.broadcast.json} apiSuccess
 */
function RoomsJoinAction(request) {
  const { socket, params } = request;
  const { id, before } = params;
  const { user } = socket;
  const userResponse = modelResponse(user, TYPE_USER);

  socket.on('disconnect', () =>
    socket.broadcast.to(id).emit(`rooms.leave.${id}`, modelResponse(user, TYPE_USER))
  );

  return Promise
    .fromCallback(callback => socket.join(id, callback))
    .tap(() => socket.broadcast.to(id).emit(`rooms.join.${id}`, userResponse))
    .then(() => Promise.join(
      this.services.message.history(id),
      this.services.pin.last(id),
      this.services.participant.add(id, user)
    ))
    .spread((messages, pin) => {
      const response = collectionResponse(messages, TYPE_MESSAGE, { before });

      if (pin) {
        response.data.push(transform(pin, TYPE_PIN));
      }

      return response;
    });
}

const allowed = (request) => {
  const { room, socket } = request;

  if (socket.rooms[room.id.toString()]) {
    return Promise.reject(new Errors.NotPermittedError('Already in the room'));
  }

  return Promise.resolve(request);
};

RoomsJoinAction.allowed = allowed;
RoomsJoinAction.fetcher = fetchRoom();
RoomsJoinAction.schema = 'rooms.join';
RoomsJoinAction.transports = ['socketIO'];

module.exports = RoomsJoinAction;
