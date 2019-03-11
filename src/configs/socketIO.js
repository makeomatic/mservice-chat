exports.socketIO = {
  options: {
    transports: ['websocket', 'polling'],
    adapter: {
      name: 'amqp',
      options: {
        name: 'socket-adapter',
        exchange: 'socket-adapter',
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
};
