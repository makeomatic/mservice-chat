const AbstractAction = require('./../../abstractAction');

/**
 *
 */
class RoomsCreateAction extends AbstractAction
{
  /**
   * @param socket
   * @param context
   */
  handler(socket, context) {
    const properties = Object.assign({ createdBy: context.user.id }, context.params);

    return this.application.services.room.create(properties);
  }

  /**
   * @param socket
   * @param context
   * @returns {*}
   */
  allowed(socket, context) {
    return Promise.resolve(context.user.isAdmin);
  }
}

module.exports = RoomsCreateAction;
