const Promise = require('bluebird');
const { uuid } = require('express-cassandra');

function create(messageService, messages = ['foo'], params) {
  const defaults = {
    roomId: uuid(),
    userId: 'foo@bar.ru',
    user: {
      id: 'test@test.ru',
      name: 'Root Admin',
      roles: ['root'],
    },
  };

  return Promise
    .resolve(messages)
    .mapSeries(text => messageService.create(Object.assign({ text }, defaults, params)));
}

module.exports = {
  create,
};
