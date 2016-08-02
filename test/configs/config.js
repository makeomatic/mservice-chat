const AdapterFactory = require('ms-socket.io-adapter-amqp');
const cassandra = require('express-cassandra');

global.SERVICES = {
  amqp: {
    transport: {
      connection: {
        host: 'rabbitmq',
      },
    },
  },
  cassandra: {
    client: {
      clientOptions: {
        contactPoints: ['cassandra'],
        keyspace: 'testChat',
        queryOptions: {
          consistency: cassandra.consistencies.all,
        },
      },
    },
  },
  socketIO: {
    options: {
      adapter: AdapterFactory.fromOptions({
        connection: {
          host: 'rabbitmq',
          port: 5672,
        }
      }),
    },
  },
};
