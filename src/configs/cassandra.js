const cassandra = require('express-cassandra');
const chatConfig = require('./chat');

module.exports = {
  service: {
    models: `${__dirname}/../models`
  },
  client: {
    clientOptions: {
      contactPoints: ['0.0.0.0'],
      protocolOptions: {
        port: 9042
      },
      keyspace: chatConfig.namespace,
      queryOptions: {
        consistency: cassandra.consistencies.one
      }
    },
    ormOptions: {
      defaultReplicationStrategy: {
        class: 'SimpleStrategy',
        replication_factor: 1
      },
      dropTableOnSchemaChange: true,
      createKeyspace: true
    }
  }
};
