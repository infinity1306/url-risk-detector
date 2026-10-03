import { ThreatModule, ScanContext, ThreatModuleResult } from '../types';

/**
 * Module 8: URL Entropy Scoring
 * Weight: 10
 * Logic: DGA (Domain Generation Algorithm) domains have high Shannon entropy.
 * Algorithm: Shannon entropy of the hostname. Threshold > 4.0 is suspicious.
 */
function shannonEntropy(str: string): number {
    const len = str.length;
    if (len === 0) return 0;

    const freq: Record<string, number> = {};
    for (const char of str) {
        freq[char] = (freq[char] || 0) + 1;
    }

    let entropy = 0;
    for (const key in freq) {
        const p = freq[key] / len;
        entropy -= p * Math.log2(p);
    }
    return entropy;
}

export const urlEntropy: ThreatModule = async (ctx: ScanContext): Promise<ThreatModuleResult> => {
    const WEIGHT = 10;
    let riskValue = 0;
    let description = '';
    const findings: Record<string, any> = {};

    // Calculate entropy of hostname (without TLD)
    const hostnameWithoutTld = ctx.hostname.split('.').slice(0, -1).join('.');
    const entropy = shannonEntropy(hostnameWithoutTld);
    findings.entropy = Math.round(entropy * 100) / 100;
    findings.hostname = hostnameWithoutTld;

    // Also calculate full URL entropy
    const fullEntropy = shannonEntropy(ctx.originalUrl);
    findings.fullUrlEntropy = Math.round(fullEntropy * 100) / 100;

    if (entropy > 4.5) {
        riskValue = 1.0;
        description = `Very high hostname entropy (${findings.entropy}) — likely DGA-generated domain.`;
    } else if (entropy > 4.0) {
        riskValue = 0.7;
        description = `High hostname entropy (${findings.entropy}) — possibly algorithmically generated.`;
    } else if (entropy > 3.5) {
        riskValue = 0.3;
        description = `Moderate hostname entropy (${findings.entropy}) — slightly unusual.`;
    } else {
        riskValue = 0;
        description = `Normal hostname entropy (${findings.entropy}).`;
    }

    const severity = riskValue >= 0.8 ? 'high' : riskValue >= 0.5 ? 'medium' : 'info';

    return {
        moduleName: 'URLEntropy',
        riskValue,
        weight: WEIGHT,
        weightedScore: riskValue * WEIGHT,
        description,
        severity,
        findings,
    };
};
