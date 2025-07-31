import Hr from "../../models/user/Hr";
import BaseRepository from "./BaseRepository";


class HRRepository extends BaseRepository {
  constructor() {
    super(Hr);
  }

  async getAllHRs() {
    return this.model.find({ department: 'Placement' });
  }

  async searchByNote(keyword) {
    return this.model.find({ notes: { $regex: keyword, $options: 'i' } });
  }
}

export default new HRRepository();
