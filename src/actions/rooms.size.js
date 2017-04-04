/**
* @api {http} <prefix>.rooms.size Get number of participants in room
* @apiVersion 1.0.0
* @apiName rooms.size
* @apiGroup Rooms
* @apiSchema {jsonschema=../../schemas/rooms.size.json} apiParam
* @apiSchema {jsonschema=../../schemas/rooms.size.response.json} apiSuccess
*/

function RoomsSizeAction(request) {
  const { params, socket } = request;
  const room = socket.adapter.rooms[params.roomId];

  return { data: { size: room.length } };
}

RoomsSizeAction.auth = 'token';
RoomsSizeAction.schema = 'rooms.size';
RoomsSizeAction.transports = ['http', 'socketIO'];

module.exports = RoomsSizeAction;
