import { ThreatModule, ScanContext, ThreatModuleResult } from '../types';

/**
 * Module 18: Parameter Injection Detection (XSS/SQLi)
 * Weight: 20
 * Logic: URL query params containing injection payloads.
 * Algorithm: Regex patterns for XSS and SQL injection.
 */
const XSS_PATTERNS = [
    /<script/i, /javascript:/i, /on\w+\s*=/i,
    /eval\s*\(/i, /document\.\w+/i, /window\.\w+/i,
    /alert\s*\(/i, /prompt\s*\(/i, /confirm\s*\(/i,
    /src\s*=\s*["']?javascript/i, /data:text\/html/i,
];

const SQLI_PATTERNS = [
    /'\s*(or|and)\s+/i, /union\s+select/i, /;\s*drop\s+/i,
    /--\s*$/, /'\s*=\s*'/, /1\s*=\s*1/, /'\s*;\s*/,
    /exec\s*\(/i, /xp_cmdshell/i, /INFORMATION_SCHEMA/i,
];

export const paramInjection: ThreatModule = async (ctx: ScanContext): Promise<ThreatModuleResult> => {
    const WEIGHT = 20;
    let riskValue = 0;
    const findings: Record<string, any> = { xssPatterns: [], sqliPatterns: [] };

    const queryString = ctx.parsedUrl.search || '';
    const fullUrl = ctx.originalUrl;
    const testString = decodeURIComponent(queryString + ' ' + fullUrl).replace(/\+/g, ' ');

    // XSS detection
    const xssMatches: string[] = [];
    for (const pattern of XSS_PATTERNS) {
        if (pattern.test(testString)) {
            xssMatches.push(pattern.source);
        }
    }
    findings.xssPatterns = xssMatches;

    // SQLi detection
    const sqliMatches: string[] = [];
    for (const pattern of SQLI_PATTERNS) {
        if (pattern.test(testString)) {
            sqliMatches.push(pattern.source);
        }
    }
    findings.sqliPatterns = sqliMatches;

    if (xssMatches.length > 0 && sqliMatches.length > 0) {
        riskValue = 1.0;
    } else if (xssMatches.length >= 2 || sqliMatches.length >= 2) {
        riskValue = 0.9;
    } else if (xssMatches.length === 1 || sqliMatches.length === 1) {
        riskValue = 0.7;
    }

    const description = riskValue > 0
        ? `Injection patterns detected: ${xssMatches.length} XSS, ${sqliMatches.length} SQLi pattern(s) in URL parameters.`
        : 'No injection patterns detected in URL parameters.';

    const severity = riskValue >= 0.8 ? 'critical' : riskValue >= 0.5 ? 'high' : 'info';

    return { moduleName: 'ParamInjection', riskValue, weight: WEIGHT, weightedScore: riskValue * WEIGHT, description, severity, findings };
};
