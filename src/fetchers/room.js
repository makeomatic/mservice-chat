const Promise = require('bluebird');

module.exports = function fetchRoom(request, application) {
  return application.services.room.getById(request.params.id)
    .then(room => {
      request.room = room;
      return Promise.resolve(request);
    });
};
