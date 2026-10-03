import { ThreatModule, ScanContext, ThreatModuleResult } from '../types';

/**
 * Module 11: Scam Phrase Detection (HTML Body)
 * Weight: 20
 * Logic: Phishing pages contain urgency/fear phrases.
 * Algorithm: NLP keyword extraction for social engineering patterns.
 */
const SCAM_PHRASES = [
    'your account has been', 'account has been suspended', 'verify your identity',
    'confirm your account', 'unusual activity', 'unauthorized access',
    'click here immediately', 'act now', 'within 24 hours', 'within 48 hours',
    'failure to comply', 'will be terminated', 'your account will be',
    'limited time', 'congratulations you', 'you have been selected',
    'claim your prize', 'winner', 'won a', 'free gift',
    'update your payment', 'billing information', 'payment method expired',
    'enter your password', 'social security', 'ssn',
];

export const scamPhrases: ThreatModule = async (ctx: ScanContext): Promise<ThreatModuleResult> => {
    const WEIGHT = 20;
    let riskValue = 0;
    const findings: Record<string, any> = { matchedPhrases: [] };

    if (!ctx.responseBody) {
        return {
            moduleName: 'ScamPhrases',
            riskValue: 0,
            weight: WEIGHT,
            weightedScore: 0,
            description: 'No response body available for scam phrase analysis.',
            severity: 'info',
            findings: { reason: 'no_body' },
        };
    }

    const bodyLower = ctx.responseBody.toLowerCase();
    const matched: string[] = [];

    for (const phrase of SCAM_PHRASES) {
        if (bodyLower.includes(phrase)) {
            matched.push(phrase);
        }
    }

    findings.matchedPhrases = matched;
    findings.totalMatches = matched.length;

    if (matched.length >= 5) {
        riskValue = 1.0;
    } else if (matched.length >= 3) {
        riskValue = 0.8;
    } else if (matched.length >= 2) {
        riskValue = 0.5;
    } else if (matched.length === 1) {
        riskValue = 0.2;
    }

    const description = matched.length > 0
        ? `${matched.length} scam/social engineering phrase(s) detected in page content.`
        : 'No scam phrases detected in page content.';

    const severity = riskValue >= 0.8 ? 'critical' : riskValue >= 0.5 ? 'high' : riskValue >= 0.2 ? 'low' : 'info';

    return { moduleName: 'ScamPhrases', riskValue, weight: WEIGHT, weightedScore: riskValue * WEIGHT, description, severity, findings };
};
