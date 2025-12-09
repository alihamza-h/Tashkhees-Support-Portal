import express from 'express';
import multer from 'multer';
import path from 'path';
import Reply from '../models/Reply.js';
import Ticket from '../models/Ticket.js';
import { protect } from '../middleware/auth.js';

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
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760
    }
});

// @route   POST /api/replies
// @desc    Add a reply to a ticket
// @access  Private
router.post('/', protect, upload.single('attachment'), async (req, res) => {
    try {
        const { ticketId, message } = req.body;

        // Check if ticket exists
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        const replyData = {
            ticketId,
            senderRole: req.user.role,
            senderName: req.user.name,
            senderId: req.user._id,
            message
        };

        // Add attachment path if file was uploaded
        if (req.file) {
            replyData.attachmentPath = req.file.path;
        }

        const reply = await Reply.create(replyData);

        // Update ticket's updatedAt timestamp
        ticket.updatedAt = Date.now();
        await ticket.save();

        res.status(201).json({
            success: true,
            message: 'Reply added successfully',
            data: { reply }
        });

        // TODO: Send email notification
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/replies/:ticketId
// @desc    Get all replies for a ticket
// @access  Public
router.get('/:ticketId', async (req, res) => {
    try {
        const replies = await Reply.find({ ticketId: req.params.ticketId })
            .sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            count: replies.length,
            data: { replies }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
