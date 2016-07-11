const AdapterFactory = require('ms-socket.io-adapter-amqp');

module.exports = {
  socketio: {
    server: {
      options: {
        transports: ['polling', 'websocket'],
        adapter: AdapterFactory.fromOptions({
          connection: {
            host: '0.0.0.0',
            port: 5672,
          },
        }),
      },
    },
    service: {},
  },
};
