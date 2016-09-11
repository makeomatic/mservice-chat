const required = require('./utils/validators/required');

module.exports = {
  fields: {
    id: {
      type: 'uuid',
      rule: required,
    },
    name: {
      type: 'varchar',
      rule: required,
    },
    createdAt: {
      type: 'timestamp',
      rule: required,
    },
    createdBy: {
      type: 'varchar',
      rule: required,
    },
    banned: {
      type: 'set',
      typeDef: '<varchar>',
      rule: required,
    },
  },
  key: [['id']],
};
