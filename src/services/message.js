const now = require('lodash/now');
const Errors = require('common-errors');
const is = require('is');
const Promise = require('bluebird');

class MessageService
{
  constructor(cassandraClient, flakeless) {
    if (is.object(cassandraClient.modelInstance) === false) {
      throw new Errors.Argument('cassandraClient');
    }

    if (is.fn(cassandraClient.modelInstance.message) === false) {
      throw new Errors.Argument('cassandraClient', 'Model \'message\' not found');
    }

    this.cassandraClient = cassandraClient;
    this.flakeless = flakeless;
    this.model = Promise.promisifyAll(cassandraClient.modelInstance.message);
  }

  /**
   * @param properties
   * @returns {*}
   */
  create(properties) {
    const MessageModel = this.model;
    const messageParams = Object.assign({}, properties, {
      id: this.flakeless.next(),
      createdAt: now(),
      properties: {},
      attachments: {},
    });
    const message = new MessageModel(messageParams);

    return message
      .saveAsync()
      .return(message);
  }

  getById(id, roomId) {
    const query = {
      id,
      roomId: this.cassandraClient.datatypes.Uuid.fromString(roomId),
    };

    return this.model
      .findOneAsync(query)
      .then(message => {
        if (!message) {
          return Promise.reject(new Errors.NotFoundError(`Message #${id} not found`));
        }

        return Promise.resolve(message);
      });
  }

  find(cond = {}, sort = {}, limit = 20) {
    const query = this.makeCond(cond, sort, limit);

    return this.model.findAsync(query);
  }

  makeCond(cond = {}, sort = {}, limit) {
    const query = Object.assign({}, cond);

    if (query.roomId) {
      query.roomId = this.cassandraClient.datatypes.Uuid.fromString(query.roomId);
    }

    if (sort) {
      query.$orderby = sort;
    }

    if (limit) {
      query.$limit = limit;
    }

    return query;
  }
}

module.exports = MessageService;
