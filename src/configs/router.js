const { ActionTransport, routerExtension } = require('@microfleet/core');
const path = require('path');
const auth = require('../auth/token');
const fetcher = require('../fetchers/extension');

const { amqp, http, socketIO } = ActionTransport;

module.exports = {
  router: {
    routes: {
      directory: path.resolve(__dirname, './../actions'),
      prefix: 'chat',
      transports: [amqp, http, socketIO],
    },
    extensions: {
      enabled: ['postValidate', 'postRequest', 'preRequest', 'preResponse'],
      register: [
        routerExtension('audit/log')(),
        fetcher,
      ],
    },
    auth: {
      strategies: {
        token: auth,
      },
    },
  },
};
