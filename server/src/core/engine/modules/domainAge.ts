import { ThreatModule, ScanContext, ThreatModuleResult } from '../types';

/**
 * Module 1: Domain Age Analysis
 * Weight: 15
 * Logic: Newly registered domains (<30 days) are high-risk for phishing.
 * Algorithm: Calculate days since WHOIS creation date.
 */
export const domainAge: ThreatModule = async (ctx: ScanContext): Promise<ThreatModuleResult> => {
    const WEIGHT = 15;
    let riskValue = 0;
    let description = '';
    const findings: Record<string, any> = {};

    if (!ctx.whoisData.creationDate) {
        riskValue = 0.6;
        description = 'WHOIS creation date unavailable — domain age cannot be verified.';
        findings.reason = 'no_whois_data';
    } else {
        const ageMs = Date.now() - new Date(ctx.whoisData.creationDate).getTime();
        const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));
        findings.ageDays = ageDays;
        findings.creationDate = ctx.whoisData.creationDate;

        if (ageDays < 7) {
            riskValue = 1.0;
            description = `Domain registered ${ageDays} days ago — extremely new, high phishing risk.`;
        } else if (ageDays < 30) {
            riskValue = 0.9;
            description = `Domain registered ${ageDays} days ago — very new, elevated risk.`;
        } else if (ageDays < 90) {
            riskValue = 0.6;
            description = `Domain registered ${ageDays} days ago — relatively new.`;
        } else if (ageDays < 180) {
            riskValue = 0.3;
            description = `Domain registered ${ageDays} days ago — moderately established.`;
        } else if (ageDays < 365) {
            riskValue = 0.1;
            description = `Domain registered ${ageDays} days ago — established.`;
        } else {
            riskValue = 0;
            description = `Domain registered ${ageDays} days ago — well-established.`;
        }
    }

    const severity = riskValue >= 0.8 ? 'critical' : riskValue >= 0.5 ? 'high' : riskValue >= 0.3 ? 'medium' : 'info';

    return {
        moduleName: 'DomainAge',
        riskValue,
        weight: WEIGHT,
        weightedScore: riskValue * WEIGHT,
        description,
        severity,
        findings,
    };
};
