function makeCollectionResponse(messages, request) {
  const { before } = request.params;
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

module.exports = makeCollectionResponse;
