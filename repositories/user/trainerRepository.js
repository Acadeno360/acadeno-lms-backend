import Trainer from "../../models/user/Trainer.js";
import BaseRepository from "../BaseRepository.js";


class TrainerRepository extends BaseRepository {
  constructor() {
    super(Trainer);
  }

  async findAllTrainers() {
    return this.model.find({});
  }

  async getAvailableTrainers() {
    return this.model.find({ isActive: true });
  }

  async getTrainerCourses(trainerId) {
    return this.model.findById(trainerId).select('courseIds');
  }
}

export default new TrainerRepository();
