module.exports = {
  users: {
    prefix: 'users',
    postfix: {
      verify: 'verify',
      getMetadata: 'getMetadata',
      updateMetadata: 'updateMetadata',
    },
    timeouts: {
      verify: 2000,
      getMetadata: 2000,
      updateMetadata: 2000,
    },
    cache: {
      getMetadata: 30000,
    },
    audience: '*.localhost',
  },
};
