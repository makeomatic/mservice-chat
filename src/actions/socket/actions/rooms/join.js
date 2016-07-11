const AbstractAction = require('./../../abstractAction');
const Errors = require('common-errors');
const Promise = require('bluebird');

/**
 *
 */
class RoomsJoinAction extends AbstractAction
{
  /**
   *
   */
  handler(socket, context) {
    return Promise.fromCallback(callback => socket.join(context.params.id, callback))
      .tap(() => {
        socket.nsp.in(context.params.id).emit('rooms.join', {
          user: context.user,
          room: context.room,
        });
      })
      .return(context.room);
  }

  /**
   * @param socket
   * @param context
   * @returns {*}
   */
  allowed(socket, context) {
    if (socket.rooms[context.params.id]) {
      return Promise.reject(new Errors.NotPermittedError('Already in the room'));
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
