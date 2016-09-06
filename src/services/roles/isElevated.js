function isElevated(user, room) {
  return user.isRoot === true || room.createdBy === user.id;
}

module.exports = isElevated;
