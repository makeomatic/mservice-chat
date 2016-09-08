const Errors = require('common-errors');
const is = require('is');
const now = require('lodash/now');
const merge = require('lodash/merge');
const mapValues = require('lodash/mapValues');
const Promise = require('bluebird');
const { uuidFromString, datatypes } = require('express-cassandra');

function makeCond(cond = {}, sort = {}, limit) {
  const query = merge({}, cond);

  if (is.string(query.roomId) === true) {
    query.roomId = uuidFromString(query.roomId);
  }

  if (is.string(query.id) === true) {
    query.id = datatypes.Long.fromString(query.id);
  } else if (is.object(query.id) === true) {
    query.id = mapValues(query.id, value => datatypes.Long.fromString(value));
  }

  if (Object.keys(sort).length) {
    query.$orderby = sort;
  }

  if (limit) {
    query.$limit = limit;
  }

  return query;
}

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
      id: datatypes.Long.fromString(this.flakeless.next()),
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
    const query = makeCond({ id, roomId });

    return this.model
      .findOneAsync(query)
      .tap(message => {
        if (!message) {
          throw new Errors.NotFoundError(`Message #${id} not found`);
        }
      });
  }

  find(cond = {}, sort = {}, limit = 20) {
    const query = makeCond(cond, sort, limit);

    return this.model.findAsync(query);
  }

  history(roomId, before, limit = 20) {
    const query = { roomId };

    if (before) {
      query.id = { $lt: before };
    }

    return this.find(query, { $desc: 'id' }, limit);
  }
}

module.exports = MessageService;
