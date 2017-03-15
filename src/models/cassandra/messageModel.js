const required = require('./utils/validators/required');

module.exports = {
  fields: {
    id: {
      type: 'bigint',
      rule: required,
    },
    text: {
      type: 'text',
      rule: required,
    },
    sanitizedText: {
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
    // should be dropped, used for default value if user not found
    user: {
      type: 'frozen',
      typeDef: '<"User">',
      rule: required,
    },
    editedAt: {
      type: 'timestamp',
    },
    // should be replaced with `editedById`
    editedBy: {
      type: 'frozen',
      typeDef: '<"User">',
    },
  },
  key: [['roomId'], 'id'],
  clustering_order: { id: 'desc' },
};
