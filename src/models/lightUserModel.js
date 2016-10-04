class LightUserModel
{
  static ROLE_ADMIN = 'admin';
  static ROLE_GUEST = 'guest';
  static ROLE_ROOT = 'root';

  constructor(id, name, roles = []) {
    this.id = id;
    this.name = name;
    this.roles = roles;
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

  get isElevated() {
    return this.isAdmin || this.isRoot;
  }
}

module.exports = LightUserModel;
