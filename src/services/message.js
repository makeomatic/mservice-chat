const Errors = require('common-errors');
const { datatypes } = require('express-cassandra');
const { process } = require('ms-profanity');
const Promise = require('bluebird');

class MessageService {
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

    return Promise
      .bind(this, [query, { $desc: 'id' }, limit])
      .spread(this.find)
      .then(this.fetchUsers);
  }

  fetchUsers(messages) {
    if (messages.length === 0) {
      return Promise.resolve(messages);
    }

    const { user: userService } = this.services;
    const usernames = messages
      .reduce((users, message) => {
        users.add(message.userId);

        if (message.editedBy) {
          users.add(message.editedBy.id);
        }

        return users;
      }, new Set());

    return userService
      .getMetadata(Array.from(usernames))
      .then(users =>
        messages
          .map((message) => {
            const user = users[message.userId] || message.user;
            const data = { user };

            if (message.editedBy) {
              data.editedBy = users[message.editedBy.id] || message.editedBy;
            }

            return Object.assign({}, message.toJSON(), data);
          })
      );
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
      .each((pin) => {
        // async action - notify if we are removing currently pinned data
        if (!pin.unpinnedAt) {
          this.hook('broadcast:unpin', roomId.toString());
        }

        return pin.deleteAsync();
      });
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
