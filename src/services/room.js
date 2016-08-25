const _ = require('lodash');
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
      throw new Errors.Argument('cassandraClient');
    }

    if (is.fn(cassandraClient.modelInstance.room) === false) {
      throw new Errors.Argument('cassandraClient', 'Model \'room\' not found');
    }

    this.cassandraClient = cassandraClient;
    this.model = Promise.promisifyAll(cassandraClient.modelInstance.room);
  }

  /**
   * @param {string} id
   * @returns {Promise}
   */
  getById(id) {
    if (is.string(id) === false) {
      throw new Errors.Argument('id');
    }

    return this.model.findOneAsync({ id: this.cassandraClient.datatypes.Uuid.fromString(id) })
      .then(room => {
        if (!room) {
          return Promise.reject(new Errors.NotFoundError(`Room #${id} not found`));
        }

        return Promise.resolve(room);
      });
  }

  /**
   * @param {object} query
   * @param {object} options
   * @returns {Promise.<Object[]>}
   */
  find(query = {}, options = {}) {
    if (is.object(query) === false) {
      throw new Errors.Argument('query');
    }

    if (is.object(options) === false) {
      throw new Errors.Argument('options');
    }

    return this.model.findAsync(query, options);
  }

  /**
   * @param properties
   * @returns {*}
   */
  create(properties) {
    const RoomModel = this.model;
    const roomParams = Object.assign({}, properties, {
      id: this.cassandraClient.uuid(),
      createdAt: _.now(),
    });
    const room = new RoomModel(roomParams);

    return room.saveAsync()
      .return(room);
  }
}

module.exports = RoomService;
