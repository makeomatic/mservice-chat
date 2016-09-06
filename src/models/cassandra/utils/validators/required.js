const is = require('is');

const rule = {
  validator: value => is.undefined(value) === false,
  required: true,
};

module.exports = rule;
