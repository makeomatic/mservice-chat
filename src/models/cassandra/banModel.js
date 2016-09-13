const required = require('./utils/validators/required');

module.exports = {
  fields: {
    roomId: {
      type: 'uuid',
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
    bannedAt: {
      type: 'timestamp',
      rule: required,
    },
    bannedBy: {
      type: 'frozen',
      typeDef: '<"User">',
      rule: required,
    },
    reason: {
      type: 'text',
      rule: required,
    },
  },
  key: [['roomId'], 'userId'],
};
