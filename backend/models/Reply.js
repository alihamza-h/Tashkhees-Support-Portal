import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
    ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket',
        required: true
    },
    senderRole: {
        type: String,
        enum: ['USER', 'DEVELOPER'],
        required: true
    },
    senderName: {
        type: String,
        required: true,
        trim: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    message: {
        type: String,
        required: [true, 'Please provide a message'],
        trim: true,
        maxlength: [2000, 'Message cannot exceed 2000 characters']
    },
    attachmentPath: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Reply = mongoose.model('Reply', replySchema);

export default Reply;
