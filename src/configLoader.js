const _ = require('lodash');
const Errors = require('common-errors');
const fs = require('fs');
const glob = require('glob');

/**
 *
 */
class Config
{
  /**
   * @param {string} configsDirectory
   * @param {object} config
   * @return {object}
   */
  static fromDirectory(configsDirectory, config = {}) {
    if (!fs.existsSync(configsDirectory)) {
      throw new Errors.ArgumentError('actionsDirectory');
    }

    const defaultConfig = glob.sync('*.js', { cwd: configsDirectory })
      .reduce((config, sectionName) => {
        sectionName = sectionName.replace('.js', '');
        config[sectionName] = require(`${configsDirectory}/${sectionName}`);

        return config;
      }, {});

    return _.merge({}, defaultConfig, config);
  }
}

module.exports = Config;
