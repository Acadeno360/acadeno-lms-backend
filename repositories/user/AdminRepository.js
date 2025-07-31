import Admin from "../../models/user/Admin";
import BaseRepository from "../BaseRepository";


class AdminRepository extends BaseRepository {
  constructor() {
    super(Admin);
  }

  async getSuperAdmins() {
    return this.model.find({ isSuperAdmin: true });
  }

  async hasPrivilege(adminId, privilege) {
    const admin = await this.model.findById(adminId);
    return admin?.privileges.includes(privilege);
  }
}

export default new AdminRepository();
