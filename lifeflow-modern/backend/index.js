import express from 'express';
// Trigger watch restart 2
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import bcrypt from 'bcryptjs';
import { User, Request, Donation, Camp, sequelize } from './config/db.js';
import { cacheMiddleware, rateLimitMiddleware } from './middleware/cache.js';
import { updateExistingCampsWithCoordinates } from './utils/updateCampCoordinates.js';
import { Op } from 'sequelize';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import userRoutes from './routes/user.js';
import organizationRoutes from './routes/organization.js';
import appointmentRoutes from './routes/appointments.js';
import leaderboardRoutes from './routes/leaderboard.js';
import matchingRoutes from './routes/matching.js';
import chatbotRoutes from './routes/chatbot.js';
import analyticsRoutes from './routes/analytics.js';
import profileRoutes from './routes/profile.js';
import communityRoutes from './routes/community.js';
import supportRoutes from './routes/support.js';

dotenv.config();

const app = express();

// CORS configuration - MUST BE FIRST
app.use(cors({
    origin: function (origin, callback) {
        // Allow all origins for development
        callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Timestamp', 'Accept', 'X-Requested-With']
}));

// Compression for better performance
app.use(compression());

// Rate limiting
app.use(rateLimitMiddleware(15 * 60 * 1000, 1000)); // 1000 requests per 15 minutes for development

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    console.log(`>>> INCOMING: ${req.method} ${req.originalUrl}`);
    console.log(`>>> HEADERS:`, JSON.stringify(req.headers));
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`<<< OUTGOING: ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });
    next();
});

// Final consolidated public stats route
app.get('/api/public-stats', async (req, res) => {
    try {
        const [totalDonations, activeDonors, verifiedCenters] = await Promise.all([
            Donation.count({ 
                where: { status: { [Op.in]: ['COMPLETED', 'APPROVED'] } } 
            }),
            User.count({ where: { role: 'DONOR' } }),
            Camp.count({ where: { status: 'APPROVED' } })
        ]);

        res.json({
            status: 'success',
            data: {
                livesSaved: totalDonations * 3,
                activeDonors,
                successfulUnits: totalDonations,
                verifiedCenters
            }
        });
    } catch (error) {
        console.error('Public stats error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch public statistics.' });
    }
});

// Routes with caching for public endpoints
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/users', userRoutes); // Compatibility alias for old/cached requests
app.use('/api/org', organizationRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/leaderboard', leaderboardRoutes); // Removed cache for real-time updates
app.use('/api/matching', matchingRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/profile', profileRoutes);

// Community Routes
app.use('/api/community', communityRoutes);

// Support Routes
app.use('/api/support', supportRoutes);

// Public camps route with caching
app.use('/api/public', cacheMiddleware(2 * 60 * 1000), organizationRoutes); // 2 minute cache

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        database: 'connected' // Add actual DB health check
    });
});

// Basic Route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to LifeFlow API v3.0',
    version: '3.0.0',
    features: [
      'Enhanced Security',
      'AI Chatbot',
      'Appointment Booking',
      'Gamification',
      'Auto-Matching',
      'High Traffic Ready'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(err.status || 500).json({
        status: 'error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found'
    });
});

// Database sync with retry logic
const syncDatabase = async (retries = 3, delay = 5000) => {
    for (let i = 0; i < retries; i++) {
        try {
            await sequelize.sync({ alter: true }); // Enabled alter to add new columns like 'dob'
            console.log('✅ Database connected and synchronized.');
            
            // Auto-seed admin if database is empty (for new deployments)
            const userCount = await User.count();
            if (userCount === 0) {
                console.log('🌱 Database is empty. Seeding default admin...');
                const hashedPassword = await bcrypt.hash('admin123', 10);
                await User.create({
                    name: 'Admin',
                    email: 'admin@lifeflow.com',
                    password: hashedPassword,
                    role: 'ADMIN'
                });
                console.log('✅ Default admin seeded (admin@lifeflow.com / admin123)');
            }
            return;
        } catch (err) {
            console.error(`❌ Database sync attempt ${i + 1} failed:`, err.message);
            if (i < retries - 1) {
                console.log(`⏳ Retrying in ${delay / 1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                console.error('❌ All database sync attempts failed.');
                throw err;
            }
        }
    }
};

// Start server
const startServer = async () => {
    try {
        // Database operations
        try {
            await syncDatabase();
            
            // Update existing camps with coordinates
            console.log('🗺️ Checking for camps needing geocoding...');
            await updateExistingCampsWithCoordinates();
        } catch (dbError) {
            console.error('❌ Database connection failed. Some features will be limited:', dbError.message);
            console.log('💡 Tip: Ensure MySQL is running in your XAMPP Control Panel.');
        }
        
        const PORT = process.env.PORT || 5000;
        const server = app.listen(PORT, () => {
            console.log(`🚀 LifeFlow API running on port ${PORT}`);
            console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔒 Security: Enhanced JWT + Rate Limiting`);
            console.log(`🤖 Features: AI Chatbot + Auto-Matching`);
            console.log(`📊 Performance: Caching + Connection Pooling`);
            console.log(`🗺️ Geocoding: Auto-location for camps`);
        });

        // Graceful shutdown
        const gracefulShutdown = async () => {
            console.log('🔄 Shutting down gracefully...');
            server.close(async () => {
                console.log('✅ HTTP server closed.');
                try {
                    await sequelize.close();
                    console.log('✅ Database connections closed.');
                    process.exit(0);
                } catch (err) {
                    console.error('❌ Error closing database:', err);
                    process.exit(1);
                }
            });

            // Force shutdown after 10 seconds
            setTimeout(() => {
                console.error('❌ Could not close connections in time, forcing shutdown');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
