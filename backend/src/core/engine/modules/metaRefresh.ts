import { ThreatModule, ScanContext, ThreatModuleResult } from '../types';

/**
 * Module 16: Meta Refresh Detection
 * Weight: 10
 * Logic: HTML-based redirects via <meta http-equiv="refresh">.
 * Algorithm: Extract meta refresh tags and analyze timing + destination.
 */
export const metaRefresh: ThreatModule = async (ctx: ScanContext): Promise<ThreatModuleResult> => {
    const WEIGHT = 10;
    let riskValue = 0;
    const findings: Record<string, any> = {};

    if (!ctx.responseBody) {
        return {
            moduleName: 'MetaRefresh', riskValue: 0, weight: WEIGHT, weightedScore: 0,
            description: 'No response body available for meta refresh analysis.', severity: 'info', findings: { reason: 'no_body' },
        };
    }

    const metaRefreshRegex = /<meta[^>]*http-equiv\s*=\s*["']?refresh["']?[^>]*content\s*=\s*["']?(\d+)\s*;?\s*url\s*=\s*["']?([^"'\s>]+)/gi;
    const matches = [...ctx.responseBody.matchAll(metaRefreshRegex)];

    findings.metaRefreshTags = matches.map((m) => ({ delay: parseInt(m[1]), url: m[2] }));
    findings.count = matches.length;

    if (matches.length > 0) {
        const hasInstantRedirect = matches.some((m) => parseInt(m[1]) <= 1);
        const hasCrossDomain = matches.some((m) => {
            try {
                return new URL(m[2]).hostname !== ctx.hostname;
            } catch { return true; }
        });

        findings.instantRedirect = hasInstantRedirect;
        findings.crossDomainRedirect = hasCrossDomain;

        if (hasInstantRedirect && hasCrossDomain) {
            riskValue = 1.0;
        } else if (hasCrossDomain) {
            riskValue = 0.7;
        } else if (hasInstantRedirect) {
            riskValue = 0.5;
        } else {
            riskValue = 0.3;
        }
    }

    const description = matches.length > 0
        ? `${matches.length} meta refresh tag(s) detected${findings.crossDomainRedirect ? ' with cross-domain redirect' : ''}.`
        : 'No meta refresh tags detected.';

    const severity = riskValue >= 0.8 ? 'high' : riskValue >= 0.5 ? 'medium' : riskValue >= 0.3 ? 'low' : 'info';

    return { moduleName: 'MetaRefresh', riskValue, weight: WEIGHT, weightedScore: riskValue * WEIGHT, description, severity, findings };
};
