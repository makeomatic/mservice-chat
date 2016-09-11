function getFetcher(key = 'id') {
  function fetchUser(request, application) {
    return application.services.user
      .getById(request.params[key])
      .tap(user => (request.user = user));
  }

  return fetchUser;
}

module.exports = getFetcher;
