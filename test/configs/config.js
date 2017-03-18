/* eslint-disable import/no-dynamic-require */
const cwd = process.cwd();

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
          },
        },
      },
    },
  },
  hooks: {
    'broadcast:pin': require(`${cwd}/lib/custom/rfx-station-toggle-sticky`).onStart,
    'broadcast:unpin': require(`${cwd}/lib/custom/rfx-station-toggle-sticky`).onStop,
  },
};
