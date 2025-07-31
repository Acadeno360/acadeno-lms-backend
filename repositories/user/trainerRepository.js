import Trainer from "../../models/user/Trainer";
import BaseRepository from "../BaseRepository";


class TrainerRepository extends BaseRepository {
  constructor() {
    super(Trainer);
  }

  async getAvailableTrainers() {
    return this.model.find({ isActive: true });
  }

  async getTrainerCourses(trainerId) {
    return this.model.findById(trainerId).select('courseIds');
  }
}

export default new TrainerRepository();
