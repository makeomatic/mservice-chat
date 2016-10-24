const forOwn = require('lodash/forOwn');

function cast(model, options) {
  forOwn(options, (value, field) => {
    model[field] = options[field](value, model);
  });

  return model;
}

module.exports = { cast };
