import Parent from "../../models/user/Parent.js";
import BaseRepository from "../BaseRepository.js";

;

class ParentRepository extends BaseRepository {
  constructor() {
    super(Parent);
  }

  async getStudentsForParent(parentId) {
    return this.model.findById(parentId).populate('studentIds');
  }

  async findByEmail(email) {
    return this.model.findOne({ email });
  }
}

export default new ParentRepository();
