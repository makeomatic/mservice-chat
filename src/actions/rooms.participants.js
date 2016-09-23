const { collectionResponse, TYPE_PARTICIPANT } = require('../utils/response');

/**
 * @api {http} <prefix>.rooms.participants Get list of participants
 * @apiDescription Use `joinedAt` field for pagination
 * @apiVersion 1.0.0
 * @apiName rooms.participants
 * @apiGroup Rooms
 * @apiSchema {jsonschema=../../schemas/rooms.participants.json} apiParam
 * @apiSchema {jsonschema=../../schemas/rooms.participants.response.json} apiSuccess
 */
function roomsParticipantsAction(request) {
  const { roomId, before, limit } = request.params;
  const collectionOptions = { before, cursor: 'joinedAt' };

  return this.services.participant
    .list(roomId, before, limit)
    .then(participants => collectionResponse(participants, TYPE_PARTICIPANT, collectionOptions));
}

roomsParticipantsAction.schema = 'rooms.participants';
roomsParticipantsAction.transports = ['http'];

module.exports = roomsParticipantsAction;
