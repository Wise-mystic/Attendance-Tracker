// backend/server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import cron from 'node-cron';
import { sendAttendanceReminder, sendAbsenceNotification } from './services/notificationService.js';
import NotificationService from './services/notificationService.js';
import User from './models/User.js';
import Attendance from './models/attendance.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Reminder cron job - runs every hour to check for reminders
cron.schedule('0 * * * *', async () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    try {
        const users = await User.find({
            'notifications.reminderTime': `${currentHour}:${currentMinute < 10 ? '0' : ''}${currentMinute}`,
            'notifications.lastReminder': { $lt: new Date(now.setHours(0, 0, 0, 0)) }
        });

        for (const user of users) {
            await NotificationService.sendAttendanceReminder(user);
            user.notifications.lastReminder = new Date();
            await user.save();
        }
    } catch (error) {
        console.error('Error sending attendance reminders:', error);
    }
});

// Auto-marking cron job - runs at midnight
cron.schedule('0 0 * * *', async () => {
  const today = new Date();
  today.setDate(today.getDate() - 1); // Mark for previous day
  const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()];

  if (dayOfWeek !== 'Sunday' && dayOfWeek !== 'Saturday') {
    const usersInGroup = await User.find({ dayGroup: dayOfWeek });
    const attendanceMarked = await Attendance.find({
      userId: { $in: usersInGroup.map(u => u._id) },
      date: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lt: new Date(today.setHours(23, 59, 59, 999))
      }
    });

    // Mark absent for unmarked users and send notifications
    const unmarkedUsers = usersInGroup.filter(user => 
      !attendanceMarked.some(a => a.userId.equals(user._id))
    );

    for (const user of unmarkedUsers) {
      const attendance = await Attendance.create({
        userId: user._id,
        date: today,
        status: 'Absent',
        markedBy: null,
        autoMarked: true,
        auditTrail: [{
          status: 'Absent',
          modifiedBy: null,
          reason: 'Auto-marked by system'
        }]
      });

      if (user.notifications.email) {
        await sendAbsenceNotification(user, today);
      }
    }
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Define routes
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));