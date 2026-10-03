import mongoose, { Schema, Document } from 'mongoose';

export interface IURLScan extends Document {
    url: string;
    normalizedUrl: string;
    domainId: mongoose.Types.ObjectId;
    submittedBy: mongoose.Types.ObjectId | null;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    finalScore: number;
    riskLevel: 'Safe' | 'Low' | 'Moderate' | 'High' | 'Critical';
    confidence: number;
    summary: string;
    indicators: mongoose.Types.ObjectId[];
    metadata: {
        scanDurationMs: number;
        ipAddress: string;
        redirectChain: string[];
        server: string;
        contentType: string;
        statusCode: number;
    };
    ssl: {
        valid: boolean;
        issuer: string;
        expiresAt: Date | null;
        protocol: string;
    };
    domain: {
        hostname: string;
        ageDays: number;
        registrar: string;
        creationDate: Date | null;
        country: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const urlScanSchema = new Schema<IURLScan>(
    {
        url: { type: String, required: true, index: true },
        normalizedUrl: { type: String, required: true },
        domainId: { type: Schema.Types.ObjectId, ref: 'Domain', default: null },
        submittedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
        status: {
            type: String,
            enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
            default: 'PENDING',
        },
        finalScore: { type: Number, min: 0, max: 100, default: 0 },
        riskLevel: {
            type: String,
            enum: ['Safe', 'Low', 'Moderate', 'High', 'Critical'],
            default: 'Safe',
        },
        confidence: { type: Number, min: 0, max: 100, default: 0 },
        summary: { type: String, default: '' },
        indicators: [{ type: Schema.Types.ObjectId, ref: 'ThreatIndicator' }],
        metadata: {
            scanDurationMs: { type: Number, default: 0 },
            ipAddress: { type: String, default: '' },
            redirectChain: [{ type: String }],
            server: { type: String, default: '' },
            contentType: { type: String, default: '' },
            statusCode: { type: Number, default: 0 },
        },
        ssl: {
            valid: { type: Boolean, default: false },
            issuer: { type: String, default: '' },
            expiresAt: { type: Date, default: null },
            protocol: { type: String, default: '' },
        },
        domain: {
            hostname: { type: String, default: '' },
            ageDays: { type: Number, default: -1 },
            registrar: { type: String, default: '' },
            creationDate: { type: Date, default: null },
            country: { type: String, default: '' },
        },
    },
    { timestamps: true }
);

urlScanSchema.index({ createdAt: -1 });
urlScanSchema.index({ status: 1 });

export const URLScan = mongoose.model<IURLScan>('URLScan', urlScanSchema);
