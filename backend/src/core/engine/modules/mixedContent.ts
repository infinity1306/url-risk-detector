import { ThreatModule, ScanContext, ThreatModuleResult } from '../types';

/**
 * Module 20: Mixed Content Detection
 * Weight: 5
 * Logic: HTTPS pages loading resources over insecure HTTP.
 * Algorithm: Parse DOM for src/href attributes using http:// on HTTPS pages.
 */
export const mixedContent: ThreatModule = async (ctx: ScanContext): Promise<ThreatModuleResult> => {
    const WEIGHT = 5;
    let riskValue = 0;
    const findings: Record<string, any> = {};

    // Only relevant for HTTPS pages
    if (ctx.parsedUrl.protocol !== 'https:') {
        return {
            moduleName: 'MixedContent', riskValue: 0, weight: WEIGHT, weightedScore: 0,
            description: 'Page served over HTTP — mixed content check not applicable.', severity: 'info', findings: { reason: 'not_https' },
        };
    }

    if (!ctx.responseBody) {
        return {
            moduleName: 'MixedContent', riskValue: 0, weight: WEIGHT, weightedScore: 0,
            description: 'No response body available for mixed content analysis.', severity: 'info', findings: { reason: 'no_body' },
        };
    }

    // Find HTTP resources in src, href, action attributes
    const httpResourceRegex = /(?:src|href|action)\s*=\s*["']?(http:\/\/[^"'\s>]+)/gi;
    const matches = [...ctx.responseBody.matchAll(httpResourceRegex)];
    const httpResources = matches.map((m) => m[1]);

    findings.httpResources = httpResources.slice(0, 20); // Cap at 20 for response size
    findings.count = httpResources.length;

    // Categorize: active (script, iframe) vs passive (img, font)
    const activeContentRegex = /<(?:script|iframe|object|embed|link[^>]*rel=["']?stylesheet)[^>]*src\s*=\s*["']?http:\/\//gi;
    const activeMatches = ctx.responseBody.match(activeContentRegex) || [];
    findings.activeContentCount = activeMatches.length;

    if (activeMatches.length > 0) {
        riskValue = 0.8;
    } else if (httpResources.length > 10) {
        riskValue = 0.5;
    } else if (httpResources.length > 0) {
        riskValue = 0.3;
    }

    const description = httpResources.length > 0
        ? `${httpResources.length} HTTP resource(s) on HTTPS page${activeMatches.length > 0 ? ` — ${activeMatches.length} active content (scripts/iframes)` : ''}.`
        : 'No mixed content detected.';

    const severity = riskValue >= 0.8 ? 'high' : riskValue >= 0.3 ? 'low' : 'info';

    return { moduleName: 'MixedContent', riskValue, weight: WEIGHT, weightedScore: riskValue * WEIGHT, description, severity, findings };
};
