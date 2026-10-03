import mongoose, { Schema, Document } from 'mongoose';

export interface IDomain extends Document {
    hostname: string;
    tld: string;
    ageDays: number;
    registrar: string;
    creationDate: Date | null;
    expirationDate: Date | null;
    reputationScore: number;
    isPunycode: boolean;
    nameServers: string[];
    country: string;
    createdAt: Date;
    updatedAt: Date;
}

const domainSchema = new Schema<IDomain>(
    {
        hostname: { type: String, required: true, unique: true },
        tld: { type: String, default: '' },
        ageDays: { type: Number, default: -1 },
        registrar: { type: String, default: '' },
        creationDate: { type: Date, default: null },
        expirationDate: { type: Date, default: null },
        reputationScore: { type: Number, default: 0 },
        isPunycode: { type: Boolean, default: false },
        nameServers: [{ type: String }],
        country: { type: String, default: '' },
    },
    { timestamps: true }
);

export const Domain = mongoose.model<IDomain>('Domain', domainSchema);
