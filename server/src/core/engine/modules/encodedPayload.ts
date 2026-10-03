import { ThreatModule, ScanContext, ThreatModuleResult } from '../types';

/**
 * Module 13: Encoded Payload Detection
 * Weight: 20
 * Logic: Base64 or other encoded payloads in URL parameters.
 * Algorithm: Regex match Base64 strings, data URIs, encoded scripts.
 */
const BASE64_REGEX = /[A-Za-z0-9+/]{40,}={0,2}/;
const DATA_URI_REGEX = /data:[a-zA-Z]+\/[a-zA-Z]+;base64,/i;
const JS_PROTOCOL_REGEX = /javascript:/i;

export const encodedPayload: ThreatModule = async (ctx: ScanContext): Promise<ThreatModuleResult> => {
    const WEIGHT = 20;
    let riskValue = 0;
    const findings: Record<string, any> = {};

    const url = ctx.originalUrl;
    const queryString = url.split('?')[1] || '';

    // Check URL params for base64
    const base64InUrl = BASE64_REGEX.test(queryString);
    findings.base64InUrl = base64InUrl;

    // Check for data URIs
    const dataUriInUrl = DATA_URI_REGEX.test(url);
    findings.dataUriInUrl = dataUriInUrl;

    // Check for javascript: protocol
    const jsProtocol = JS_PROTOCOL_REGEX.test(url);
    findings.jsProtocol = jsProtocol;

    // Check response body for suspicious encoded payloads
    let base64InBody = false;
    let encodedScriptsInBody = false;
    if (ctx.responseBody) {
        base64InBody = /eval\s*\(\s*atob\s*\(/.test(ctx.responseBody);
        encodedScriptsInBody = /document\.write\s*\(\s*unescape\s*\(/.test(ctx.responseBody);
        findings.base64InBody = base64InBody;
        findings.encodedScriptsInBody = encodedScriptsInBody;
    }

    if (jsProtocol) {
        riskValue = 1.0;
    } else if (dataUriInUrl) {
        riskValue = 0.9;
    } else if (base64InBody || encodedScriptsInBody) {
        riskValue = 0.8;
    } else if (base64InUrl) {
        riskValue = 0.6;
    }

    const description = riskValue > 0
        ? `Encoded payload detected: ${jsProtocol ? 'javascript: protocol, ' : ''}${dataUriInUrl ? 'data URI, ' : ''}${base64InUrl ? 'Base64 in URL, ' : ''}${base64InBody ? 'eval(atob()) in body, ' : ''}${encodedScriptsInBody ? 'unescape() in body' : ''}`.replace(/, $/, '.')
        : 'No encoded payloads detected.';

    const severity = riskValue >= 0.8 ? 'critical' : riskValue >= 0.5 ? 'high' : 'info';

    return { moduleName: 'EncodedPayload', riskValue, weight: WEIGHT, weightedScore: riskValue * WEIGHT, description, severity, findings };
};
