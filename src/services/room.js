const assert = require('assert');
const Errors = require('common-errors');
const is = require('is');
const Promise = require('bluebird');

/**
 * @property {CassandraClient} cassandraClient
 * @property {BaseModel} model
 */
class RoomService
{
  /**
   * @param {CassandraClient} cassandraClient
   */
  constructor(cassandraClient) {
    if (is.object(cassandraClient.modelInstance) === false) {
      throw Errors.Argument('cassandraClient');
    }

    if (is.fn(cassandraClient.modelInstance.room) === false) {
      throw Errors.Argument('cassandraClient', 'Model \'room\' not found');
    }

    this.cassandraClient = cassandraClient;
    this.model = Promise.promisifyAll(cassandraClient.modelInstance.room);
    /** @todo remove it then https://github.com/masumsoft/express-cassandra/issues/53 will be done */
    this.model.prototype.toJSON = function toSimpleObject() {
      const simpleObject = Object.assign({}, this);
      delete simpleObject._validators;

      return simpleObject;
    };
  }

  /**
   * @param {string} id
   * @returns {Promise}
   */
  getById(id) {
    if (is.string(id) === false) {
      throw Errors.Argument('id');
    }

    return this.model.findOneAsync({
      id: this.cassandraClient.datatypes.Uuid.fromString(id),
    });
  }

  /**
   * @param {object} query
   * @param {object} options
   * @returns {Promise.<Object[]>}
   */
  find(query = {}, options = {}) {
    if (is.object(query) === false) {
      throw Errors.Argument('query');
    }

    if (is.object(options) === false) {
      throw Errors.Argument('options');
    }

    return this.model.findAsync(query, options);
  }

  /**
   * @param properties
   * @returns {*}
   */
  create(properties) {
    const room = new this.model(Object.assign({
      id: this.cassandraClient.uuid(),
    }, properties));

    return room.saveAsync()
      .then(() => room);
  }
}

module.exports = RoomService;
