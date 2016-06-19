const assert = require('assert');
const is = require('is');
const Promise = require('bluebird');

/**
 *
 */
class Room
{
  /**
   * @param cassandra
   */
  constructor(cassandra) {
    this.cassandra = cassandra;
    this.model = cassandra.instance.room;
  }

  /**
   * @param cassandra
   * @returns {Room}
   */
  static factory(cassandra) {
    return new Room(cassandra);
  }

  /**
   * @param {string} id
   * @returns {Promise}
   */
  getById(id) {
    assert(is.string(id));
    const findOne = Promise.promisify(this.model.findOne, { context: this.model });
    return findOne({id: this.cassandra.datatypes.Uuid.fromString(id)});
  }
}

module.exports = Room;
