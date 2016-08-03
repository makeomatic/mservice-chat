module.exports = {
  socketIO: {
    options: {
      adapter: {
        name: 'amqp',
        options: {
          connection: {
            host: '0.0.0.0',
            port: 5672,
          },
        },
      },
    },
    router: {
      enabled: true,
    },
  },
};
