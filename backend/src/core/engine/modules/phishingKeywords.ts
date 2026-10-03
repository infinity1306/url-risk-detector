import { ThreatModule, ScanContext, ThreatModuleResult } from '../types';

/**
 * Module 10: Phishing Keyword Detection
 * Weight: 15
 * Logic: Phishing URLs contain specific keywords in path/subdomain.
 * Algorithm: Dictionary match against known phishing terms.
 */
const PHISHING_KEYWORDS_HIGH = [
    'login', 'signin', 'sign-in', 'log-in', 'verify', 'verification',
    'secure', 'security', 'account', 'update', 'confirm', 'authenticate',
    'banking', 'password', 'credential', 'wallet', 'suspend',
];

const PHISHING_KEYWORDS_MEDIUM = [
    'alert', 'notice', 'urgent', 'important', 'action', 'required',
    'expire', 'limited', 'unlock', 'restore', 'recovery', 'validate',
    'webscr', 'customer', 'service', 'support', 'helpdesk',
];

export const phishingKeywords: ThreatModule = async (ctx: ScanContext): Promise<ThreatModuleResult> => {
    const WEIGHT = 15;
    let riskValue = 0;
    const findings: Record<string, any> = { matchedKeywords: [] };

    const urlLower = ctx.originalUrl.toLowerCase();
    const hostLower = ctx.hostname.toLowerCase();

    let highMatches: string[] = [];
    let mediumMatches: string[] = [];

    for (const kw of PHISHING_KEYWORDS_HIGH) {
        if (urlLower.includes(kw)) highMatches.push(kw);
    }
    for (const kw of PHISHING_KEYWORDS_MEDIUM) {
        if (urlLower.includes(kw)) mediumMatches.push(kw);
    }

    findings.highRiskKeywords = highMatches;
    findings.mediumRiskKeywords = mediumMatches;
    findings.matchedKeywords = [...highMatches, ...mediumMatches];

    // Keywords in the hostname are more suspicious than in path
    const hostKeywords = PHISHING_KEYWORDS_HIGH.filter((kw) => hostLower.includes(kw));
    findings.hostnameKeywords = hostKeywords;

    if (hostKeywords.length >= 2) {
        riskValue = 1.0;
    } else if (hostKeywords.length === 1) {
        riskValue = 0.8;
    } else if (highMatches.length >= 3) {
        riskValue = 0.8;
    } else if (highMatches.length >= 1) {
        riskValue = 0.5;
    } else if (mediumMatches.length >= 2) {
        riskValue = 0.3;
    } else {
        riskValue = 0;
    }

    const description =
        riskValue > 0
            ? `Phishing keywords detected: ${findings.matchedKeywords.join(', ')}.`
            : 'No phishing keywords detected in URL.';

    const severity = riskValue >= 0.8 ? 'high' : riskValue >= 0.5 ? 'medium' : riskValue >= 0.3 ? 'low' : 'info';

    return {
        moduleName: 'PhishingKeywords',
        riskValue,
        weight: WEIGHT,
        weightedScore: riskValue * WEIGHT,
        description,
        severity,
        findings,
    };
};
