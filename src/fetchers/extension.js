const Promise = require('bluebird');

module.exports = [
  {
    point: 'preAllowed',
    handler: function preAllowed(request) {
      if (request.action.fetcher) {
        return request.action
          .fetcher(request, this)
          .return(request);
      }

      if (request.action.fetchers) {
        return Promise
          .bind(this, request.action.fetchers)
          .map(fetcher => fetcher(request, this))
          .return(request);
      }

      if (request.action.syncFetchers) {
        return Promise
          .bind(this, request.action.syncFetchers)
          .each(fetcher => fetcher(request, this))
          .return(request);
      }

      return Promise.resolve(request);
    },
  },
];
