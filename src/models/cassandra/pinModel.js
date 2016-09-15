const required = require('./utils/validators/required');

module.exports = {
  fields: {
    messageId: {
      type: 'bigint',
      rule: required,
    },
    message: {
      type: 'frozen',
      typeDef: '<"Message">',
      rule: required,
    },
    roomId: {
      type: 'uuid',
      rule: required,
    },
    pinnedAt: {
      type: 'timestamp',
      rule: required,
    },
    unpinnedAt: {
      type: 'timestamp',
    },
    pinnedBy: {
      type: 'frozen',
      typeDef: '<"User">',
      rule: required,
    },
    unpinnedBy: {
      type: 'frozen',
      typeDef: '<"User">',
    },
  },
  key: [['roomId'], 'pinnedAt'],
  clustering_order: { pinnedAt: 'desc' },
  indexes: ['messageId'],
};
