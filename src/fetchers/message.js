function getFetcher(messageKey = 'id', roomKey = 'roomId') {
  function fetchMessage(request, application) {
    const { params } = request;

    return application.services.message
      .getById(params[messageKey], params[roomKey])
      .tap(message => (request.message = message));
  }

  return fetchMessage;
}

module.exports = getFetcher;
