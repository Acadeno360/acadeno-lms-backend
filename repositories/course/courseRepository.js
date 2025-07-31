
import Course from "../../models/course/index.js";
import BaseRepository from "../BaseRepository.js";


class CourseRepository extends BaseRepository {
  constructor() {
    super(Course);
  }

  async getActiveCourses() {
    return this.model.find({ isDeleted: false, status: 'active' });
  }

  async findByTitle(title) {
    return this.model.find({ title: { $regex: title, $options: 'i' }, isDeleted: false });
  }

  async softDelete(id) {
    return this.model.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  }

  async updateStatus(id, status) {
    return this.model.findByIdAndUpdate(id, { status }, { new: true });
  }

  async getByLevel(level) {
    return this.model.find({ level, isDeleted: false });
  }
}

export default new CourseRepository();
