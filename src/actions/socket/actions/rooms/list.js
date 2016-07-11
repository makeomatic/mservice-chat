const AbstractAction = require('./../../abstractAction');
const Promise = require('bluebird');

/**
 *
 */
class RoomsListAction extends AbstractAction
{
  /**
   * @returns {Promise.<Object[]>}
   */
  handler() {
    return this.application.services.room.find();
  }

  /**
   * @returns {Promise.<boolean>}
   */
  allowed() {
    return Promise.resolve(true);
  }
}

module.exports = RoomsListAction;
