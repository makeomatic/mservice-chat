const now = require('lodash/now');
const Errors = require('common-errors');
const is = require('is');
const Promise = require('bluebird');

class MessageService
{
  constructor(cassandraClient) {
    if (is.object(cassandraClient.modelInstance) === false) {
      throw new Errors.Argument('cassandraClient');
    }

    if (is.fn(cassandraClient.modelInstance.message) === false) {
      throw new Errors.Argument('cassandraClient', 'Model \'message\' not found');
    }

    this.cassandraClient = cassandraClient;
    this.model = Promise.promisifyAll(cassandraClient.modelInstance.message);
  }

  /**
   * @param properties
   * @returns {*}
   */
  create(properties) {
    const MessageModel = this.model;
    const messageParams = Object.assign({}, properties, {
      id: this.cassandraClient.uuid(),
      createdAt: now(),
      properties: {},
      attachments: {},
    });
    const message = new MessageModel(messageParams);

    return message
      .saveAsync()
      .return(message);
  }

  find(cond = {}, sort = {}, limit = 20) {
    const query = Object.assign({}, cond);

    ['id', 'roomId'].forEach(field => {
      if (query[field]) {
        query[field] = this.cassandraClient.datatypes.Uuid.fromString(query[field]);
      }
    });

    if (sort) {
      query.$orderby = sort;
    }

    if (limit) {
      query.$limit = limit;
    }

    return this.model.findAsync(query);
  }
}

module.exports = MessageService;
