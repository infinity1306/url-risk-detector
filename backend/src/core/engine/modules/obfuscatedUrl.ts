import { ThreatModule, ScanContext, ThreatModuleResult } from '../types';

/**
 * Module 12: Obfuscated URL Pattern Detection
 * Weight: 10
 * Logic: Encoded characters, hex representations used to hide true URL intent.
 * Algorithm: Ratio of encoded characters to total URL length.
 */
export const obfuscatedUrl: ThreatModule = async (ctx: ScanContext): Promise<ThreatModuleResult> => {
    const WEIGHT = 10;
    let riskValue = 0;
    const findings: Record<string, any> = {};

    const url = ctx.originalUrl;
    const encodedMatches = url.match(/%[0-9A-Fa-f]{2}/g) || [];
    const encodedRatio = encodedMatches.length / url.length;

    findings.encodedCharCount = encodedMatches.length;
    findings.urlLength = url.length;
    findings.encodedRatio = Math.round(encodedRatio * 1000) / 1000;

    // Check for @ symbol (credential-based obfuscation)
    const hasAtSymbol = url.includes('@');
    findings.hasCredentialObfuscation = hasAtSymbol;

    // Check for IP-based URLs with encoded segments
    const hasHexIP = /0x[0-9a-fA-F]+/.test(url);
    findings.hasHexIP = hasHexIP;

    if (hasAtSymbol) {
        riskValue = Math.max(riskValue, 0.9);
        findings.issue = 'credential_obfuscation';
    }

    if (hasHexIP) {
        riskValue = Math.max(riskValue, 0.8);
    }

    if (encodedRatio > 0.3) {
        riskValue = Math.max(riskValue, 1.0);
    } else if (encodedRatio > 0.15) {
        riskValue = Math.max(riskValue, 0.7);
    } else if (encodedRatio > 0.05) {
        riskValue = Math.max(riskValue, 0.3);
    }

    const description = riskValue > 0
        ? `URL obfuscation detected: ${encodedMatches.length} encoded chars (${(encodedRatio * 100).toFixed(1)}% encoded)${hasAtSymbol ? ', credential obfuscation (@)' : ''}${hasHexIP ? ', hex IP encoding' : ''}.`
        : 'No URL obfuscation patterns detected.';

    const severity = riskValue >= 0.8 ? 'high' : riskValue >= 0.5 ? 'medium' : riskValue >= 0.3 ? 'low' : 'info';

    return { moduleName: 'ObfuscatedURL', riskValue, weight: WEIGHT, weightedScore: riskValue * WEIGHT, description, severity, findings };
};
