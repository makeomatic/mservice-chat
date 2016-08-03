module.exports = {
  http: {
    server: {
      handler: 'hapi',
      attachSocketIO: true,
      port: 3000,
    },
    router: {
      enabled: true,
      prefix: 'api',
    },
  },
};
