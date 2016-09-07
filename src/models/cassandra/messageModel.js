const required = require('./utils/validators/required');

module.exports = {
  fields: {
    id: {
      type: 'varchar',
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
  key: [['roomId'], 'id'],
  clustering_order: { id: 'desc' },
};
