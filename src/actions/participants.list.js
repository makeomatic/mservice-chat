const {
  collectionResponse,
  SERIALIZATION_GROUP_ADMIN,
  SERIALIZATION_GROUP_USER,
} = require('../responses/participant');
const moment = require('moment');
const { timeuuidFromDate } = require('express-cassandra');

/**
 * @api {http} <prefix>.participants.list Get list of participants
 * @apiDescription Use `joinedAt` field for pagination
 * @apiVersion 1.0.0
 * @apiName participants.list
 * @apiGroup Participants
 * @apiSchema {jsonschema=../../schemas/participants.list.json} apiParam
 * @apiSchema {jsonschema=../../schemas/participants.list.response.json} apiSuccess
 */
function participantsListAction(request) {
  const { participant: participantService } = this.services;
  const { roomId, before, limit } = request.params;
  const { listDaysNumber } = participantService.config;
  const listBefore = before
    || timeuuidFromDate(moment().subtract(listDaysNumber, 'days').startOf('day').toDate());
  const collectionOptions = { before, cursor: 'joinedAt' };
  const serializationGroup = (request.auth && request.auth.credentials.user.isElevated)
    ? SERIALIZATION_GROUP_ADMIN
    : SERIALIZATION_GROUP_USER;

  return participantService
    .list(roomId, listBefore, limit)
    .then(participants => collectionResponse(participants, serializationGroup, collectionOptions));
}

participantsListAction.schema = 'participants.list';
participantsListAction.transports = ['http'];

module.exports = participantsListAction;
