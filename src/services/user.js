const LightUserModel = require('../models/lightUserModel');
const { NotFoundError, HttpStatusError } = require('common-errors');
const Promise = require('bluebird');

function makeUser(userData) {
  const name = `${userData.firstName} ${userData.lastName}`;

  return new LightUserModel(
    userData.username,
    name,
    userData.roles,
    userData.stationChatId,
    userData.avatar
  );
}

function CheckNotFoundError(error) {
  return error.status === 404;
}

class UserService {
  static metaFields = [
    'firstName',
    'lastName',
    'roles',
    'stationChatId',
    'username',
    'avatar',
  ];

  constructor(config, amqp) {
    this.amqp = amqp;
    this.config = config;
  }

  login(token) {
    const { audience, prefix, postfix, timeouts } = this.config;

    const route = `${prefix}.${postfix.verify}`;
    const timeout = timeouts.verify;

    return this.amqp
      .publishAndWait(route, { token, audience }, { timeout })
      .then(response => makeUser(response.metadata[audience]));
  }

  getById(username) {
    const { audience, prefix, postfix, timeouts } = this.config;

    const route = `${prefix}.${postfix.getMetadata}`;
    const timeout = timeouts.getMetadata;

    return this.amqp
      .publishAndWait(route, { username, audience }, { timeout })
      .then(response => makeUser(response[audience]))
      .catch(HttpStatusError, CheckNotFoundError, () => {
        throw new NotFoundError(`User #${username} not found`);
      });
  }

  getMetadata(usernames, fields = UserService.metaFields) {
    const { audience, prefix, postfix, cache, timeouts } = this.config;
    const route = `${prefix}.${postfix.getMetadata}`;
    const message = {
      audience,
      fields: {
        [audience]: fields,
      },
    };
    const opts = {
      timeout: timeouts.getMetadata,
      cache: cache.getMetadata,
    };

    return Promise
      .map(usernames, username =>
        this.amqp.publishAndWait(route, Object.assign({ username }, message), opts)
      )
      .reduce((users, user) => {
        const username = user[audience].username;

        users[username] = makeUser(user[audience]);

        return users;
      }, {});
  }
}

module.exports = UserService;
