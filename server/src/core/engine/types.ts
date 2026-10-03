export interface ThreatModuleResult {
    moduleName: string;
    riskValue: number;        // 0.0 to 1.0
    weight: number;           // e.g., 15, 20, 25
    weightedScore: number;    // riskValue * weight
    description: string;
    severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
    findings: Record<string, any>;
}

export interface ScanContext {
    originalUrl: string;
    parsedUrl: URL;
    hostname: string;
    tld: string;
    pathSegments: string[];
    queryParams: Record<string, string>;
    resolvedIP: string;
    responseHeaders: Record<string, string>;
    responseBody: string;
    statusCode: number;
    redirectChain: string[];
    sslInfo: {
        valid: boolean;
        issuer: string;
        expiresAt: Date | null;
        protocol: string;
        selfSigned: boolean;
    };
    whoisData: {
        creationDate: Date | null;
        expirationDate: Date | null;
        registrar: string;
        country: string;
        nameServers: string[];
    };
}

export type ThreatModule = (ctx: ScanContext) => Promise<ThreatModuleResult>;
