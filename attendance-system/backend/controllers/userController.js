import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Register a new user

export const registerUser = async (req, res, next) => {
    try {
        const { name, email, phone, password, role, dayGroup } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({ name, email, phone, password: hashedPassword, role, dayGroup });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        next(error);
    }
};

// Login user       
export const loginUser = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );
        
        return res.json({ token });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all users
export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        next(error);
        res.status(500).json({ message: 'Error fetching users' });
    }
};

// Get user by ID
export const getUserById = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        next(error);
        res.status(400).json({ message: 'Error fetching user by ID' });
    }
};

// Update user
export const updateUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { name, email, phone, role, dayGroup } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name, email, phone, role, dayGroup },
            { new: true }
        );
        res.json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        next(error);
        res.status(400).json({ message: 'Error updating user' });
    }
};

// Delete user
export const deleteUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        await User.findByIdAndDelete(userId);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        next(error);
        res.status(400).json({ message: 'Error deleting user' });
    }
};

// Get user attendance summary
export const getUserAttendanceSummary = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const summary = await Attendance.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        res.json(summary);
    } catch (error) {
        next(error);
        res.status(400).json({ message: 'Error fetching user attendance summary' });
    }
};

