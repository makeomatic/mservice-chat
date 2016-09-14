function getFetcher(key = 'id') {
  function fetchRoom(request, application) {
    return application.services.room
      .getById(request.params[key])
      .tap(room => (request.room = room));
  }

  return fetchRoom;
}

module.exports = getFetcher;
