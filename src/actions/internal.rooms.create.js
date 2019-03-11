const { ActionTransport } = require('@microfleet/core');

/**
 * @api {amqp} <prefix>.internal.rooms.create Create a room, for internal use only
 * @apiVersion 1.0.0
 * @apiName internal.rooms.create
 * @apiGroup RoomInternal
 * @apiSchema {jsonschema=../../schemas/internal.rooms.create.json} apiParam
 */
function internalRoomsCreate(request) {
  return this.services.room.create(request.params);
}

internalRoomsCreate.schema = 'internal.rooms.create';
internalRoomsCreate.transports = [ActionTransport.amqp];

module.exports = internalRoomsCreate;
