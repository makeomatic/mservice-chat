const CassandraMixin = require('./mixins/model/cassandra');
const Errors = require('common-errors');
const is = require('is');
const { mix } = require('mixwith');
const Promise = require('bluebird');

class PinService
{
  castOptions = {
    roomId: 'Uuid',
    messageId: 'Long',
  };

  constructor(cassandraClient) {
    if (is.object(cassandraClient.modelInstance) === false) {
      throw new Errors.Argument('cassandraClient');
    }

    if (is.fn(cassandraClient.modelInstance.pin) === false) {
      throw new Errors.Argument('cassandraClient', 'Model \'pin\' not found');
    }

    this.cassandraClient = cassandraClient;
    this.model = Promise.promisifyAll(cassandraClient.modelInstance.pin);
  }

  defaultData() { // eslint-disable-line class-methods-use-this
    return {
      pinnedAt: Date.now(),
    };
  }

  pin(roomId, message, user) {
    const params = {
      message,
      roomId,
      messageId: message.id,
      pinnedBy: user,
    };

    return this
      .unpin(roomId, user)
      .then(() => this.create(params));
  }

  unpin(roomId, user) {
    return this
      .last(roomId)
      .then((pin) => {
        if (pin !== null) {
          pin.unpinnedAt = Date.now();
          pin.unpinnedBy = user;

          return pin.saveAsync();
        }

        return pin;
      });
  }

  last(roomId) {
    return this
      .findOne({ roomId }, { $desc: 'pinnedAt' }, 1)
      .then((pin) => {
        if (pin === undefined || pin.unpinnedAt) {
          return null;
        }

        return pin;
      });
  }
}

module.exports = mix(PinService).with(CassandraMixin);
