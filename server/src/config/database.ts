import mongoose from 'mongoose';
import { config } from './index';

export const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(config.mongoUri);
        console.log('✅ MongoDB connected');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err);
        // Removed process.exit(1) to prevent crashing on Vercel if MongoDB is missing
    }
};
