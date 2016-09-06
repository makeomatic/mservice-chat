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
      },
      ormOptions: {
        createKeyspace: true,
        migration: 'drop',
      },
    },
  },
  socketIO: {
    options: {
      adapter: {
        options: {
          connection: {
            host: 'rabbitmq',
          }
        },
      },
    },
  },
};
