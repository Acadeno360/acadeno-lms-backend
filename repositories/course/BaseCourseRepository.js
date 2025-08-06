

export default class BaseCourseRepository {
  constructor(model) {
    this.model = model;
  }

  async createCourse(data) {
    return await this.model.create(data);
  }

  async findCourseById(id) {
    return await this.model.findById(id);
  }

  async findAllCourse(filter = {}, projection = {}) {
    return await this.model.find(filter, projection);
  }

  async findOneCourse(filter = {}, projection = {}) {
    return await this.model.findOne(filter, projection);
  }

  async updateCourse(id, updateData) {
    return await this.model.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteCourseC(id) {
    return await this.model.findByIdAndDelete(id);
  }
}
