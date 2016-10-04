const omit = require('lodash/omit');

function transform(model, type) {
  const response = {
    id: model.id,
    type,
    attributes: omit(model, 'id'),
  };

  return response;
}

module.exports = { transform };
