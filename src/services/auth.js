const is = require('is');
const LightUserModel = require('./../models/lightUserModel');
const Promise = require('bluebird');
const uid2 = require('uid2');

function auth(token, application) {
  if (is.undefined(token) === true) {
    return Promise.resolve(new LightUserModel(null, `Guest${uid2(8)}`));
  }

  const { amqp, config } = application;

  const route = `${config.users.prefix}.${config.users.postfix.verify}`;
  const audience = config.users.audience;
  const timeout = config.users.timeouts.verify;

  return amqp.publishAndWait(route, { token, audience }, { timeout })
    .then(reply => {
      const user = reply.metadata[audience];
      const name = `${user.firstName} ${user.lastName}`;
      const model = new LightUserModel(user.username, name, user.roles);
      return Promise.resolve(model);
    });
}

module.exports = auth;
