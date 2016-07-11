const AdapterFactory = require('ms-socket.io-adapter-amqp');

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
  socketio: {
    server: {
      options: {
        adapter: AdapterFactory.fromOptions({
          connection: {
            host: 'rabbitmq',
          }
        }),
      },
    },
  },
};
