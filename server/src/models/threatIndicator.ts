import mongoose, { Schema, Document } from 'mongoose';

export interface IThreatIndicator extends Document {
    scanId: mongoose.Types.ObjectId;
    moduleName: string;
    riskValue: number;
    weightApplied: number;
    weightedScore: number;
    findings: Record<string, any>;
    description: string;
    severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
    createdAt: Date;
}

const threatIndicatorSchema = new Schema<IThreatIndicator>(
    {
        scanId: { type: Schema.Types.ObjectId, ref: 'URLScan', required: true, index: true },
        moduleName: { type: String, required: true },
        riskValue: { type: Number, required: true, min: 0, max: 1 },
        weightApplied: { type: Number, required: true },
        weightedScore: { type: Number, required: true },
        findings: { type: Schema.Types.Mixed, default: {} },
        description: { type: String, default: '' },
        severity: {
            type: String,
            enum: ['info', 'low', 'medium', 'high', 'critical'],
            default: 'info',
        },
    },
    { timestamps: true }
);

export const ThreatIndicator = mongoose.model<IThreatIndicator>(
    'ThreatIndicator',
    threatIndicatorSchema
);
