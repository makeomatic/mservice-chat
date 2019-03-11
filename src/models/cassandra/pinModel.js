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
      virtual: {
        get: function getMessage() {
          return this.message;
        },
        set: function setMessage(message) {
          this.message = message;
        },
      },
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
  key: [
    ['roomId'], 'messageId',
  ],
  materialized_views: {
    pinsSortedByPinnedAt: {
      select: ['*'],
      key: [
        ['roomId'], 'pinnedAt', 'messageId',
      ],
      clustering_order: {
        pinnedAt: 'desc',
        messageId: 'desc',
      },
    },
  },
};
