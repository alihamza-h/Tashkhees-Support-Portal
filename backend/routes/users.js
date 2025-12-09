import express from 'express';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all developers (for assignment dropdown)
// @route   GET /api/users/developers
// @access  Private (Admin only)
router.get('/developers', protect, authorize('ADMIN'), async (req, res) => {
    try {
        const developers = await User.find({ role: 'DEVELOPER' })
            .select('name email _id')
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            data: { developers }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Get all users (for admin user management)
// @route   GET /api/users
// @access  Private (Admin only)
router.get('/', protect, authorize('ADMIN'), async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .sort({ role: 1, name: 1 });

        const stats = {
            total: users.length,
            admins: users.filter(u => u.role === 'ADMIN').length,
            developers: users.filter(u => u.role === 'DEVELOPER').length,
            users: users.filter(u => u.role === 'USER').length
        };

        res.status(200).json({
            success: true,
            data: { users, stats }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @desc    Get developer workload (tickets assigned to each developer)
// @route   GET /api/users/workload
// @access  Private (Admin only)
router.get('/workload', protect, authorize('ADMIN'), async (req, res) => {
    try {
        const Ticket = (await import('../models/Ticket.js')).default;

        const developers = await User.find({ role: 'DEVELOPER' }).select('name email _id');

        const workload = await Promise.all(developers.map(async (dev) => {
            const tickets = await Ticket.countDocuments({ assignedTo: dev._id });
            const inProgress = await Ticket.countDocuments({
                assignedTo: dev._id,
                status: { $in: ['In Progress', 'In Progress QA'] }
            });
            const completed = await Ticket.countDocuments({
                assignedTo: dev._id,
                status: { $in: ['Completed', 'Done'] }
            });

            return {
                developer: {
                    id: dev._id,
                    name: dev.name,
                    email: dev.email
                },
                tickets: {
                    total: tickets,
                    inProgress,
                    completed
                }
            };
        }));

        res.status(200).json({
            success: true,
            data: { workload }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
