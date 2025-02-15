import express from 'express';
import Attendance from '../models/attendance.js';
import User from '../models/User.js';
import { checkAuth, isAdmin } from '../middleware/authMiddleware.js';
import { getAllAttendance, getAttendanceById, createAttendance, updateAttendance, deleteAttendance } from '../controllers/attendanceController.js';
import { markAttendance, getAttendanceByDateRange, getUnmarkedAttendance } from '../controllers/attendanceController.js';

const router = express.Router();



// Mark attendance (for leaders and admin)
router.post('/mark', checkAuth, markAttendance);

// Get attendance by date range
router.get('/range', checkAuth, getAttendanceByDateRange);

// Get unmarked attendance for today
router.get('/unmarked', checkAuth, getUnmarkedAttendance);

// Get all attendance records
router.get('/', checkAuth, isAdmin, getAllAttendance);

// Get a single attendance record by ID
router.get('/:id', checkAuth, isAdmin, getAttendanceById);

// Create a new attendance record
router.post('/', checkAuth, isAdmin, createAttendance);

// Update an attendance record
router.put('/:id', checkAuth, isAdmin, updateAttendance);

// Delete an attendance record
router.delete('/:id', checkAuth, isAdmin, deleteAttendance);

// Get attendance summary for a user
router.get('/:userId/summary', checkAuth, getUserAttendanceSummary);

// Get attendance records for a user
router.get('/:userId', checkAuth, getUserAttendanceRecords);

// Get attendance summary for all users
router.get('/summary', checkAuth, isAdmin, getAllAttendanceSummary);

// Get attendance records for all users
router.get('/', checkAuth, isAdmin, getAllAttendanceRecords);

// Get attendance summary for a user
router.get('/:userId/summary', checkAuth, getUserAttendanceSummary);

// Get attendance records for a user
router.get('/:userId', checkAuth, getUserAttendanceRecords);

// Get attendance summary for all users
router.get('/summary', checkAuth, isAdmin, getAllAttendanceSummary);

// Get attendance records for all users
router.get('/', checkAuth, isAdmin, getAllAttendanceRecords);   

// Mark attendance for a user
router.post('/:userId/mark', checkAuth, markAttendance);


router.get('/analytics/admin', checkAuth, isAdmin, getAdminAnalytics);
router.get('/analytics/leader', checkAuth, getLeaderAnalytics);

export default router;

