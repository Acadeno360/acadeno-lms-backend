
import Student from '../../models/user/student.js';
import BaseRepository from '../BaseRepository.js';


class StudentRepository extends BaseRepository {
  constructor() {
    super(Student);
  }

  async findAllStudents() {
    return this.model.find({ });
  }

  async findByTrainer(trainerId) {
    return this.model.find({ assignedTrainer: trainerId });
  }

  async findByCourse(courseId) {
    return this.model.find({ courseIds: courseId });
  }

  async findWithGuardian(studentId) {
    return this.model.findById(studentId).populate('guardianId');
  }
}

export default new StudentRepository();
