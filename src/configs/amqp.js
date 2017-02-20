module.exports = {
  amqp: {
    transport: {
      cache: 500,
      connection: {
        host: '0.0.0.0',
        port: 5672,
      },
    },
    router: {
      enabled: true,
    },
  },
};
