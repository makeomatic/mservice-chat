const AdapterFactory = require('ms-socket.io-adapter-amqp');

module.exports = {
  socketIO: {
    options: {
      // @todo adapter: { name: 'rabbitmq', options: { ... }}
      adapter: AdapterFactory.fromOptions({
        connection: {
          host: '0.0.0.0',
          port: 5672,
        },
      }),
    },
    router: {
      enabled: true,
    },
  },
};
