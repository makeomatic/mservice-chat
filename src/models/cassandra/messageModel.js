const required = require('./utils/validators/required');

module.exports = {
  fields: {
    id: {
      type: 'uuid',
      rule: required,
    },
    text: {
      type: 'text',
      rule: required,
    },
    roomId: {
      type: 'uuid',
      rule: required,
    },
    createdAt: {
      type: 'timestamp',
      rule: required,
    },
    userId: {
      type: 'varchar',
      rule: required,
    },
    user: {
      type: 'frozen',
      typeDef: '<"User">',
      rule: required,
    },
    properties: {
      type: 'map',
      typeDef: '<varchar, varchar>',
      rule: required,
    },
    attachments: {
      type: 'map',
      typeDef: '<varchar, varchar>',
      rule: required,
    },
  },
  key: [['roomId'], 'createdAt'],
  clustering_order: { createdAt: 'desc' },
  indexes: ['id'],
};
