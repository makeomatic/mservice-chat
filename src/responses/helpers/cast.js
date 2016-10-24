function cast(model, options) {
  // eslint-disable-next-line no-restricted-syntax
  for (const field of Object.keys(options)) {
    model[field] = options[field](model[field], model);
  }

  return model;
}

module.exports = { cast };
