const AbstractAction = require('./../../abstractAction');
const Promise = require('bluebird');

/**
 *
 */
class RoomsDeleteAction extends AbstractAction
{
  /**
   * @param socket
   * @param context
   * @returns {*}
   */
  handler(socket, context) {
    return context.room.deleteAsync()
      .then(() => true);
  }

  /**
   * @param socket
   * @param context
   * @returns {Promise.<boolean>}
   */
  allowed(socket, context) {
    if (context.user.isAdmin === false) {
      return Promise.resolve(false);
    }

    return this.application.services.room.getById(context.params.id)
      .then(room => {
        if (!room) {
          return Promise.resolve(false);
        }

        context.room = room;

        return Promise.resolve(room.createdBy === context.user.id);
      });
  }
}

module.exports = RoomsDeleteAction;
