const required = require('./utils/validators/required');

module.exports = {
  fields: {
    roomId: {
      type: 'uuid',
      rule: required,
    },
    id: {
      type: 'varchar',
      rule: required,
    },
    name: {
      type: 'varchar',
      rule: required,
    },
    roles: {
      type: 'frozen',
      typeDef: '<set<varchar>>',
      rule: required,
    },
    banned: {
      type: 'boolean',
      rule: required,
    },
    joinedAt: {
      type: 'timeuuid',
      rule: required,
    },
    lastActivityAt: {
      type: 'timestamp',
      rule: required,
    },
  },
  key: [
    ['roomId'], 'id',
  ],
  materialized_views: {
    participantsSortedByJoinedAt: {
      select: ['*'],
      key: [['roomId'], 'joinedAt', 'id'],
      clustering_order: { joinedAt: 'asc' },
    },
  },
};
