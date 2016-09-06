const { ActionTransport, routerExtension } = require('mservice');
const auth = require('./../auth/token');
const path = require('path');
const Promise = require('bluebird');

const { amqp, http, socketIO } = ActionTransport;

module.exports = {
  router: {
    routes: {
      directory: path.resolve(__dirname, './../actions'),
      prefix: 'chat',
      transports: [amqp, http, socketIO],
    },
    extensions: {
      enabled: ['preAllowed', 'postRequest', 'preRequest', 'preResponse'],
      register: [
        routerExtension('audit/log'),
        [
          {
            point: 'preAllowed',
            handler: function preAllowed(request) {
              if (request.action.fetch) {
                return request.action.fetch(request, this);
              }

              return Promise.resolve(request);
            },
          },
        ],
      ],
    },
    auth: {
      strategies: {
        token: auth,
      },
    },
  },
};
