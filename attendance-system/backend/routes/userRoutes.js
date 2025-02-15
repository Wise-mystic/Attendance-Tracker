import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { checkAuth, isAdmin } from '../middleware/authMiddleware.js';
import { registerUser, loginUser, getAllUsers, getUserById, updateUser, deleteUser, getUserAttendanceSummary } from '../controllers/userController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/users', checkAuth, isAdmin, getAllUsers);
router.get('/users/:userId', checkAuth, isAdmin, getUserById);
router.put('/users/:userId', checkAuth, isAdmin, updateUser);
router.delete('/users/:userId', checkAuth, isAdmin, deleteUser);
router.get('/users/:userId/attendance', checkAuth, getUserAttendanceSummary);

export default router;

