module.exports = {
  amqp: {
    connection: {
      host: 'rabbitmq',
      port: 5672,
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
    ]
  },
  users: {
    admins: [
      {
        username: 'test@test.ru',
        password: 'megalongsuperpasswordfortest',
        firstName: 'Unit',
        lastName: 'Test',
      },
    ]
  }
};
