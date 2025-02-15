import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Leader', 'Member'], required: true },
  dayGroup: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], required: true },
  managedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  managedMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  autoMarked: { type: Boolean, default: false },
  lastModified: { type: Date, default: Date.now },
  auditTrail: [{
    status: { type: String, enum: ['Present', 'Absent'] },
    modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    modifiedAt: { type: Date, default: Date.now },
    reason: String
  }],
  notifications: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    reminderTime: {type: String, enum: ['5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'], default: '6:30 PM'},
    lastReminder: Date
  }

  
});

const User = mongoose.model('User', userSchema);
export default User;
