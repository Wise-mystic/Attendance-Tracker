import mongoose from 'mongoose';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Register a new user

export const registerUser = async (req, res) => {
    try {
        const { name, email, phone, password, role, dayGroup } = req.body;

        // Check if user exists by email
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Check if user exists by phone
        const existingPhone = await User.findOne({ phone });
        if (existingPhone) {
            return res.status(400).json({ message: 'Phone number already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            name,
            email,
            phone,
            password: hashedPassword,
            role,
            dayGroup
        });

        await newUser.save();
        res.status(201).json({ message: 'Registration successful. Please login.' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Registration failed. Please try again.' });
    }
};


// @route POST /api/login
export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        // Validate input format
        if (!email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Check database connection
        if (mongoose.connection.readyState !== 1) {
            console.error('Database connection not ready');
            return res.status(503).json({ message: 'Service unavailable' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Password validation with timing safety
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // JWT_SECRET check
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET not configured');
            return res.status(500).json({ message: 'Server configuration error' });
        }

        const token = jwt.sign(
            { 
                id: user._id,
                role: user.role,
                iss: 'attendance-system',
                aud: 'client-app'
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.json({ 
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


// // Login user       
// export const loginUser = async (req, res, next) => {
    
//     console.log('Login attempt:', req.body); // Log incoming request
//     const { email, password } = req.body;
    
//     try {
//         if (!email || !password) {
//             return res.status(400).json({ message: 'Email and password are required' });
//         }

//         const user = await User.findOne({ email });
//         console.log('User found:', user ? 'Yes' : 'No'); // Log if user was found

//         if (!user) {
//             return res.status(401).json({ message: 'Invalid credentials' });
//         }

//         const isValidPassword = await bcrypt.compare(password, user.password);
//         console.log('Password valid:', isValidPassword); // Log password validation result

//         if (!isValidPassword) {
//             return res.status(401).json({ message: 'Invalid credentials' });
//         }

//         const token = jwt.sign(
//             { id: user._id, role: user.role }, 
//             process.env.JWT_SECRET, 
//             { expiresIn: '1h' }
//         );
        
//         return res.json({ token });
//     } catch (error) {
//         console.error('Login error details:', error); // Detailed error logging
//         return res.status(500).json({ message: error.message || 'Internal server error' });
//     }
// };

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

