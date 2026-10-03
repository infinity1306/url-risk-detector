import { ThreatModule, ScanContext, ThreatModuleResult } from '../types';

/**
 * Module 6: Punycode Homograph Detection
 * Weight: 20
 * Logic: Internationalized domain names (IDN) can use look-alike Unicode characters.
 * Algorithm: Detect xn-- prefix (punycode) and check for visual similarity to popular brands.
 */
const TARGET_BRANDS = [
    'google', 'facebook', 'apple', 'amazon', 'microsoft', 'paypal',
    'netflix', 'instagram', 'twitter', 'linkedin', 'github', 'yahoo',
    'ebay', 'dropbox', 'chase', 'wellsfargo', 'bankofamerica', 'citibank',
];

export const punycodeHomograph: ThreatModule = async (ctx: ScanContext): Promise<ThreatModuleResult> => {
    const WEIGHT = 20;
    let riskValue = 0;
    let description = '';
    const findings: Record<string, any> = {};

    const hostname = ctx.hostname.toLowerCase();
    findings.hostname = hostname;

    // Check for punycode encoding
    if (hostname.includes('xn--')) {
        findings.isPunycode = true;

        // Decode punycode for display
        try {
            const punycode = require('punycode/');
            const decoded = punycode.toUnicode(hostname);
            findings.decodedHostname = decoded;

            // Check if decoded form resembles a known brand
            const brandMatch = TARGET_BRANDS.find((brand) =>
                decoded.replace(/[^a-zA-Z]/g, '').toLowerCase().includes(brand)
            );

            if (brandMatch) {
                riskValue = 1.0;
                description = `Punycode homograph attack detected: "${decoded}" mimics "${brandMatch}".`;
                findings.targetBrand = brandMatch;
                findings.attack = 'homograph';
            } else {
                riskValue = 0.7;
                description = `Punycode domain detected: "${decoded}" — uses internationalized characters.`;
                findings.attack = 'idn_suspicious';
            }
        } catch {
            riskValue = 0.7;
            description = 'Punycode domain detected but could not be decoded.';
        }
    } else {
        findings.isPunycode = false;
        riskValue = 0;
        description = 'No punycode/homograph patterns detected.';
    }

    const severity = riskValue >= 0.8 ? 'critical' : riskValue >= 0.5 ? 'high' : 'info';

    return {
        moduleName: 'PunycodeHomograph',
        riskValue,
        weight: WEIGHT,
        weightedScore: riskValue * WEIGHT,
        description,
        severity,
        findings,
    };
};
