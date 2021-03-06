class LightUserModel {
  static ROLE_ADMIN = 'admin';

  static ROLE_GUEST = 'guest';

  static ROLE_DJ = 'dj';

  static ROLE_ROOT = 'root';

  constructor(id, name, roles = [], roomId, avatar) {
    this.id = id;
    this.name = name;
    this.roles = roles;
    this.avatar = avatar;

    // non-enumerable
    Object.defineProperty(this, 'roomId', {
      enumerable: false,
      value: roomId || null,
    });
  }

  get isGuest() {
    return this.roles.includes(LightUserModel.ROLE_GUEST);
  }

  get isRoot() {
    return this.roles.includes(LightUserModel.ROLE_ROOT);
  }

  get isAdmin() {
    return this.roles.includes(LightUserModel.ROLE_ADMIN);
  }

  get isDJ() {
    return this.roles.includes(LightUserModel.ROLE_DJ);
  }

  get isElevated() {
    return this.isDJ || this.isAdmin || this.isRoot;
  }
}

module.exports = LightUserModel;
