import { ThreatModule, ScanContext, ThreatModuleResult } from '../types';

/**
 * Module 4: IP Reputation & Blacklist Check
 * Weight: 25
 * Logic: Check resolved IP against known blacklists and spam databases.
 */
export const ipReputation: ThreatModule = async (ctx: ScanContext): Promise<ThreatModuleResult> => {
    const WEIGHT = 25;
    let riskValue = 0;
    let description = '';
    const findings: Record<string, any> = {};

    findings.ip = ctx.resolvedIP;

    // Known malicious IP ranges (sample threat intel — in production, check DNSBL / VirusTotal)
    const knownBadRanges = [
        /^185\.220\.100\./, // Tor exit nodes
        /^185\.220\.101\./,
        /^23\.129\.64\./,
    ];

    if (!ctx.resolvedIP) {
        riskValue = 0.3;
        description = 'Could not determine IP address for reputation check.';
        findings.issue = 'no_ip';
    } else {
        const isBadRange = knownBadRanges.some((range) => range.test(ctx.resolvedIP));
        if (isBadRange) {
            riskValue = 1.0;
            description = `IP ${ctx.resolvedIP} matches known malicious/Tor exit node range.`;
            findings.issue = 'blacklisted_ip';
            findings.matchedRange = true;
        } else {
            // Check octets for hosting provider patterns commonly abused
            const octets = ctx.resolvedIP.split('.').map(Number);
            // Very high first octet can indicate bulletproof hosting
            if (octets[0] >= 185 && octets[0] <= 195) {
                riskValue = 0.2;
                description = `IP ${ctx.resolvedIP} is in a range commonly associated with Eastern European hosting — low elevated risk.`;
                findings.issue = 'suspicious_range';
            } else {
                riskValue = 0;
                description = `IP ${ctx.resolvedIP} — no blacklist matches found.`;
            }
        }
    }

    const severity = riskValue >= 0.8 ? 'critical' : riskValue >= 0.5 ? 'high' : riskValue >= 0.3 ? 'medium' : 'info';

    return {
        moduleName: 'IPReputation',
        riskValue,
        weight: WEIGHT,
        weightedScore: riskValue * WEIGHT,
        description,
        severity,
        findings,
    };
};
