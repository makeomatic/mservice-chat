const cassandra = require('express-cassandra');
const chatConfig = require('./chat');
const path = require('path');

module.exports = {
  cassandra: {
    service: {
      models: path.resolve(__dirname, '../models'),
    },
    client: {
      clientOptions: {
        contactPoints: ['0.0.0.0'],
        protocolOptions: {
          port: 9042,
        },
        keyspace: chatConfig.chat.namespace,
        queryOptions: {
          consistency: cassandra.consistencies.one,
        },
      },
      ormOptions: {
        defaultReplicationStrategy: {
          class: 'SimpleStrategy',
          replication_factor: 1,
        },
        dropTableOnSchemaChange: true,
        createKeyspace: true,
      },
    },
  },
};
