import nodemailer from 'nodemailer';
import twilio from 'twilio';
import User from '../models/User.js';
import Attendance from '../models/attendance.js';

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const NotificationService = {
  async sendEmailNotification(userId, subject, message) {
    try {
      const user = await User.findById(userId);
      if (user.notifications.email) {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: user.email,
          subject,
          text: message
        });
        console.log(`Email sent to ${user.email}`);
      }
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  },

  async sendSmsNotification(userId, message) {
    try {
      const user = await User.findById(userId);
      if (user.notifications.sms) {
        await twilioClient.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: user.phone
        });
        console.log(`SMS sent to ${user.phone}`);
      }
    } catch (error) {
      console.error('Error sending SMS notification:', error);
    }
  },

  async sendAttendanceReminder(user) {
    try {
      const message = `Reminder: Please mark your attendance for today.`;
      if (user.notifications.email) {
        await this.sendEmailNotification(user._id, 'Attendance Reminder', message);
      }
      if (user.notifications.sms) {
        await this.sendSmsNotification(user._id, message);
      }
    } catch (error) {
      console.error('Error sending attendance reminder:', error);
    }
  }
};

export default NotificationService;

export const sendAttendanceReminder = async (user) => {
  try {
    const emailContent = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Attendance Marking Reminder',
      html: `
        <h2>Attendance Marking Reminder</h2>
        <p>Hello ${user.name},</p>
        <p>This is a reminder to mark attendance for your group members for today.</p>
        <p>Please ensure all attendance is marked before midnight.</p>
      `
    };

    await transporter.sendMail(emailContent);
    await User.findByIdAndUpdate(user._id, { 'notifications.lastNotified': new Date() });
  } catch (error) {
    console.error('Error sending reminder:', error);
  }
};

export const sendAbsenceNotification = async (user, date) => {
  try {
    const emailContent = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Absence Recorded',
      html: `
        <h2>Absence Notification</h2>
        <p>Hello ${user.name},</p>
        <p>You have been marked as absent for ${date.toDateString()}.</p>
        <p>If you believe this is an error, please contact your group leader.</p>
      `
    };

    await transporter.sendMail(emailContent);
  } catch (error) {
    console.error('Error sending absence notification:', error);
  }
}; 