import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/index';
import { connectDB } from './config/database';
import scanRoutes from './api/routes/scan.routes';
import { apiLimiter } from './api/middlewares/rateLimiter';
import { errorHandler, notFoundHandler } from './api/middlewares/errorHandler';
import { logger } from './utils/logger';

const app = express();

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors());

// Request parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Logging
app.use(morgan('combined'));

// Global rate limiter
app.use('/api', apiLimiter);

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', scanRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const start = async () => {
    await connectDB();
    // Start Server
    app.listen(config.port, '127.0.0.1', () => {
        logger.info(`🚀 Server running on port ${config.port} in ${config.nodeEnv} mode`);
    });
};

start().catch((err) => {
    logger.error('Failed to start server:', err);
    process.exit(1);
});

export default app;
