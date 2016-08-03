const { ActionTransport } = require('mservice');
const auth = require('./../auth/token');
const path = require('path');
const Promise = require('bluebird');

const { http, socketIO } = ActionTransport;

module.exports = {
  router: {
    routes: {
      directory: path.resolve(__dirname, './../actions'),
      prefix: 'chat',
      transports: [http, socketIO],
    },
    extensions: {
      enabled: ['preSocketIORequest', 'preAllowed'],
      register: [
        [
          {
            point: 'preSocketIORequest',
            handler: (socket, request) => {
              request.socket = socket;
              return Promise.resolve([socket, request]);
            },
          },
        ],
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
