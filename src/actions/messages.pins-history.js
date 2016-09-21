const { collectionResponse, TYPE_PIN } = require('../utils/response');
const Errors = require('common-errors');
const isElevated = require('../services/roles/isElevated');
const fetchRoom = require('../fetchers/room')('roomId');

/**
 * @api {http} <prefix>.messages.pins-history Get pins history
 * @apiVersion 1.0.0
 * @apiName messages.pins-history
 * @apiGroup Messages
 * @apiSchema {jsonschema=../../schemas/messages.pins-history.json} apiParam
 * @apiSchema {jsonschema=../../schemas/messages.pins-history.response.json} apiSuccess
 */
function messagePinsHistoryAction(request) {
  const { roomId, before, limit } = request.params;
  return this.services.pin
    .history(roomId, before, limit)
    .then(pins => collectionResponse(pins, TYPE_PIN, { before }));
}

function allowed(request) {
  const { auth, room, params } = request;
  const admin = auth.credentials.user;

  if (isElevated(admin, room) !== true) {
    throw new Errors.NotPermittedError(`Access to room #${params.roomId} is denied`);
  }

  return Promise.resolve(request);
}

messagePinsHistoryAction.allowed = allowed;
messagePinsHistoryAction.auth = 'token';
messagePinsHistoryAction.fetcher = fetchRoom;
messagePinsHistoryAction.schema = 'messages.pins-history';
messagePinsHistoryAction.transports = ['http'];

module.exports = messagePinsHistoryAction;
