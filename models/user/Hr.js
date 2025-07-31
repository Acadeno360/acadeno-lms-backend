import User from './index.js';

const HRSchema = new mongoose.Schema({
  department: { type: String, default: 'Placement' },
  accessToEvaluation: { type: Boolean, default: true },
  notes: { type: String }
});

export default User.discriminator('hr', HRSchema);
