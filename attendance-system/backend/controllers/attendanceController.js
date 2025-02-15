import Attendance from '../models/attendance.js';
import User from '../models/User.js';
import NotificationService from '../services/notificationService.js';


// Mark attendance for a user or group of users
export const markAttendance = async (req, res, next) => {
    try {
        const marker = req.user;
        const { attendanceData } = req.body; // Array of { userId, status }
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Validate day group permission
        const currentDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()];

        if (marker.role === 'Leader' && marker.dayGroup !== currentDay) {
            return res.status(403).json({
                message: 'Leaders can only mark attendance on their designated day'
            });
        }

        // Validate and process each attendance record
        const attendanceRecords = await Promise.all(attendanceData.map(async (record) => {
            const member = await User.findById(record.userId);

            // Validate member exists and belongs to marker's group
            if (!member) {
                throw new Error(`User ${record.userId} not found`);
            }

            if (marker.role === 'Leader' && member.dayGroup !== marker.dayGroup) {
                throw new Error(`Not authorized to mark attendance for ${member.name}`);
            }

            // Check if attendance already marked for today
            const existingAttendance = await Attendance.findOne({
                userId: record.userId,
                date: {
                    $gte: today,
                    $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                }
            });

            if (existingAttendance) {
                // Update existing attendance with audit trail
                existingAttendance.status = record.status;
                existingAttendance.markedBy = marker._id;
                existingAttendance.lastModified = new Date();
                existingAttendance.auditTrail.push({
                    status: record.status,
                    modifiedBy: marker._id,
                    reason: record.reason || 'Regular attendance update'
                });
                return existingAttendance.save();
            }

            // Create new attendance record
            const attendance = new Attendance({
                userId: record.userId,
                date: today,
                status: record.status,
                markedBy: marker._id,
                auditTrail: [{
                    status: record.status,
                    modifiedBy: marker._id,
                    reason: 'Initial attendance marking'
                }]
            });

            await attendance.save();

            // Send notification to the user
            const message = `Your attendance has been marked as ${record.status} by ${marker.name}.`;
            await NotificationService.sendEmailNotification(record.userId, 'Attendance Update', message);
            await NotificationService.sendSmsNotification(record.userId, message);

            return attendance;
        }));

        res.status(200).json({
            message: 'Attendance marked successfully',
            records: attendanceRecords
        });

    } catch (error) {
        next(error);
    }
};

// Get attendance by ID
export const getAttendanceById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const attendance = await Attendance.findById(id)
            .populate('userId', 'name email dayGroup')
            .populate('markedBy', 'name role');
        res.json(attendance);
    } catch (error) {
        next(error);
        res.status(400).json({ message: 'Error fetching attendance by ID' });
    }
};

// Get attendance for a specific date range
export const getAttendanceByDateRange = async (req, res, next) => {
    try {
        const { startDate, endDate, groupDay } = req.query;
        const query = {};

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (groupDay && req.user.role === 'Leader') {
            const groupMembers = await User.find({ dayGroup: groupDay }).select('_id');
            query.userId = { $in: groupMembers.map(m => m._id) };
        }

        const attendance = await Attendance.find(query)
            .populate('userId', 'name email dayGroup')
            .populate('markedBy', 'name role')
            .sort({ date: -1 });

        res.json(attendance);
    } catch (error) {
        next(error);
    }
};

// Get today's unmarked attendance for a group
export const getUnmarkedAttendance = async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const currentDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()];

        // Get all members of the day group
        const groupMembers = await User.find({
            dayGroup: currentDay,
            role: 'Member'
        });

        // Get already marked attendance
        const markedAttendance = await Attendance.find({
            userId: { $in: groupMembers.map(m => m._id) },
            date: {
                $gte: today,
                $lt: tomorrow
            }
        });

        // Filter out unmarked members
        const unmarkedMembers = groupMembers.filter(member =>
            !markedAttendance.some(a => a.userId.equals(member._id))
        );

        res.json({
            day: currentDay,
            unmarkedCount: unmarkedMembers.length,
            unmarkedMembers
        });

    } catch (error) {
        next(error);
    }
};

// Get all attendance summary   
export const getAllAttendanceSummary = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const query = {};

        if (startDate && endDate) {
            query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const summary = await Attendance.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    present: {

                    }
                }
            }
        ])

    } catch (error) {
        next(error);
        res.status(400).json({ message: 'Error fetching attendance summary' });
    }
};

// Get user Attendance Records
export const getUserAttendanceRecords = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { startDate, endDate } = req.query;
        const query = { userId };

        if (startDate && endDate) {
            query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const records = await Attendance.find(query)
            .populate('markedBy', 'name role')
            .sort({ date: -1 });

        res.json(records);
    } catch (error) {
        next(error);
        res.status(400).json({ message: 'Error fetching user attendance records' });
    }
};

// Get user attendance summary
export const getUserAttendanceSummary = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { startDate, endDate } = req.query;
        const query = { userId };

        if (startDate && endDate) {
            query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }
    } catch (error) {
        next(error);
        res.status(400).json({ message: 'Error fetching user attendance summary' });
    }
};


// Get all attendance records
export const getAllAttendance = async (req, res, next) => {
    try {
        const attendance = await Attendance.find()
            .populate('userId', 'name email')
            .populate('markedBy', 'name email');
        res.json(attendance);
    } catch (error) {
        next(error);
        res.status(500).json({ message: 'Error fetching attendance records' });
    }
};

// // // Mark attendance for a user
// // export const markAttendance = async (req, res, next) => {
// //     try {
// //         const { userId, status } = req.body;
// //         const markedBy = req.user.id;

// //         const attendance = new Attendance({
// //             userId,
// //             status,
// //             markedBy
// //         });

// //         await attendance.save();
// //         res.status(201).json({ message: 'Attendance marked successfully', attendance });
// //     } catch (error) {
// //         next(error);
// //         res.status(400).json({ message: 'Error marking attendance' });
// //     }
// // };

// // Get attendance records for a specific user
// export const getUserAttendance = async (req, res, next) => {
//     try {
//         const { userId } = req.params;
//         const attendance = await Attendance.find({ userId })
//             .populate('userId', 'name email')
//             .populate('markedBy', 'name email');
//         res.json(attendance);
//     } catch (error) {
//         next(error);
//         res.status(400).json({ message: 'Error fetching user attendance' });
//     }
// };  

// Get attendance statistics
export const getAttendanceStatistics = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const query = {};

        if (startDate && endDate) {
            query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const statistics = await Attendance.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    status: '$_id',
                    count: 1
                }
            }
        ]);

        res.json(statistics);
    } catch (error) {
        next(error);
        res.status(400).json({ message: 'Error fetching attendance statistics' });
    }
};

// Get attendance summary for a specific user   
export const getAttendanceSummary = async (req, res, next) => {
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
        ])
        res.json(summary);
    } catch (error) {
        next(error);
        res.status(400).json({ message: 'Error fetching attendance summary' });
    }
};

export const createAttendance = (req, res, next) => {

}

// // Update attendance status
// // export const updateAttendanceStatus = async (req, res, next) => {
// //     try {
// //         const { attendanceId, status } = req.body;
// //         const updatedAttendance = await Attendance.findByIdAndUpdate(
// //             attendanceId,
// //             { status },
// //             { new: true }
// //         );
// //         res.json({ message: 'Attendance status updated successfully', attendance: updatedAttendance });
// //     } catch (error) {
// //         next(error);
// //         res.status(400).json({ message: 'Error updating attendance status' });
// //     }
// // };

export const autoMarkAttendance = async (req, res, next) => {
    try {
        const today = new Date();
        const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        if (dayOfWeek !== 'Sunday' && dayOfWeek !== 'Saturday') {
            const usersInGroup = await User.find({ dayGroup: dayOfWeek });
            const attendanceMarked = await Attendance.find({
                userId: { $in: usersInGroup },
                date: { $gte: startOfMonth, $lte: endOfMonth }
            });

            const usersWithNoAttendance = usersInGroup.filter(user => !attendanceMarked.some(attendance => attendance.userId.equals(user._id)));

            for (const user of usersWithNoAttendance) {
                await Attendance.create({ userId: user._id, date: today, status: 'Absent' });
            }
        }
    } catch (error) {
        next(error);
        res.status(400).json({ message: 'Error auto-marking attendance' });
    }
};



// // mark attendance for a user
//     export const markAttendance = async (req, res, next) => {
//     try {
//       const { userId, status } = req.body;
//       const markedBy = req.user.id;

//       // Get the user and the marker
//       const [userToMark, marker] = await Promise.all([
//         User.findById(userId),
//         User.findById(markedBy)
//       ]);

//       // Validate day group matching
//       const today = new Date();
//       const currentDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()];

//       if (marker.role === 'Leader' && 
//           (marker.dayGroup !== currentDay || marker.dayGroup !== userToMark.dayGroup)) {
//         return res.status(403).json({ 
//           message: 'Leaders can only mark attendance for their group on the designated day' 
//         });
//       }

//       const attendance = new Attendance({
//         userId,
//         status,
//         markedBy,
//         date: new Date()
//       });

//       await attendance.save();
//       res.status(201).json({ message: 'Attendance marked successfully', attendance });
//     } catch (error) {
//       next(error);
//     }
//   };


// Get detailed analytics for admin dashboard
export const getAdminAnalytics = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const query = {};

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Overall attendance rate
        const overallStats = await Attendance.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    present: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "Present"] }, 1, 0]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    attendanceRate: {
                        $multiply: [
                            { $divide: ["$present", "$total"] },
                            100
                        ]
                    }
                }
            }
        ]);

        // Group comparison
        const groupComparison = await Attendance.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $group: {
                    _id: '$user.dayGroup',
                    totalAttendance: { $sum: 1 },
                    presentCount: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "Present"] }, 1, 0]
                        }
                    }
                }
            },
            {
                $project: {
                    dayGroup: '$_id',
                    attendanceRate: {
                        $multiply: [
                            { $divide: ["$presentCount", "$totalAttendance"] },
                            100
                        ]
                    }
                }
            }
        ]);

        // Frequent absentees (3+ absences)
        const frequentAbsentees = await Attendance.aggregate([
            { $match: { ...query, status: 'Absent' } },
            {
                $group: {
                    _id: '$userId',
                    absenceCount: { $sum: 1 }
                }
            },
            { $match: { absenceCount: { $gte: 3 } } },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            { $unwind: '$userDetails' },
            {
                $project: {
                    _id: 0,
                    name: '$userDetails.name',
                    email: '$userDetails.email',
                    dayGroup: '$userDetails.dayGroup',
                    absenceCount: 1
                }
            }
        ]);

        res.json({
            overallStats: overallStats[0],
            groupComparison,
            frequentAbsentees
        });

    } catch (error) {
        next(error);
    }
};

// Get leader-specific analytics
export const getLeaderAnalytics = async (req, res, next) => {
    try {
        const leaderId = req.user.id;
        const { startDate, endDate } = req.query;

        // Get leader's group
        const leader = await User.findById(leaderId);

        // Find all members in the leader's group
        const groupMembers = await User.find({
            dayGroup: leader.dayGroup,
            role: 'Member'
        });

        const memberIds = groupMembers.map(member => member._id);

        const query = {
            userId: { $in: memberIds }
        };

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Weekly trends
        const weeklyTrends = await Attendance.aggregate([
            { $match: query },
            {
                $group: {
                    _id: {
                        week: { $week: "$date" },
                        year: { $year: "$date" }
                    },
                    present: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "Present"] }, 1, 0]
                        }
                    },
                    total: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    week: "$_id.week",
                    year: "$_id.year",
                    attendanceRate: {
                        $multiply: [
                            { $divide: ["$present", "$total"] },
                            100
                        ]
                    }
                }
            },
            { $sort: { year: 1, week: 1 } }
        ]);

        // Member-specific attendance
        const memberAttendance = await Promise.all(
            groupMembers.map(async (member) => {
                const stats = await Attendance.aggregate([
                    {
                        $match: {
                            ...query,
                            userId: member._id
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            present: {
                                $sum: {
                                    $cond: [{ $eq: ["$status", "Present"] }, 1, 0]
                                }
                            },
                            total: { $sum: 1 }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            name: member.name,
                            email: member.email,
                            attendanceRate: {
                                $multiply: [
                                    { $divide: ["$present", "$total"] },
                                    100
                                ]
                            }
                        }
                    }
                ]);

                return stats[0];
            })
        );

        res.json({
            weeklyTrends,
            memberAttendance
        });

    } catch (error) {
        next(error);
    }
};

// Auto-mark absences if no attendance is submitted by midnight
export const autoMarkAbsences = async () => {
    const today = new Date();
    const currentDay = today.toLocaleString('en-us', { weekday: 'long' });

    const usersInGroup = await User.find({ dayGroup: currentDay });
    const attendanceMarked = await Attendance.find({
        userId: { $in: usersInGroup.map(user => user._id) },
        date: today
    });

    const usersWithNoAttendance = usersInGroup.filter(user =>
        !attendanceMarked.some(attendance => attendance.userId.equals(user._id))
    );

    for (const user of usersWithNoAttendance) {
        await Attendance.create({
            userId: user._id,
            date: today,
            status: 'Absent',
            markedBy: 'System'
        });
    }
};

// Schedule auto-marking at midnight
setInterval(autoMarkAbsences, 24 * 60 * 60 * 1000);