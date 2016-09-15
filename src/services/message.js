const CassandraMixin = require('./mixins/model/cassandra');
const Errors = require('common-errors');
const Flakeless = require('ms-flakeless');
const { mix } = require('mixwith');

const is = require('is');
const merge = require('lodash/merge');
const mapValues = require('lodash/mapValues');
const Promise = require('bluebird');
const { uuidFromString, datatypes } = require('express-cassandra');

const flakeless = new Flakeless({
  epochStart: Date.now(),
  outputType: 'base10',
});

class MessageService
{
  static castOptions = {
    id: 'Long',
    roomId: 'Uuid',
  };

  static defaultData = {
    attachments: {},
    createdAt: () => new Date().toISOString(),
    id: () => datatypes.Long.fromString(flakeless.next()),
    properties: {},
  };

  static modelName = 'message';

  getById(id, roomId) {
    const query = this.makeCond({ id, roomId });

    return this.model
      .findOneAsync(query)
      .tap((message) => {
        if (!message) {
          throw new Errors.NotFoundError(`Message #${id} not found`);
        }
      });
  }

  history(roomId, before, limit = 20) {
    const query = { roomId };

    if (before) {
      query.id = { $lt: before };
    }

    return this.find(query, { $desc: 'id' }, limit);
  }

  afterDelete(cond) {
    const { pin } = this.services;
    const { id, roomId } = cond

    return pin
      .find({ messageId: id, roomId: roomId })
      .each(pin => pin.deleteAsync());
  }
}

module.exports = mix(MessageService).with(CassandraMixin);
