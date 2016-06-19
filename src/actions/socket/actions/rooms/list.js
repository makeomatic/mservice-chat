const AbstractAction = require('./../../abstractAction');
const Promise = require('bluebird');

/**
 *
 */
class RoomsListAction extends AbstractAction
{
  /**
   *
   */
  handler() {
    const Room = this.service.cassandra.instance.room;
    const find = Promise.promisify(Room.find, { context: Room });

    return find({});
  }

  /**
   * @returns {Promise.<boolean>}
   */
  allowed() {
    return Promise.resolve(true);
  }
}

module.exports = RoomsListAction;
