const Promise = require('bluebird');

function fetchMessage(request, application) {
  const { id, roomId } = request.params;

  return application.services.message
    .getById(id, roomId)
    .tap((message) => {
      request.message = message;
    })
    .then(() => application.services.room.getById(roomId))
    .tap((room) => {
      request.room = room;
    })
    .then(() => Promise.resolve(request));
}

module.exports = fetchMessage;
