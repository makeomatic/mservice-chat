const { cast } = require('./cast');
const { serialize } = require('./serialize');
const { transform } = require('./transform');

function processModel(model, type, options = {}) {
  const { serializationGroup, serializationGroups, castOptions } = options;
  let response = model;

  response = serialize(response, serializationGroup, serializationGroups);

  if (castOptions) {
    response = cast(response, castOptions);
  }

  response = transform(response, type);

  return response;
}

function transformModel(model, type, options = {}) {
  const response = { data: model };

  if (model === null) {
    return response;
  }

  response.data = processModel(response.data, type, options);

  return response;
}

function transformCollection(collection, type, collectionOptions, options = {}) {
  const { before } = collectionOptions;
  const count = collection.length;
  const cursor = collectionOptions.cursor || 'id';
  const response = {
    meta: {
      count,
    },
    data: collection.map(model => processModel(model, type, options)),
  };

  if (count === 0) {
    return response;
  }

  if (count) {
    response.meta.last = collection[count - 1][cursor];
  }

  if (before) {
    response.meta.before = before;
  }

  return response;
}

module.exports = {
  processModel,
  transformCollection,
  transformModel,
};
