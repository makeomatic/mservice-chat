const Promise = require('bluebird');

module.exports = function getFetcher(key = 'id') {
  function fetchRoom(request, application) {
    return application.services.room.getById(request.params[key])
      .then((room) => {
        request.room = room;
        return Promise.resolve(request);
      });
  }

  return fetchRoom;
};
