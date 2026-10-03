import { ThreatModule, ScanContext, ThreatModuleResult } from '../types';

/**
 * Module 7: Typosquatting Detection
 * Weight: 15
 * Logic: Attackers register domains similar to popular brands (e.g., g00gle.com).
 * Algorithm: Levenshtein distance against top brand domains.
 */
const TOP_DOMAINS = [
    'google.com', 'facebook.com', 'apple.com', 'amazon.com', 'microsoft.com',
    'paypal.com', 'netflix.com', 'instagram.com', 'twitter.com', 'linkedin.com',
    'github.com', 'yahoo.com', 'ebay.com', 'dropbox.com', 'chase.com',
    'wellsfargo.com', 'bankofamerica.com', 'outlook.com', 'office.com',
    'icloud.com', 'spotify.com', 'reddit.com', 'twitch.tv', 'zoom.us',
];

function levenshtein(a: string, b: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

export const typosquatting: ThreatModule = async (ctx: ScanContext): Promise<ThreatModuleResult> => {
    const WEIGHT = 15;
    let riskValue = 0;
    let description = '';
    const findings: Record<string, any> = {};

    const hostname = ctx.hostname.toLowerCase();
    findings.hostname = hostname;

    // Skip if exact match with known domain
    if (TOP_DOMAINS.includes(hostname)) {
        riskValue = 0;
        description = 'Domain is an exact match of a known legitimate domain.';
        findings.match = 'exact';
        return { moduleName: 'Typosquatting', riskValue, weight: WEIGHT, weightedScore: 0, description, severity: 'info', findings };
    }

    let closestDomain = '';
    let closestDistance = Infinity;

    for (const domain of TOP_DOMAINS) {
        const dist = levenshtein(hostname, domain);
        if (dist < closestDistance) {
            closestDistance = dist;
            closestDomain = domain;
        }
    }

    findings.closestDomain = closestDomain;
    findings.levenshteinDistance = closestDistance;

    if (closestDistance === 1) {
        riskValue = 0.95;
        description = `Possible typosquatting: "${hostname}" is 1 character away from "${closestDomain}".`;
        findings.attack = 'typosquat_high';
    } else if (closestDistance === 2) {
        riskValue = 0.7;
        description = `Possible typosquatting: "${hostname}" is 2 characters away from "${closestDomain}".`;
        findings.attack = 'typosquat_medium';
    } else if (closestDistance === 3) {
        riskValue = 0.3;
        description = `Mild similarity to "${closestDomain}" (distance: 3).`;
        findings.attack = 'typosquat_low';
    } else {
        riskValue = 0;
        description = 'No typosquatting patterns detected.';
    }

    const severity = riskValue >= 0.8 ? 'critical' : riskValue >= 0.5 ? 'high' : riskValue >= 0.3 ? 'medium' : 'info';

    return {
        moduleName: 'Typosquatting',
        riskValue,
        weight: WEIGHT,
        weightedScore: riskValue * WEIGHT,
        description,
        severity,
        findings,
    };
};
