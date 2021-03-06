const { collectionResponse } = require('../responses/room');

/**
 * @api {http} <prefix>.rooms.list Get a list of rooms
 * @apiVersion 1.0.0
 * @apiName rooms.list
 * @apiGroup Rooms
 */
function RoomsListAction() {
  return this.services.room
    .find()
    .then(collectionResponse);
}

RoomsListAction.transports = ['http'];

module.exports = RoomsListAction;
