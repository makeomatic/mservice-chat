const AbstractAction = require('./../../abstractAction');

class RoomsLeaveAction extends AbstractAction
{
  /**
   *
   */
  handler(socket, context) {
    socket.leave(context.params.id);
    socket.nsp.in(context.params.id).emit('rooms.leave', {
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
    if (socket.rooms.hasOwnProperty(context.params.id) === false) {
      return Promise.resolve(false);
    }

    return this.application.services.room.getById(context.params.id)
      .then(room => {
        if (!room) {
          return Promise.resolve(false);
        }

        context.room = room;

        return Promise.resolve(room.id.toString() === context.params.id);
      });
  }
}

module.exports = RoomsLeaveAction;
