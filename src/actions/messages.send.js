const Errors = require('common-errors');
const fetchRoom = require('../fetchers/room');
const fetchBan = require('../fetchers/ban');
const isElevated = require('../services/roles/isElevated');
const Promise = require('bluebird');
const { modelResponse, TYPE_MESSAGE } = require('../utils/response');

/**
 * @api {socket.io} <prefix>.messages.send Send message to a room
 * @apiVersion 1.0.0
 * @apiName messages.send
 * @apiGroup Messages
 * @apiParam (Payload) {String} roomId - Room identificator
 * @apiParam (Payload) {Object} message - Message object
 * @apiParam (Payload) {String} message.text - Text
 * @apiParam (Payload) {String} [message.type] - `sticky` if sticky message
 * @apiSchema {jsonschema=../../schemas/messages.send.response.json} apiSuccess
 */
 /**
  * @api {socket.io} messages.send.<roomId> Send message to a room
  * @apiDescription Fired when somebody sends message to a room
  * @apiVersion 1.0.0
  * @apiName messages.send.broadcast
  * @apiGroup MessagesBroadcast
  * @apiSchema {jsonschema=../../schemas/messages.send.broadcast.json} apiSuccess
  */
function messageSendAction(request) {
  const { params, room, socket } = request;
  const { message: messageService, pin: pinService, participant } = this.services;
  const roomId = room.id.toString();
  const { user } = socket;
  const message = {
    user,
    roomId: room.id,
    text: params.message.text,
    userId: socket.user.id,
  };

  return messageService
    .create(message)
    .tap((createdMessage) => {
      if (params.message.type === 'sticky') {
        return pinService.pinAndBroadcast(room.id, createdMessage, user);
      }

      return null;
    })
    .then(createdMessage => modelResponse(createdMessage, TYPE_MESSAGE))
    .tap((response) => {
      if (params.message.type !== 'sticky') {
        socket.broadcast.to(roomId).emit(`messages.send.${roomId}`, response);
      }
    })
    .tap(() => participant.updateActivity(roomId, user.id));
}

function allowed(request) {
  const { ban, params, room, socket } = request;
  const { user } = socket;

  if (!socket.rooms[room.id.toString()]) {
    return Promise.reject(new Errors.NotPermittedError('Not in the room'));
  }

  if (user.isGuest === true) {
    return Promise.reject(new Errors.NotPermittedError('Access denied for guests'));
  }

  if (ban !== undefined) {
    throw new Errors.NotPermittedError(`User #${user.id} is banned`);
  }

  if (params.message.type && isElevated(user, room) !== true) {
    return Promise.reject(
      new Errors.NotPermittedError(`Access denied for message type "${params.message.type}"`)
    );
  }

  return Promise.resolve(request);
}

messageSendAction.allowed = allowed;
messageSendAction.fetchers = [fetchRoom('roomId'), fetchBan(null)];
messageSendAction.schema = 'messages.send';
messageSendAction.transports = ['socketIO'];

module.exports = messageSendAction;
