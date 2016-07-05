const AbstractAction = require('./../abstractAction');
const Promise = require('bluebird');

/**
 * @todo remove, use ms-users
 */
class MeAction extends AbstractAction
{
  /**
   * @returns {Promise.<Object[]>}
   */
  handler(socket, context) {
    return Promise.resolve(context.user);
  }

  /**
   * @returns {Promise.<boolean>}
   */
  allowed() {
    return Promise.resolve(true);
  }
}

module.exports = MeAction;
