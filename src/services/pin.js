const CassandraMixin = require('./mixins/model/cassandra');
const { mix } = require('mixwith');
const { modelResponse, TYPE_PIN, TYPE_USER } = require('../utils/response');

class PinService
{
  static castOptions = {
    roomId: 'Uuid',
    messageId: 'Long',
  };

  static defaultData = {
    pinnedAt: () => new Date().toISOString(),
  };

  static modelName = 'pin';

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

  pinAndBroadcast(roomId, message, user) {
    const id = roomId.toString();

    return this
      .pin(roomId, message, user)
      .then(pin => modelResponse(pin, TYPE_PIN))
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

        return pin;
      });
  }

  unpinAndBroadcast(roomId, admin) {
    const id = roomId.toString();

    return this
      .unpin(roomId, admin)
      .then(() => modelResponse(admin, TYPE_USER))
      .tap(response => this.socketIO.in(id).emit(`messages.unpin.${id}`, response));
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
