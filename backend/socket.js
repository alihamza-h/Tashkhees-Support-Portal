import { Server } from 'socket.io';
import Notification from './models/Notification.js';
import User from './models/User.js';
import { sendEmail } from './services/emailService.js';

let io = null;

// Initialize Socket.IO
export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log('🔌 User connected:', socket.id);

        // Join user to their personal room based on email
        socket.on('join', (email) => {
            if (email) {
                socket.join(email);
                console.log(`👤 User ${email} joined their room`);
            }
        });

        // Join admin room
        socket.on('joinAdmin', () => {
            socket.join('admin_room');
            console.log(`👑 Admin joined admin room`);
        });

        // Leave room
        socket.on('leave', (email) => {
            if (email) {
                socket.leave(email);
                console.log(`👤 User ${email} left their room`);
            }
        });

        socket.on('disconnect', () => {
            console.log('🔌 User disconnected:', socket.id);
        });
    });

    console.log('🔌 Socket.IO initialized');
    return io;
};

// Get Socket.IO instance
export const getIO = () => {
    if (!io) {
        console.warn('Socket.IO not initialized');
    }
    return io;
};

// Create and send notification
export const createNotification = async ({
    userEmail,
    userId,
    type,
    title,
    message,
    ticketId,
    ticketNumber,
    metadata = {}
}) => {
    try {
        // Create notification in database
        const notification = await Notification.create({
            userEmail,
            userId,
            type,
            title,
            message,
            ticketId,
            ticketNumber,
            metadata
        });

        // Populate ticket details
        await notification.populate('ticketId', 'ticketId subject status');

        // Send real-time notification via Socket.IO
        if (io) {
            io.to(userEmail).emit('notification', {
                notification,
                unreadCount: await Notification.countDocuments({ userEmail, isRead: false })
            });
            console.log(`📣 Real-time notification sent to ${userEmail}`);
        }

        return notification;
    } catch (error) {
        console.error('Error creating notification:', error.message);
        return null;
    }
};

// Notify admin about new tickets or user messages
export const notifyAdmin = async (ticket, eventType) => {
    try {
        // Get all admin users
        const admins = await User.find({ role: 'ADMIN' });

        for (const admin of admins) {
            let title, message;

            if (eventType === 'new_ticket') {
                title = `New Ticket: ${ticket.ticketId}`;
                message = `${ticket.userName} created a new ${ticket.priority} priority ticket: "${ticket.subject}"`;
            } else if (eventType === 'user_reply') {
                title = `Reply on ${ticket.ticketId}`;
                message = `${ticket.userName} replied to ticket "${ticket.subject}"`;
            }

            // Create notification for admin
            await createNotification({
                userEmail: admin.email,
                type: eventType === 'new_ticket' ? 'ticket_created' : 'comment_added',
                title,
                message,
                ticketId: ticket._id,
                ticketNumber: ticket.ticketId
            });
        }

        // Also emit to admin room for real-time updates
        if (io) {
            io.to('admin_room').emit('admin_notification', {
                type: eventType,
                ticket: {
                    _id: ticket._id,
                    ticketId: ticket.ticketId,
                    userName: ticket.userName,
                    subject: ticket.subject,
                    priority: ticket.priority,
                    status: ticket.status
                }
            });
        }
    } catch (error) {
        console.error('Error notifying admin:', error.message);
    }
};

// Notify ticket status change
export const notifyStatusChange = async (ticket, oldStatus, newStatus, changedBy) => {
    try {
        // Create in-app notification for ticket owner
        const notification = await createNotification({
            userEmail: ticket.userEmail,
            type: 'status_change',
            title: `Ticket ${ticket.ticketId} Status Updated`,
            message: `Your ticket status has been changed from "${oldStatus}" to "${newStatus}"`,
            ticketId: ticket._id,
            ticketNumber: ticket.ticketId,
            metadata: { oldStatus, newStatus, changedBy: changedBy?.name }
        });

        // Also notify admin if status changed by developer
        if (changedBy?.role === 'DEVELOPER') {
            await notifyAdmin(ticket, 'status_change');
        }

        // Send email notification
        await sendEmail(ticket.userEmail, 'statusChanged', {
            ticket,
            oldStatus,
            newStatus,
            changedBy: changedBy?.name
        });

        return notification;
    } catch (error) {
        console.error('Error notifying status change:', error.message);
    }
};

// Notify ticket created
export const notifyTicketCreated = async (ticket) => {
    try {
        // Create in-app notification
        const notification = await createNotification({
            userEmail: ticket.userEmail,
            type: 'ticket_created',
            title: `Ticket Created: ${ticket.ticketId}`,
            message: `Your support ticket "${ticket.subject}" has been received`,
            ticketId: ticket._id,
            ticketNumber: ticket.ticketId
        });

        // Send email notification
        await sendEmail(ticket.userEmail, 'ticketCreated', { ticket });

        return notification;
    } catch (error) {
        console.error('Error notifying ticket created:', error.message);
    }
};

// Notify ticket assigned
export const notifyTicketAssigned = async (ticket, assignedTo) => {
    try {
        // Create in-app notification for ticket owner
        await createNotification({
            userEmail: ticket.userEmail,
            type: 'ticket_assigned',
            title: `Ticket ${ticket.ticketId} Assigned`,
            message: `Your ticket has been assigned to ${assignedTo.name}`,
            ticketId: ticket._id,
            ticketNumber: ticket.ticketId,
            metadata: { assignedTo: assignedTo.name }
        });

        // Create notification for the developer who was assigned
        await createNotification({
            userEmail: assignedTo.email,
            type: 'ticket_assigned',
            title: `New Ticket Assigned: ${ticket.ticketId}`,
            message: `You have been assigned to ticket "${ticket.subject}"`,
            ticketId: ticket._id,
            ticketNumber: ticket.ticketId,
            metadata: { priority: ticket.priority }
        });

        // Send email notification to user
        await sendEmail(ticket.userEmail, 'ticketAssigned', {
            ticket,
            assignedTo: assignedTo.name
        });

        return true;
    } catch (error) {
        console.error('Error notifying ticket assigned:', error.message);
    }
};

export default {
    initializeSocket,
    getIO,
    createNotification,
    notifyStatusChange,
    notifyTicketCreated,
    notifyTicketAssigned,
    notifyAdmin
};
