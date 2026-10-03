import { ThreatModule, ScanContext, ThreatModuleResult } from '../types';

/**
 * Module 14: Redirect Chain Analysis
 * Weight: 10
 * Logic: Multiple redirects are used to evade detection.
 * Algorithm: Count 301/302 hops. >3 hops = high risk.
 */
export const redirectChain: ThreatModule = async (ctx: ScanContext): Promise<ThreatModuleResult> => {
    const WEIGHT = 10;
    let riskValue = 0;
    const findings: Record<string, any> = {};

    const chain = ctx.redirectChain;
    findings.redirectCount = chain.length;
    findings.chain = chain;

    // Check for cross-domain redirects
    const domains = chain.map((url: string) => {
        try { return new URL(url).hostname; } catch { return ''; }
    }).filter(Boolean);
    const uniqueDomains = new Set(domains);
    findings.uniqueDomains = Array.from(uniqueDomains);
    findings.crossDomainRedirects = uniqueDomains.size > 1;

    if (chain.length > 5) {
        riskValue = 1.0;
    } else if (chain.length > 3) {
        riskValue = 0.8;
    } else if (chain.length > 1 && uniqueDomains.size > 2) {
        riskValue = 0.7;
    } else if (chain.length > 1) {
        riskValue = 0.3;
    } else {
        riskValue = 0;
    }

    // Protocol downgrade (HTTPS → HTTP) adds risk
    const hasDowngrade = chain.some((url: string, i: number) => {
        if (i === 0) return false;
        const prev = chain[i - 1];
        return prev.startsWith('https://') && url.startsWith('http://');
    });
    if (hasDowngrade) {
        riskValue = Math.min(1.0, riskValue + 0.3);
        findings.protocolDowngrade = true;
    }

    const description = chain.length > 0
        ? `${chain.length} redirect(s) detected across ${uniqueDomains.size} domain(s)${hasDowngrade ? ' — includes protocol downgrade (HTTPS→HTTP)' : ''}.`
        : 'No redirects detected.';

    const severity = riskValue >= 0.8 ? 'high' : riskValue >= 0.5 ? 'medium' : riskValue >= 0.3 ? 'low' : 'info';

    return { moduleName: 'RedirectChain', riskValue, weight: WEIGHT, weightedScore: riskValue * WEIGHT, description, severity, findings };
};
