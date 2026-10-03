import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
});

export interface ScanResponse {
    success: boolean;
    data: ReportData;
    message?: string;
}

export interface Indicator {
    module: string;
    riskValue: number;
    weightApplied: number;
    weightedScore: number;
    description: string;
    severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
    findings: Record<string, any>;
}

export interface ReportData {
    scanId: string;
    url: string;
    status: string;
    finalScore: number;
    riskLevel: 'Safe' | 'Low' | 'Moderate' | 'High' | 'Critical';
    confidence: number;
    summary: string;
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
        expiresAt: string | null;
        protocol: string;
    };
    domain: {
        hostname: string;
        ageDays: number;
        registrar: string;
        creationDate: string | null;
        country: string;
    };
    indicators: Indicator[];
    scannedAt: string;
    message?: string;
}

export interface StatsData {
    totalScans: number;
    completedScans: number;
    criticalThreats: number;
    highThreats: number;
    averageScore: number;
    riskDistribution: Record<string, number>;
    recentScans: {
        url: string;
        finalScore: number;
        riskLevel: string;
        createdAt: string;
    }[];
}

export const submitScan = async (url: string): Promise<ScanResponse> => {
    const res = await api.post('/analyze', { url });
    return res.data;
};

export const getReport = async (id: string): Promise<{ success: boolean; data: ReportData }> => {
    const res = await api.get(`/report/${id}`);
    return res.data;
};

export const getStats = async (): Promise<{ success: boolean; data: StatsData }> => {
    const res = await api.get('/stats');
    return res.data;
};

export default api;
