global.SERVICES = {
  amqp: {
    connection: {
      host: 'rabbitmq',
    },
  },
  cassandra: {
    client: {
      clientOptions: {
        contactPoints: ['cassandra'],
        keyspace: 'testChat',
      },
    },
  },
  chat: {
    namespace: 'testChat',
  },
  plugins: [
    'validator', // keep it first
    'amqp',
    'cassandra',
    'http',
    'socketio',
  ],
};
