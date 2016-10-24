const forIn = require('lodash/forIn');

function cast(model, options) {
  forIn(options, (value, field) => {
    model[field] = options[field](value, model);
  });

  return model;
}

module.exports = { cast };
