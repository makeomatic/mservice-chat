const { ActionTransport } = require('mservice');
const { successResponse } = require('../responses/success');

/**
 * @api {amqp} <prefix>.internal.rooms.broadcast Broadcast event, for internal use only
 * @apiVersion 1.0.0
 * @apiName internal.rooms.broadcast
 * @apiGroup RoomInternal
 * @apiSchema {jsonschema=../../schemas/internal.rooms.broadcast.json} apiParam
 */
function internalRoomsBroadcast({ params }) {
  const { socketIO } = this;
  const { roomId, event, message } = params;

  socketIO.in(roomId).emit(`broadcast.${event}.${roomId}`, message);

  return successResponse();
}

internalRoomsBroadcast.schema = 'internal.rooms.broadcast';
internalRoomsBroadcast.transports = [ActionTransport.amqp];

module.exports = internalRoomsBroadcast;
