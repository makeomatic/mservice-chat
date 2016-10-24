function isElevated(user, room) {
  return user.isRoot || room.createdBy === user.id || (room.id === user.roomId && user.isElevated);
}

module.exports = isElevated;
