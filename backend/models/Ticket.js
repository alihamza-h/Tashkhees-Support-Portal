import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
    ticketId: {
        type: String,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // Null for tickets created without login
    },
    userName: {
        type: String,
        required: [true, 'Please provide your name'],
        trim: true
    },
    userEmail: {
        type: String,
        required: [true, 'Please provide your email'],
        lowercase: true,
        trim: true
    },
    product: {
        type: String,
        required: [true, 'Please select a product'],
        enum: ['RxScan', 'Medscribe', 'Legalyze', 'DICOM Viewer', 'Breast Cancer Detection', 'Other']
    },
    subject: {
        type: String,
        required: [true, 'Please provide a subject'],
        trim: true,
        maxlength: [200, 'Subject cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Please provide a description'],
        trim: true,
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    status: {
        type: String,
        enum: ['TO DO', 'In Progress', 'In Progress QA', 'Completed', 'Done'],
        default: 'TO DO'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    attachmentPath: {
        type: String,
        default: null
    },
    statusHistory: [{
        status: String,
        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        changedAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Auto-generate ticket ID before saving
ticketSchema.pre('save', async function (next) {
    if (this.isNew && !this.ticketId) {
        try {
            const count = await this.constructor.countDocuments();
            this.ticketId = `TSK-${String(count + 1001).padStart(4, '0')}`;

            // Add initial status to history if not already present
            if (this.statusHistory.length === 0) {
                this.statusHistory.push({
                    status: this.status || 'TO DO',
                    changedAt: new Date()
                });
            }
        } catch (error) {
            return next(error);
        }
    }

    // Update updatedAt on every save
    this.updatedAt = Date.now();
    next();
});

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;
