const Promise = require('bluebird');

function connect(client) {
  return Promise.fromCallback(callback => client.on('connect', callback));
}

function emit(client, action, params) {
  return Promise.fromCallback(callback => client.emit(action, params, callback));
}

module.exports = {
  connect,
  emit,
};
