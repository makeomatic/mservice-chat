const _ = require('lodash');
const glob = require('glob');

class Config
{
  /**
   * @param {string} configDirectory
   * @param {object} config
   * @return {object}
   */
  static fromDirectory(configDirectory, config = {}) {
    const defaultConfig = glob.sync('*.js', { cwd: configDirectory })
      .reduce((config, sectionName) => {
        sectionName = sectionName.replace('.js', '');
        config[sectionName] = require(`${configDirectory}/${sectionName}`);

        return config;
      }, {});

    return _.merge({}, defaultConfig, config);
  }
}

module.exports = Config;
