import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['Present', 'Absent'], required: true },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  autoMarked: { type: Boolean, default: false },
  lastModified: { type: Date, default: Date.now },
  auditTrail: [{
    status: { type: String, enum: ['Present', 'Absent'] },
    modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    modifiedAt: { type: Date, default: Date.now },
    reason: String
  }]
}, { timestamps: true });

// Add index for efficient querying
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
