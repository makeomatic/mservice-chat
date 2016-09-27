/**
 * @param {String} userKey if userKey is null, get userId from current user
 */
function getFetcher(userKey = 'id', roomKey = 'roomId') {
  function fetchParticipant(request, application) {
    const { socket, params } = request;
    const userId = userKey !== null ? params[userKey] : socket.user.id;

    return application.services.participant
      .getById(params[roomKey], userId)
      .tap(participant => (request.participant = participant));
  }

  return fetchParticipant;
}

module.exports = getFetcher;
