const cassandra = require('express-cassandra');
const path = require('path');

module.exports = {
  cassandra: {
    service: {
      models: path.resolve(__dirname, '../models/cassandra'),
    },
    client: {
      clientOptions: {
        contactPoints: ['0.0.0.0'],
        protocolOptions: {
          port: 9042,
        },
        keyspace: 'mservice_chat',
        queryOptions: {
          consistency: cassandra.consistencies.one,
        },
      },
      ormOptions: {
        defaultReplicationStrategy: {
          class: 'SimpleStrategy',
          replication_factor: 1,
        },
        dropTableOnSchemaChange: false,
        createKeyspace: true,
      },
    },
  },
};
