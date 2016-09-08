module.exports = {
  amqp: {
    transport: {
      connection: {
        host: 'rabbitmq',
        port: 5672,
      },
      debug: true,
    },
  },
  redis: {
    hosts: [
      {
        host: 'redis-1',
        port: 6379,
      },
      {
        host: 'redis-2',
        port: 6379,
      },
      {
        host: 'redis-3',
        port: 6379,
      },
    ],
  },
  admins: [
    {
      username: 'test@test.ru',
      password: 'megalongsuperpasswordfortest',
      metadata: {
        firstName: 'Root',
        lastName: 'Admin',
        roles: ['admin', 'root'],
      },
      firstName: 'Admin',
      lastName: 'Admin',
      roles: ['admin', 'root'],
    },
    {
      username: 'foo@bar.ru',
      password: 'bazbazbazbazbazbaz',
      firstName: 'Foo',
      lastName: 'Bar',
    },
  ],
};
