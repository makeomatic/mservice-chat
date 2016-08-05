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
