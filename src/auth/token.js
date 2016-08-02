const authService = require('./../services/auth');

function auth({ params }) {
  return authService(params.token, this);
}

module.exports = auth;
