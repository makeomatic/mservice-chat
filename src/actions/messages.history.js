const { collectionResponse } = require('../responses/message');

/**
 * @api {http} <prefix>.messages.history Get messages history
 * @apiVersion 1.0.0
 * @apiName messages.history
 * @apiGroup Messages
 * @apiSchema {jsonschema=../../schemas/messages.history.json} apiParam
 * @apiSchema {jsonschema=../../schemas/messages.history.response.json} apiSuccess
 */
function messageHistoryAction(request) {
  const { roomId, before, limit } = request.params;
  return this.services.message
    .history(roomId, before, limit)
    .then(messages => collectionResponse(messages, { before }));
}

messageHistoryAction.schema = 'messages.history';
messageHistoryAction.transports = ['http'];

module.exports = messageHistoryAction;
