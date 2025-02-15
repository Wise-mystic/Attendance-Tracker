import User from '../models/User.js';
import jwt from 'jsonwebtoken';

export const checkAuth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
        next(error);
    }
};


export const isAdmin = (req, res, next) => {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

export const isLeader = (req, res, next) => {
    if (req.user.role !== 'Leader') {
        return res.status(403).json({ message: 'Leader access required' });
    }
    next();
};  


export const canManageGroup = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        const targetUser = await User.findById(req.params.userId);

        if (!targetUser) {
            return res.status(404).json({ message: 'Target user not found' });
        }

        if (user.role === 'Admin' ||
            (user.role === 'Leader' && user.dayGroup === targetUser.dayGroup)) {
            next();
        } else {
            res.status(403).json({ message: 'Not authorized to manage this group' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};