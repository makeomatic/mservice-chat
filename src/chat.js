const Config = require('./services/config');
const hooks = require('./hooks');
const MService = require('mservice');

class Chat extends MService {
  /**
   * @param config
   */
  constructor(config = {}) {
    super(Config.fromDirectory(`${__dirname}/configs`, config));
    hooks(this);
  }
}

module.exports = Chat;
