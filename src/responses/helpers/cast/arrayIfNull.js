function arrayIfNull(value) {
  if (value === null) {
    return [];
  }

  return value;
}

module.exports = arrayIfNull;
