const Promise = require('bluebird');

function getOwners(roomId) {
  const { amqp, config } = this;
  const { users: { audience, prefix, postfix, timeouts } } = config;
  const route = `${prefix}.${postfix.list}`;
  const timeout = timeouts.list;
  const filter = {
    stationChatId: {
      eq: JSON.stringify(roomId),
    },
    roles: {
      match: 'admin',
    },
  };

  return amqp.publishAndWait(route, { audience, filter }, { timeout });
}

function update(hasChatSticky = false, roomId) {
  const { amqp, config } = this;
  const { users: { audience, prefix, postfix, timeouts } } = config;
  const route = `${prefix}.${postfix.updateMetadata}`;
  const timeout = timeouts.updateMetadata;
  const metadata = {
    $set: {
      hasChatSticky,
    },
  };

  return Promise
    .bind(this, roomId)
    .then(getOwners)
    .get('users')
    .map(user => (
      amqp.publishAndWait(route, { audience, username: user.id, metadata }, { timeout })
    ));
}

update.onStart = function onStart(sticky) {
  return update.call(this, true, sticky);
};

update.onStop = function onStop(sticky) {
  return update.call(this, false, sticky);
};

module.exports = update;
