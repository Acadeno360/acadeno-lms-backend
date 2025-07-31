export default class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    return await this.model.create(data);
  }

  async findById(id) {
    return await this.model.findById(id);
  }

  async findAll(filter = {}, projection = {}) {
    return await this.model.find(filter, projection);
  }

  async findOne(filter = {}, projection = {}) {
    return await this.model.findOne(filter, projection);
  }

  async update(id, updateData) {
    return await this.model.findByIdAndUpdate(id, updateData, { new: true });
  }

  async delete(id) {
    return await this.model.findByIdAndDelete(id);
  }
}
