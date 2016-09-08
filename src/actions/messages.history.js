function makeResponse(messages, { before }) {
  const response = {
    meta: {
      count: messages.length,
    },
    data: messages,
  };

  if (messages.length) {
    response.meta.last = messages[0].id;
  }

  if (before) {
    response.meta.before = before;
  }

  return response;
}

/**
 * @api {http} <prefix>.messages.history Get messages history
 * @apiVersion 1.0.0
 * @apiName messages.history
 * @apiGroup Messages
 * @apiSchema {jsonschema=../../schemas/messages.history.json} apiParam
 * @apiSchema {jsonschema=../../schemas/messages.history.response.json} apiSuccess
 */
function messageHistoryAction({ params }) {
  const { roomId, before, limit } = params;
  return this.services.message
    .history(roomId, before, limit)
    .then(messages => makeResponse(messages, params));
}

messageHistoryAction.schema = 'messages.history';
messageHistoryAction.transports = ['http'];

module.exports = messageHistoryAction;
