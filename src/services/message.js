const Errors = require('common-errors');
const { datatypes } = require('express-cassandra');
const { process } = require('ms-profanity');

class MessageService
{
  static castOptions = {
    id: 'Long',
    roomId: 'Uuid',
  };

  static modelName = 'message';

  defaultData() {
    return {
      createdAt: () => new Date(),
      id: () => datatypes.Long.fromString(this.flakeless.next()),
      sanitizedText: params => process(params.text),
    };
  }

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
    const { pin: pinService } = this.services;
    const { id, roomId } = cond;
    const query = { roomId };

    if (cond.id) {
      query.messageId = id;
    }

    return pinService
      .find(query)
      .each(pin => pin.deleteAsync());
  }

  edit(message, text, user) { // eslint-disable-line class-methods-use-this
    message.text = text;
    message.sanitizedText = process(text);
    message.editedAt = new Date();
    message.editedBy = user;

    return message
      .saveAsync()
      .return(message);
  }
}

module.exports = MessageService;
