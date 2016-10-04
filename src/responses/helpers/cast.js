function cast(model, options) {
  for (const field of Object.keys(options)) {
    model[field] = options[field](model[field], model);
  }

  return model;
}

module.exports = { cast };
