import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import fs from 'fs';
// Load environment variables
dotenv.config();

// Import Socket.IO
import { initializeSocket } from './socket.js';

// Import routes
import authRoutes from './routes/auth.js';
import ticketRoutes from './routes/tickets.js';
import replyRoutes from './routes/replies.js';
import notificationRoutes from './routes/notifications.js';
import userRoutes from './routes/users.js';
import licenseRoutes from './routes/licenses.js';

// Load environment variables
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

// Middleware - CORS Configuration
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Routes
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to Tashkhees Support Portal API',
        healthCheck: '/api/health'
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/replies', replyRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/licenses', licenseRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Tashkhees Support Portal API is running',
        timestamp: new Date().toISOString(),
        features: {
            socketIO: true,
            notifications: true,
            email: !!process.env.EMAIL_USER
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

// MongoDB Connection
const connectDB = async () => {
    try {
        console.log('⏳ Connecting to MongoDB...');
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.log('⚠️ Server will stay running, but database features will be unavailable.');
    }
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    // Start server first so the port is occupied and reachable
    server.listen(PORT, () => {
        console.log(`\n🚀 Tashkhees Support Portal Backend`);
        console.log(`📡 Server running on port ${PORT}`);
        console.log(`🌐 API URL: http://localhost:${PORT}`);
        console.log(`🔌 Socket.IO: Enabled`);
        console.log(`📧 Email: ${process.env.EMAIL_USER ? 'Configured' : 'Not configured'}`);
        console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
        console.log(`\n⏰ Started at: ${new Date().toLocaleString()}\n`);
    });

    // Then attempt DB connection
    await connectDB();
};

startServer();
