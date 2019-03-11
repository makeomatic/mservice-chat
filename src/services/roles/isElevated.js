function isElevated(user, room) {
  return user.isRoot
    || room.createdBy === user.id
    || (String(room.id) === user.roomId && user.isElevated);
}

module.exports = isElevated;
