import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { checkAuth, isAdmin } from '../middleware/authMiddleware.js';
import { registerUser, loginUser, getAllUsers, getUserById, updateUser, deleteUser, getUserAttendanceSummary } from '../controllers/userController.js';

const router = express.Router();

router.post('/api/register', registerUser);
router.post('/api/login', loginUser);
router.get('/api/users', checkAuth, isAdmin, getAllUsers);
router.get('/api/users/:userId', checkAuth, isAdmin, getUserById);
router.put('/api/users/:userId', checkAuth, isAdmin, updateUser);
router.delete('/api/users/:userId', checkAuth, isAdmin, deleteUser);
router.get('/api/users/:userId/attendance', checkAuth, getUserAttendanceSummary);

export default router;

