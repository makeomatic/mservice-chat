function cast(model, options) {
  for (const field of Object.keys(options)) {
    if (model[field] !== undefined) {
      model[field] = options[field].call(model, model[field]);
    }
  }

  return model;
}

module.exports = { cast };
