const Promise = require('bluebird');
const { uuid } = require('express-cassandra');

function create(messageService, messages = ['foo'], params) {
  const defaults = {
    roomId: uuid(),
    userId: params.user ? params.user.id : 'user@foo.com',
    user: {
      id: 'user@foo.com',
      name: 'User User',
      roles: [],
    },
  };

  return Promise
    .resolve(messages)
    .mapSeries(text => messageService.create(Object.assign({ text }, defaults, params)));
}

module.exports = {
  create,
};
