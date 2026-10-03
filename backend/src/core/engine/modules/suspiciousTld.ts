import { ThreatModule, ScanContext, ThreatModuleResult } from '../types';

/**
 * Module 5: Suspicious TLD Detection
 * Weight: 8
 * Logic: Certain TLDs have significantly higher abuse rates.
 */
const SUSPICIOUS_TLDS = new Set([
    '.xyz', '.top', '.pw', '.cc', '.tk', '.ml', '.ga', '.cf', '.gq',
    '.buzz', '.club', '.work', '.click', '.link', '.info', '.loan',
    '.win', '.bid', '.stream', '.racing', '.review', '.science',
    '.party', '.download', '.trade', '.accountant', '.cricket', '.date',
    '.faith', '.men', '.icu', '.cyou', '.rest', '.surf',
]);

const HIGHLY_SUSPICIOUS_TLDS = new Set([
    '.tk', '.ml', '.ga', '.cf', '.gq', '.pw',
]);

export const suspiciousTld: ThreatModule = async (ctx: ScanContext): Promise<ThreatModuleResult> => {
    const WEIGHT = 8;
    let riskValue = 0;
    let description = '';
    const findings: Record<string, any> = { tld: ctx.tld };

    if (HIGHLY_SUSPICIOUS_TLDS.has(ctx.tld)) {
        riskValue = 1.0;
        description = `TLD "${ctx.tld}" is a free domain with extremely high abuse rate.`;
        findings.category = 'highly_suspicious';
    } else if (SUSPICIOUS_TLDS.has(ctx.tld)) {
        riskValue = 0.7;
        description = `TLD "${ctx.tld}" has elevated abuse statistics.`;
        findings.category = 'suspicious';
    } else {
        riskValue = 0;
        description = `TLD "${ctx.tld}" has normal reputation.`;
        findings.category = 'clean';
    }

    const severity = riskValue >= 0.8 ? 'high' : riskValue >= 0.5 ? 'medium' : 'info';

    return {
        moduleName: 'SuspiciousTLD',
        riskValue,
        weight: WEIGHT,
        weightedScore: riskValue * WEIGHT,
        description,
        severity,
        findings,
    };
};
