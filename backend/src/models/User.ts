import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    email: string;
    passwordHash: string;
    role: 'USER' | 'ADMIN' | 'ENTERPRISE';
    apiKeys: { key: string; name: string; createdAt: Date }[];
    scanQuota: number;
    scansUsed: number;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        email: { type: String, required: true, unique: true, lowercase: true },
        passwordHash: { type: String, required: true },
        role: { type: String, enum: ['USER', 'ADMIN', 'ENTERPRISE'], default: 'USER' },
        apiKeys: [
            {
                key: { type: String, required: true },
                name: { type: String, required: true },
                createdAt: { type: Date, default: Date.now },
            },
        ],
        scanQuota: { type: Number, default: 100 },
        scansUsed: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);
