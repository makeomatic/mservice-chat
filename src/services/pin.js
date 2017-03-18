const { modelResponse: pinResponse } = require('../responses/pin');
const { modelResponse: userResponse } = require('../responses/user');
const Promise = require('bluebird');

function collectMessagesIds(pin) {
  return pin.messageId;
}

function indexCollectionReducer(indexedCollection, current) {
  indexedCollection[current.id.toString()] = current;

  return indexedCollection;
}

function indexCollection(collection) {
  return collection.reduce(indexCollectionReducer, {});
}

class PinService {
  static castOptions = {
    roomId: 'Uuid',
    messageId: 'Long',
  };

  static defaultData = {
    pinnedAt: () => new Date(),
  };

  static modelName = 'pin';

  pin(roomId, message, user) {
    const params = {
      roomId,
      messageId: message.id,
      pinnedBy: user,
      unpinnedAt: null,
      unpinnedBy: null,
    };

    return this
      .unpin(roomId, user)
      .then(() => this.create(params))
      // express-cassandra doesn't set up virtual fields in constructor
      .tap(pin => (pin.message = message));
  }

  pinAndBroadcast(roomId, message, user) {
    const id = roomId.toString();

    return this
      .pin(roomId, message, user)
      .tap(() => this.hook.call(this, 'broadcast:pin', id))
      .then(pinResponse)
      .tap(response => this.socketIO.in(id).emit(`messages.pin.${id}`, response));
  }

  unpin(roomId, unpinnedBy) {
    return this
      .last(roomId)
      .then((pin) => {
        if (pin !== null) {
          pin.unpinnedAt = Date.now();
          pin.unpinnedBy = unpinnedBy;

          return pin.saveAsync();
        }

        return null;
      });
  }

  unpinAndBroadcast(roomId, admin) {
    const id = roomId.toString();

    return this
      .unpin(roomId, admin)
      .tap(() => this.hook.call(this, 'broadcast:unpin', id))
      .then(() => userResponse(admin))
      .tap(response => this.socketIO.in(id).emit(`messages.unpin.${id}`, response));
  }

  last(roomId) {
    const options = { materialized_view: 'pinsSortedByPinnedAt' };

    return this
      .findOne({ roomId }, { $desc: 'pinnedAt' }, options)
      .then((pin) => {
        if (pin === undefined || pin.unpinnedAt) {
          return null;
        }

        return this.fetchMessage(pin);
      });
  }

  history(roomId, before, limit = 20) {
    const query = { roomId };
    const options = { materialized_view: 'pinsSortedByPinnedAt' };

    if (before) {
      query.pinnedAt = { $lt: before };
    }

    return this
      .find(query, { $desc: 'pinnedAt' }, limit, options)
      .then(collection => this.fetchMessages(roomId, collection));
  }

  fetchMessages(roomId, collection) {
    if (collection.length === 0) {
      return collection;
    }

    const { message: messageService } = this.services;

    return Promise
      .bind(this, collection)
      .map(collectMessagesIds)
      .then(messagesIds => messageService.find({ roomId, id: { $in: messagesIds } }))
      .then(indexCollection)
      .then((messages) => {
        collection.forEach((pin) => {
          pin.message = messages[pin.messageId.toString()];
        });

        return collection;
      });
  }

  fetchMessage(pin) {
    const { message: messageService } = this.services;

    return messageService
      .findOne({ roomId: pin.roomId, id: pin.messageId })
      .then((message) => {
        pin.message = message;

        return pin;
      });
  }
}

module.exports = PinService;
