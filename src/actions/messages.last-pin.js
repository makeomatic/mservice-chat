const fetchRoom = require('../fetchers/room')('roomId');
const { modelResponse } = require('../responses/pin');

/**
 * @api {http} <prefix>.messages.last-pin Get last pin
 * @apiVersion 1.0.0
 * @apiName messages.last-pin
 * @apiGroup Messages
 * @apiSchema {jsonschema=../../schemas/messages.last-pin.json} apiParam
 * @apiSchema {jsonschema=../../schemas/messages.last-pin.response.json} apiSuccess
 */
function messagesUnpinAction(request) {
  const { room } = request;

  return this.services.pin
    .last(room.id)
    .then(modelResponse);
}

messagesUnpinAction.fetcher = fetchRoom;
messagesUnpinAction.schema = 'messages.last-pin';
messagesUnpinAction.transports = ['http'];

module.exports = messagesUnpinAction;
