import mongoose, { Schema, Document } from 'mongoose';

export interface IBlacklistCache extends Document {
    indicator: string;
    type: 'IP' | 'DOMAIN' | 'URL';
    source: string;
    listedAt: Date;
    expiresAt: Date;
}

const blacklistCacheSchema = new Schema<IBlacklistCache>(
    {
        indicator: { type: String, required: true, index: true },
        type: { type: String, enum: ['IP', 'DOMAIN', 'URL'], required: true },
        source: { type: String, default: 'manual' },
        listedAt: { type: Date, default: Date.now },
        expiresAt: { type: Date, required: true },
    },
    { timestamps: true }
);

blacklistCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
blacklistCacheSchema.index({ indicator: 1, type: 1 });

export const BlacklistCache = mongoose.model<IBlacklistCache>(
    'BlacklistCache',
    blacklistCacheSchema
);
