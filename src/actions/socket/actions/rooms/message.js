const AbstractAction = require('./../../abstractAction');
const Promise = require('bluebird');

/**
 *
 */
class RoomsMessageAction extends AbstractAction
{
  /**
   * @param socket
   * @param context
   * @returns {Promise.<boolean>}
   */
  handler(socket, context) {
    socket.nsp.in(context.params.id).emit('rooms.message', context.user, context.params);

    return Promise.resolve(true);
  }

  /**
   * @param socket
   * @param context
   * @returns {Promise.<boolean>}
   */
  allowed(socket, context) {
    let allowed = socket.rooms.hasOwnProperty(context.params.id);

    if (context.params.message.type !== 'simple') {
      allowed = allowed && context.user.isAdmin;
    }

    return Promise.resolve(allowed);
  }
}

module.exports = RoomsMessageAction;
