const Errors = require('common-errors');
const is = require('is');
const merge = require('lodash/merge');
const Promise = require('bluebird');
const { uuid, uuidFromString } = require('express-cassandra');

function makeCond(cond = {}) {
  const query = merge({}, cond);

  if (is.string(query.id) === true) {
    query.id = uuidFromString(query.id);
  }

  return query;
}

class RoomService
{
  constructor(cassandraClient) {
    if (is.object(cassandraClient.modelInstance) === false) {
      throw new Errors.Argument('cassandraClient');
    }

    if (is.fn(cassandraClient.modelInstance.room) === false) {
      throw new Errors.Argument('cassandraClient', 'Model \'room\' not found');
    }

    this.model = Promise.promisifyAll(cassandraClient.modelInstance.room);
  }

  /**
   * @param {string} id
   * @returns {Promise}
   */
  getById(id) {
    const query = makeCond({ id });

    return this.model
      .findOneAsync(query)
      .tap(room => {
        if (!room) {
          throw new Errors.NotFoundError(`Room #${id} not found`);
        }
      });
  }

  /**
   * @param {object} query
   * @param {object} options
   * @returns {Promise.<Object[]>}
   */
  find(cond = {}) {
    if (is.object(cond) === false) {
      throw new Errors.Argument('query');
    }

    const query = makeCond(cond);

    return this.model
      .findAsync(query);
  }

  /**
   * @param properties
   * @returns {*}
   */
  create(properties) {
    const RoomModel = this.model;
    const roomParams = Object.assign({ banned: [] }, properties, {
      id: uuid(),
      createdAt: Date.now(),
    });
    const room = new RoomModel(roomParams);

    return room
      .saveAsync()
      .return(room);
  }

  update(cond = {}, update = {}) {
    const query = makeCond(cond);

    return this.model.updateAsync(query, update);
  }

  ban(roomId, userId) {
    return this.update({ id: roomId }, { banned: { $add: [userId] } });
  }

  unban(roomId, userId) {
    return this.update({ id: roomId }, { banned: { $remove: [userId] } });
  }
}

module.exports = RoomService;
