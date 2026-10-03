import { ThreatModule, ScanContext, ThreatModuleResult } from '../types';

/**
 * Module 2: SSL/TLS Certificate Validation
 * Weight: 15
 * Logic: Invalid, expired, or self-signed SSL increases threat level.
 */
export const sslCertificate: ThreatModule = async (ctx: ScanContext): Promise<ThreatModuleResult> => {
    const WEIGHT = 15;
    let riskValue = 0;
    let description = '';
    const findings: Record<string, any> = {};

    const protocol = ctx.parsedUrl.protocol;
    findings.protocol = protocol;
    findings.sslInfo = ctx.sslInfo;

    if (protocol === 'http:') {
        riskValue = 0.8;
        description = 'Site does not use HTTPS — data transmitted in plaintext.';
        findings.issue = 'no_https';
    } else if (!ctx.sslInfo.valid) {
        riskValue = 1.0;
        description = 'SSL certificate is invalid or expired.';
        findings.issue = 'invalid_cert';
    } else if (ctx.sslInfo.selfSigned) {
        riskValue = 0.9;
        description = 'SSL certificate is self-signed — not issued by a trusted CA.';
        findings.issue = 'self_signed';
    } else if (ctx.sslInfo.expiresAt) {
        const daysToExpiry = Math.floor((new Date(ctx.sslInfo.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        findings.daysToExpiry = daysToExpiry;
        if (daysToExpiry < 0) {
            riskValue = 1.0;
            description = `SSL certificate expired ${Math.abs(daysToExpiry)} days ago.`;
        } else if (daysToExpiry < 7) {
            riskValue = 0.5;
            description = `SSL certificate expiring in ${daysToExpiry} days.`;
        } else {
            riskValue = 0;
            description = `Valid SSL certificate from ${ctx.sslInfo.issuer}, expires in ${daysToExpiry} days.`;
        }
    } else {
        riskValue = 0;
        description = `Valid SSL certificate from ${ctx.sslInfo.issuer}.`;
    }

    const severity = riskValue >= 0.8 ? 'critical' : riskValue >= 0.5 ? 'high' : riskValue >= 0.3 ? 'medium' : 'info';

    return {
        moduleName: 'SSLCertificate',
        riskValue,
        weight: WEIGHT,
        weightedScore: riskValue * WEIGHT,
        description,
        severity,
        findings,
    };
};
