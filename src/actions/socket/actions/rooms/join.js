const AbstractAction = require('./../../abstractAction');
const Errors = require('common-errors');

/**
 *
 */
class RoomsJoinAction extends AbstractAction
{
  /**
   *
   */
  handler(socket, context) {
    socket.join(context.params.id);
    socket.nsp.in(context.params.id).emit('rooms.join', {
      user: context.user,
      room: context.room,
    });

    return Promise.resolve(context.room);
  }

  /**
   * @param socket
   * @param context
   * @returns {*}
   */
  allowed(socket, context) {
    if (socket.rooms.hasOwnProperty(context.params.id)) {
      return Promise.resolve(false);
    }

    return this.application.services.room.getById(context.params.id)
      .then(room => {
        if (!room) {
          return Promise.reject(
            /**
             * @todo realize fetch objects?
             * e.g. const fetch = [
             *  {
             *    query: 'id',
             *    model: 'Room',
             *    toProperty: 'room'
             *  }
             * ]
             */
            new Errors.NotFoundError('Room')
          );
        }

        context.room = room;

        return Promise.resolve(room.id.toString() === context.params.id);
      });
  }
}

module.exports = RoomsJoinAction;
