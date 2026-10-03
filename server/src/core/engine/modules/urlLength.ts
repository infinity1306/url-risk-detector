import { ThreatModule, ScanContext, ThreatModuleResult } from '../types';

/**
 * Module 9: URL Length Anomaly Detection
 * Weight: 5
 * Logic: Excessively long URLs often used for obfuscation.
 */
export const urlLength: ThreatModule = async (ctx: ScanContext): Promise<ThreatModuleResult> => {
    const WEIGHT = 5;
    let riskValue = 0;
    let description = '';
    const findings: Record<string, any> = {};

    const url = ctx.originalUrl;
    findings.length = url.length;
    findings.pathDepth = ctx.pathSegments.filter(Boolean).length;
    findings.queryParamCount = Object.keys(ctx.queryParams).length;

    if (url.length > 500) {
        riskValue = 1.0;
        description = `Extremely long URL (${url.length} chars) — heavy obfuscation likely.`;
    } else if (url.length > 200) {
        riskValue = 0.7;
        description = `Very long URL (${url.length} chars) — potential obfuscation.`;
    } else if (url.length > 100) {
        riskValue = 0.3;
        description = `Long URL (${url.length} chars) with ${findings.pathDepth} path segments.`;
    } else {
        riskValue = 0;
        description = `Normal URL length (${url.length} chars).`;
    }

    // Bonus risk for deep path nesting
    if (findings.pathDepth > 6) {
        riskValue = Math.min(1.0, riskValue + 0.2);
        description += ` Deep path nesting detected (${findings.pathDepth} levels).`;
    }

    const severity = riskValue >= 0.7 ? 'medium' : 'info';

    return {
        moduleName: 'URLLength',
        riskValue,
        weight: WEIGHT,
        weightedScore: riskValue * WEIGHT,
        description,
        severity,
        findings,
    };
};
