/**
 * @param {String} userKey if userKey is null, get userId from current user
 */
function getFetcher(userKey = 'userId', roomKey = 'roomId') {
  function fetchBan(request, application) {
    const { socket, params } = request;
    const userId = userKey !== null ? params[userKey] : socket.user.id;

    return application.services.ban
      .findById(params[roomKey], userId)
      .tap(ban => (request.ban = ban));
  }

  return fetchBan;
}

module.exports = getFetcher;
