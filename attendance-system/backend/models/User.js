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
    reminderTime: {type: String, enum: ['12:30 AM', '1:00 AM', '1:30 AM', '2:00 AM', '2:30 AM', '3:00 AM', '3:30 AM', '4:00 AM', '4:30 AM', '5:00 AM', '5:30 AM', '6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM', '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM', '12:00 AM'], default: '6:30 PM'},
    lastReminder: Date
  }

  
});

const User = mongoose.model('User', userSchema);
export default User;
