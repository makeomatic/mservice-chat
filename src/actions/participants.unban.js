const Errors = require('common-errors');
const isElevated = require('../services/roles/isElevated');
const fetchParticipant = require('../fetchers/participant');
const fetchRoom = require('../fetchers/room');
const { modelResponse, TYPE_PARTICIPANT } = require('../utils/response');

/**
 * @api {http} <prefix>.participants.unban Unban an user
 * @apiVersion 1.0.0
 * @apiName participants.unban
 * @apiGroup Participants
 * @apiSchema {jsonschema=../../schemas/participants.unban.json} apiParam
 * @apiSchema {jsonschema=../../schemas/participants.unban.response.json} apiSuccess
 */
 /**
  * @api {socket.io} participants.unban.<roomId> Unban an user
  * @apiDescription Fired when somebody unban an user
  * @apiVersion 1.0.0
  * @apiName participants.unban.broadcast
  * @apiGroup ParticipantsBroadcast
  * @apiSchema {jsonschema=../../schemas/participants.unban.broadcast.json} apiSuccess
  */
function participantsUnbanAction(request) {
  const { socketIO, services } = this;
  const { params } = request;
  const { roomId, id } = params;

  return services.participant
    .unban(roomId, id)
    .then(() => services.participant.findOne({ roomId, id }))
    .then(unbannedParticipant => modelResponse(unbannedParticipant, TYPE_PARTICIPANT))
    .tap(response => socketIO.in(roomId).emit(`participants.unban.${roomId}`, response));
}

function allowed(request) {
  const { auth, participant, room, params } = request;
  const admin = auth.credentials.user;

  if (isElevated(admin, room) !== true) {
    throw new Errors.NotPermittedError(`Access to room #${params.roomId} is denied`);
  }

  if (admin.id === participant.id) {
    throw new Errors.NotPermittedError('Can\'t unban yourself');
  }

  if (!participant.bannedAt) {
    throw new Errors.NotPermittedError(`Participant #${params.id} isn\'t banned`);
  }

  return Promise.resolve(request);
}

participantsUnbanAction.allowed = allowed;
participantsUnbanAction.auth = 'token';
participantsUnbanAction.syncFetchers = [fetchRoom('roomId'), fetchParticipant()];
participantsUnbanAction.schema = 'participants.unban';
participantsUnbanAction.transports = ['http'];

module.exports = participantsUnbanAction;
