const AbstractAction = require('./../../abstractAction');
const Errors = require('common-errors');
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
    socket.nsp.in(context.params.id).emit('rooms.message', {
      user: context.user,
      room: context.params.id,
      message: context.params.message,
    });

    return Promise.resolve(true);
  }

  /**
   * @param socket
   * @param context
   * @returns {Promise.<boolean>}
   */
  allowed(socket, context) {
    if (!socket.rooms[context.params.id]) {
      return Promise.reject(new Errors.NotPermittedError('Not in the room'));
    }

    if (context.params.message.type !== 'simple' && context.user.isAdmin !== true) {
      return Promise.reject(new Errors.NotPermittedError('Access denied'));
    }

    return Promise.resolve(true);
  }
}

module.exports = RoomsMessageAction;
