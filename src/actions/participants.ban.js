const Promise = require('bluebird');
const Errors = require('common-errors');
const isElevated = require('../services/roles/isElevated');
const fetchRoom = require('../fetchers/room');
const fetchParticipant = require('../fetchers/participant');
const { modelResponse, SERIALIZATION_GROUP_ADMIN } = require('../responses/participant');

/**
 * @api {http} <prefix>.participants.ban Ban an user
 * @apiVersion 1.0.0
 * @apiName participants.ban
 * @apiGroup Participants
 * @apiSchema {jsonschema=../../schemas/participants.ban.json} apiParam
 * @apiSchema {jsonschema=../../schemas/participants.ban.response.json} apiSuccess
 */
 /**
  * @api {socket.io} participants.ban.<roomId> Ban an user
  * @apiDescription Fired when somebody ban an user
  * @apiVersion 1.0.0
  * @apiName participants.ban.broadcast
  * @apiGroup ParticipantsBroadcast
  * @apiSchema {jsonschema=../../schemas/participants.ban.broadcast.json} apiSuccess
  */
function participantsBanAction(request) {
  const { socketIO, services } = this;
  const { auth, params } = request;
  const { reason, roomId, id } = params;
  const admin = auth.credentials.user;

  return services.participant
    .ban(roomId, id, admin, reason)
    .then(() => services.participant.findOne({ roomId, id }))
    .then(bannedParticipant => modelResponse(bannedParticipant, SERIALIZATION_GROUP_ADMIN))
    .tap(response => socketIO.in(roomId).emit(`participants.ban.${roomId}`, response));
}

function allowed(request) {
  const { auth, room, participant, params } = request;
  const admin = auth.credentials.user;

  if (isElevated(admin, room) !== true) {
    throw new Errors.NotPermittedError(`Access to room #${params.roomId} is denied`);
  }

  if (admin.id === participant.id) {
    throw new Errors.NotPermittedError('Can\'t ban yourself');
  }

  // @todo fetch user object
  if (participant.roles && participant.roles.includes('root')) {
    throw new Errors.NotPermittedError('Can\'t ban root admin');
  }

  if (participant.bannedAt) {
    throw new Errors.NotPermittedError(`User #${participant.id} is already banned`);
  }

  return Promise.resolve(request);
}

participantsBanAction.allowed = allowed;
participantsBanAction.auth = 'token';
participantsBanAction.syncFetchers = [fetchRoom('roomId'), fetchParticipant()];
participantsBanAction.schema = 'participants.ban';
participantsBanAction.transports = ['http'];

module.exports = participantsBanAction;
