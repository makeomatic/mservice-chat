/**
 * @api {http} <prefix>.rooms.list Get a list of rooms
 * @apiVersion 1.0.0
 * @apiName rooms.list
 * @apiGroup Rooms
 * @apiSchema {jsonschema=../../schemas/rooms.list.json} apiParam
 */
function RoomsListAction() {
  return this.services.room.find();
}

RoomsListAction.schema = 'rooms.list';
RoomsListAction.transports = ['http'];

module.exports = RoomsListAction;
