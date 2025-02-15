import User from '../models/User.js';

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