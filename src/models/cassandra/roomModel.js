/**
 * @todo add validation and defaults
 * if `https://github.com/masumsoft/express-cassandra/issues/66` will be resolved
 */
module.exports = {
  fields: {
    id: {
      type: 'uuid',
    },
    name: {
      type: 'varchar',
    },
    createdAt: {
      type: 'timestamp',
    },
    createdBy: {
      type: 'varchar',
    },
  },
  key: [['id']],
};
