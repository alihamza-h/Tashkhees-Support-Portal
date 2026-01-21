import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();

// In-memory database (temporary solution)
const db = {
    users: [],
    tickets: [],
    replies: [],
    ticketCounter: 1000
};

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Helper functions
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '7d'
    });
};

const generateTicketId = () => {
    db.ticketCounter++;
    return `TSK-${String(db.ticketCounter).padStart(4, '0')}`;
};

// Auth middleware
const protect = (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = db.users.find(u => u.id === decoded.id);
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Not authorized for this role' });
        }
        next();
    };
};

// AUTH ROUTES
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const userExists = db.users.find(u => u.email === email);
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = {
            id: Date.now().toString(),
            name,
            email,
            password: hashedPassword,
            role: role || 'USER',
            createdAt: new Date()
        };

        db.users.push(user);

        const token = generateToken(user.id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: { id: user.id, name: user.name, email: user.email, role: user.role },
                token
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = db.users.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = generateToken(user.id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: { id: user.id, name: user.name, email: user.email, role: user.role },
                token
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// TICKET ROUTES
app.post('/api/tickets', (req, res) => {
    try {
        const { userName, userEmail, product, subject, description, priority } = req.body;

        const ticket = {
            _id: Date.now().toString(),
            ticketId: generateTicketId(),
            userName,
            userEmail,
            product,
            subject,
            description,
            status: 'Open',
            priority: priority || 'Medium',
            assignedTo: null,
            attachmentPath: null,
            statusHistory: [{ status: 'Open', changedAt: new Date() }],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        db.tickets.push(ticket);

        res.status(201).json({
            success: true,
            message: 'Ticket created successfully',
            data: { ticket }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/tickets', protect, authorize('DEVELOPER'), (req, res) => {
    try {
        const { status, product, search } = req.query;
        let tickets = [...db.tickets];

        if (status) tickets = tickets.filter(t => t.status === status);
        if (product) tickets = tickets.filter(t => t.product === product);
        if (search) {
            tickets = tickets.filter(t =>
                t.ticketId.toLowerCase().includes(search.toLowerCase()) ||
                t.subject.toLowerCase().includes(search.toLowerCase()) ||
                t.userName.toLowerCase().includes(search.toLowerCase())
            );
        }

        tickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.status(200).json({
            success: true,
            count: tickets.length,
            data: { tickets }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/tickets/:id', (req, res) => {
    try {
        const ticket = db.tickets.find(t => t._id === req.params.id);
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        const replies = db.replies.filter(r => r.ticketId === ticket._id);

        res.status(200).json({
            success: true,
            data: { ticket, replies }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.put('/api/tickets/:id/status', protect, authorize('DEVELOPER'), (req, res) => {
    try {
        const { status } = req.body;
        const ticket = db.tickets.find(t => t._id === req.params.id);

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        ticket.status = status;
        ticket.statusHistory.push({
            status,
            changedBy: req.user.id,
            changedAt: new Date()
        });
        ticket.updatedAt = new Date();

        res.status(200).json({
            success: true,
            message: 'Status updated successfully',
            data: { ticket }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.put('/api/tickets/:id/assign', protect, authorize('DEVELOPER'), (req, res) => {
    try {
        const ticket = db.tickets.find(t => t._id === req.params.id);

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        ticket.assignedTo = {
            _id: req.user.id,
            name: req.user.name,
            email: req.user.email
        };
        ticket.updatedAt = new Date();

        res.status(200).json({
            success: true,
            message: 'Ticket assigned successfully',
            data: { ticket }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/tickets/user/:email', (req, res) => {
    try {
        const tickets = db.tickets
            .filter(t => t.userEmail === req.params.email)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.status(200).json({
            success: true,
            count: tickets.length,
            data: { tickets }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Tashkhees Support Portal API is running (In-Memory Mode)',
        timestamp: new Date().toISOString(),
        stats: {
            users: db.users.length,
            tickets: db.tickets.length,
            replies: db.replies.length
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: err.message || 'Server Error'
    });
});

// Create default users
const createDefaultUsers = async () => {
    const salt = await bcrypt.genSalt(10);

    // Admin/Developer user
    const adminPassword = await bcrypt.hash('admin123', salt);
    db.users.push({
        id: 'admin-001',
        name: 'Admin Developer',
        email: 'admin@tashkhees.com',
        password: adminPassword,
        role: 'DEVELOPER',
        createdAt: new Date()
    });

    // Regular user
    const userPassword = await bcrypt.hash('user123', salt);
    db.users.push({
        id: 'user-001',
        name: 'John Doe',
        email: 'user@example.com',
        password: userPassword,
        role: 'USER',
        createdAt: new Date()
    });

    // Create sample tickets
    db.tickets.push({
        _id: 'ticket-001',
        ticketId: 'TSK-1001',
        userName: 'John Doe',
        userEmail: 'user@example.com',
        product: 'RxScan',
        subject: 'Login Issue',
        description: 'Cannot login to my RxScan account. Getting authentication error.',
        status: 'Open',
        priority: 'High',
        assignedTo: null,
        attachmentPath: null,
        statusHistory: [{ status: 'Open', changedAt: new Date() }],
        createdAt: new Date(),
        updatedAt: new Date()
    });

    db.tickets.push({
        _id: 'ticket-002',
        ticketId: 'TSK-1002',
        userName: 'Jane Smith',
        userEmail: 'jane@example.com',
        product: 'Medscribe',
        subject: 'Feature Request',
        description: 'Would like to have dark mode in Medscribe application.',
        status: 'In Progress',
        priority: 'Medium',
        assignedTo: {
            _id: 'admin-001',
            name: 'Admin Developer',
            email: 'admin@tashkhees.com'
        },
        attachmentPath: null,
        statusHistory: [
            { status: 'Open', changedAt: new Date(Date.now() - 86400000) },
            { status: 'In Progress', changedBy: 'admin-001', changedAt: new Date() }
        ],
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date()
    });

    db.ticketCounter = 1002;

    console.log('\n✅ Default users created:');
    console.log('📧 Admin: admin@tashkhees.com / Password: admin123');
    console.log('📧 User: user@example.com / Password: user123');
    console.log('🎫 Sample tickets created: 2\n');
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await createDefaultUsers();

    app.listen(PORT, () => {
        console.log(`\n🚀 Tashkhees Support Portal Backend (In-Memory Mode)`);
        console.log(`📡 Server running on port ${PORT}`);
        console.log(`🌐 API URL: http://localhost:${PORT}`);
        console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
        console.log(`\n⚠️  Note: Using in-memory storage. Data will be lost on restart.`);
        console.log(`⏰ Started at: ${new Date().toLocaleString()}\n`);
    });
};

startServer();
