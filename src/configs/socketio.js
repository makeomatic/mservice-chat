const AdapterFactory = require('ms-socket.io-adapter-amqp');

module.exports = {
  socketio: {
    server: {
      options: {
        transports: ['polling', 'websocket'],
        adapter: AdapterFactory.fromOptions(),
      },
    },
    service: {},
  },
};
