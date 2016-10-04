const Errors = require('common-errors');
const omit = require('lodash/omit');

function serialize(model, group, groups) {
  const jsonModel = model.toJSON ? model.toJSON() : model;

  if (group) {
    const rules = groups[group];

    if (rules === undefined) {
      throw new Errors.ArgumentError('group');
    }

    if (rules.exclude) {
      return omit(jsonModel, rules.exclude);
    }
  }
  
  return jsonModel;
}

module.exports = { serialize };
