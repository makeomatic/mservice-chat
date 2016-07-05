const AdapterFactory = require('ms-socket.io-adapter-amqp');

global.SERVICES = {
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
  }
};
