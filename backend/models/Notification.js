import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    userEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['ticket_created', 'status_change', 'ticket_assigned', 'comment_added', 'ticket_resolved'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket',
        required: true
    },
    ticketNumber: {
        type: String
    },
    isRead: {
        type: Boolean,
        default: false
    },
    metadata: {
        oldStatus: String,
        newStatus: String,
        assignedBy: String,
        assignedTo: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
notificationSchema.index({ userEmail: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
