import express from 'express';
import multer from 'multer';
import path from 'path';
import Ticket from '../models/Ticket.js';
import Reply from '../models/Reply.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';
import { notifyTicketCreated, notifyStatusChange, notifyTicketAssigned, notifyAdmin } from '../socket.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB default
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|txt/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images, PDFs, and documents are allowed'));
        }
    }
});

// @route   POST /api/tickets
// @desc    Create a new ticket (public - no auth required)
// @access  Public
router.post('/', upload.single('attachment'), async (req, res) => {
    try {
        const { userName, userEmail, product, subject, description, priority, userId } = req.body;

        const ticketData = {
            userName,
            userEmail,
            product,
            subject,
            description,
            priority: priority || 'Medium',
            userId: userId || null
        };

        // Add attachment path if file was uploaded
        if (req.file) {
            ticketData.attachmentPath = req.file.path;
        }

        const ticket = await Ticket.create(ticketData);

        // Send notification (email + real-time) to user
        notifyTicketCreated(ticket);

        // Notify admin about new ticket
        notifyAdmin(ticket, 'new_ticket');

        res.status(201).json({
            success: true,
            message: 'Ticket created successfully',
            data: {
                ticket: {
                    id: ticket._id,
                    ticketId: ticket.ticketId,
                    userName: ticket.userName,
                    userEmail: ticket.userEmail,
                    product: ticket.product,
                    subject: ticket.subject,
                    description: ticket.description,
                    status: ticket.status,
                    priority: ticket.priority,
                    createdAt: ticket.createdAt
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/tickets
// @desc    Get tickets based on user role
// @access  Private (Admin sees all, Developer sees only assigned)
router.get('/', protect, authorize('ADMIN', 'DEVELOPER'), async (req, res) => {
    try {
        const { status, product, priority, search, assignedTo } = req.query;

        // Build query
        let query = {};

        // Role-based filtering
        if (req.user.role === 'DEVELOPER') {
            // Developers can only see their assigned tickets
            query.assignedTo = req.user._id;
        } else if (req.user.role === 'ADMIN' && assignedTo) {
            // Admin can filter by developer
            query.assignedTo = assignedTo;
        }

        if (status) query.status = status;
        if (product) query.product = product;
        if (priority) query.priority = priority;
        if (search) {
            query.$or = [
                { ticketId: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } },
                { userName: { $regex: search, $options: 'i' } }
            ];
        }

        const tickets = await Ticket.find(query)
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });

        // Get stats - for admin, get all stats; for developer, get only their stats
        let baseQuery = {};
        if (req.user.role === 'DEVELOPER') {
            baseQuery = { assignedTo: req.user._id };
        }

        const stats = {
            total: await Ticket.countDocuments(baseQuery),
            toDo: await Ticket.countDocuments({ ...baseQuery, status: 'TO DO' }),
            inProgress: await Ticket.countDocuments({ ...baseQuery, status: 'In Progress' }),
            inProgressQA: await Ticket.countDocuments({ ...baseQuery, status: 'In Progress QA' }),
            completed: await Ticket.countDocuments({ ...baseQuery, status: 'Completed' }),
            done: await Ticket.countDocuments({ ...baseQuery, status: 'Done' }),
            unassigned: req.user.role === 'ADMIN' ? await Ticket.countDocuments({ assignedTo: null }) : 0,
            critical: req.user.role === 'ADMIN' ? await Ticket.countDocuments({ priority: 'Critical' }) : 0,
            high: req.user.role === 'ADMIN' ? await Ticket.countDocuments({ priority: 'High' }) : 0
        };

        res.status(200).json({
            success: true,
            count: tickets.length,
            data: { tickets, stats }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/tickets/all
// @desc    Get ALL tickets (Admin only, no filters applied by default)
// @access  Private (Admin only)
router.get('/all', protect, authorize('ADMIN'), async (req, res) => {
    try {
        const { status, product, priority, search, assignedTo, unassigned } = req.query;

        let query = {};

        if (unassigned === 'true') {
            query.assignedTo = null;
        } else if (assignedTo) {
            query.assignedTo = assignedTo;
        }

        if (status) query.status = status;
        if (product) query.product = product;
        if (priority) query.priority = priority;
        if (search) {
            query.$or = [
                { ticketId: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } },
                { userName: { $regex: search, $options: 'i' } }
            ];
        }

        const tickets = await Ticket.find(query)
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });

        // Get comprehensive stats for admin
        const stats = {
            total: await Ticket.countDocuments(),
            toDo: await Ticket.countDocuments({ status: 'TO DO' }),
            inProgress: await Ticket.countDocuments({ status: 'In Progress' }),
            inProgressQA: await Ticket.countDocuments({ status: 'In Progress QA' }),
            completed: await Ticket.countDocuments({ status: 'Completed' }),
            done: await Ticket.countDocuments({ status: 'Done' }),
            unassigned: await Ticket.countDocuments({ assignedTo: null }),
            critical: await Ticket.countDocuments({ priority: 'Critical' }),
            high: await Ticket.countDocuments({ priority: 'High' }),
            medium: await Ticket.countDocuments({ priority: 'Medium' }),
            low: await Ticket.countDocuments({ priority: 'Low' })
        };

        res.status(200).json({
            success: true,
            count: tickets.length,
            data: { tickets, stats }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/tickets/:id
// @desc    Get single ticket by ID
// @access  Public (anyone can view with ticket ID)
router.get('/:id', async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('assignedTo', 'name email')
            .populate('statusHistory.changedBy', 'name');

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        // Get replies for this ticket
        const replies = await Reply.find({ ticketId: ticket._id })
            .sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            data: {
                ticket,
                replies
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/tickets/:id/status
// @desc    Update ticket status
// @access  Private (Admin or Developer)
router.put('/:id/status', protect, authorize('ADMIN', 'DEVELOPER'), async (req, res) => {
    try {
        const { status } = req.body;

        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        // Developers can only update their assigned tickets
        if (req.user.role === 'DEVELOPER' &&
            ticket.assignedTo?.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only update tickets assigned to you'
            });
        }

        const oldStatus = ticket.status;

        // Update status
        ticket.status = status;

        // Add to status history
        ticket.statusHistory.push({
            status,
            changedBy: req.user._id,
            changedAt: new Date()
        });

        await ticket.save();

        // Send notification (email + real-time)
        notifyStatusChange(ticket, oldStatus, status, req.user);

        res.status(200).json({
            success: true,
            message: 'Ticket status updated successfully',
            data: { ticket }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/tickets/:id/assign
// @desc    Assign ticket to a developer
// @access  Private (Admin only)
router.put('/:id/assign', protect, authorize('ADMIN'), async (req, res) => {
    try {
        const { developerId } = req.body;
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        // Get developer info
        const developer = await User.findById(developerId);
        if (!developer || developer.role !== 'DEVELOPER') {
            return res.status(400).json({
                success: false,
                message: 'Invalid developer ID'
            });
        }

        const wasUnassigned = !ticket.assignedTo;
        const previousAssignee = ticket.assignedTo;

        // Assign to specified developer
        ticket.assignedTo = developerId;

        // If ticket was unassigned and in TO DO, move to In Progress
        if (wasUnassigned && ticket.status === 'TO DO') {
            const oldStatus = ticket.status;
            ticket.status = 'In Progress';
            ticket.statusHistory.push({
                status: 'In Progress',
                changedBy: req.user._id,
                changedAt: new Date()
            });

            // Notify status change
            notifyStatusChange(ticket, oldStatus, 'In Progress', req.user);
        }

        await ticket.save();

        const updatedTicket = await Ticket.findById(ticket._id)
            .populate('assignedTo', 'name email');

        // Send notification to developer
        notifyTicketAssigned(updatedTicket, developer);

        res.status(200).json({
            success: true,
            message: `Ticket assigned to ${developer.name}`,
            data: { ticket: updatedTicket }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/tickets/:id/unassign
// @desc    Unassign ticket from developer
// @access  Private (Admin only)
router.put('/:id/unassign', protect, authorize('ADMIN'), async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        ticket.assignedTo = null;

        // If ticket was in progress, move back to TO DO
        if (ticket.status === 'In Progress') {
            ticket.status = 'TO DO';
            ticket.statusHistory.push({
                status: 'TO DO',
                changedBy: req.user._id,
                changedAt: new Date()
            });
        }

        await ticket.save();

        res.status(200).json({
            success: true,
            message: 'Ticket unassigned successfully',
            data: { ticket }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/tickets/user/:email
// @desc    Get tickets by user email
// @access  Public
router.get('/user/:email', async (req, res) => {
    try {
        const tickets = await Ticket.find({ userEmail: req.params.email })
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: tickets.length,
            data: { tickets }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
