module.exports = {
  http: {
    server: {
      handler: 'express',
      attachSocketIO: true,
    },
    router: {
      enabled: true,
    },
  },
};
