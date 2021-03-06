module.exports = {
  http: {
    server: {
      handler: 'hapi',
      attachSocketIO: true,
      port: 3000,
      handlerConfig: {
        server: {
          routes: {
            cors: {
              additionalHeaders: ['accept-language', 'x-xsrf-token'],
              origin: ['*'],
              credentials: false,
            },
          },
        },
      },
    },
    router: {
      enabled: true,
      prefix: 'api',
    },
  },
};
