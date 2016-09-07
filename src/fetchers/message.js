const Promise = require('bluebird');

function fetchMessage(request, application) {
  return application.services.message
    .getById(request.params.id)
    .tap(message => {
      request.message = message;
    })
    .then(message => application.services.room.getById(message.roomId.toString()))
    .tap(room => {
      request.room = room;
    })
    .then(() => Promise.resolve(request));
}

module.exports = fetchMessage;
