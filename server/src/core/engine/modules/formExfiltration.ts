import { ThreatModule, ScanContext, ThreatModuleResult } from '../types';

/**
 * Module 19: Form Action Exfiltration Detection
 * Weight: 25
 * Logic: Forms that POST data to external/unrelated domains.
 * Algorithm: Parse <form action="..."> and compare with page origin.
 */
export const formExfiltration: ThreatModule = async (ctx: ScanContext): Promise<ThreatModuleResult> => {
    const WEIGHT = 25;
    let riskValue = 0;
    const findings: Record<string, any> = { forms: [], exfiltratingForms: [] };

    if (!ctx.responseBody) {
        return {
            moduleName: 'FormExfiltration', riskValue: 0, weight: WEIGHT, weightedScore: 0,
            description: 'No response body available for form analysis.', severity: 'info', findings: { reason: 'no_body' },
        };
    }

    const formRegex = /<form[^>]*action\s*=\s*["']?([^"'\s>]+)/gi;
    const matches = [...ctx.responseBody.matchAll(formRegex)];

    findings.totalForms = matches.length;

    const exfiltrating: { action: string; reason: string }[] = [];

    for (const match of matches) {
        const action = match[1];
        findings.forms.push(action);

        try {
            // Skip relative/empty actions
            if (!action || action.startsWith('/') || action.startsWith('#') || action.startsWith('?')) {
                continue;
            }

            const actionUrl = new URL(action, ctx.originalUrl);
            if (actionUrl.hostname !== ctx.hostname) {
                exfiltrating.push({
                    action,
                    reason: `Form posts to external domain: ${actionUrl.hostname}`,
                });
            }

            // Check for IP-based form actions
            if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(actionUrl.hostname)) {
                exfiltrating.push({ action, reason: 'Form posts to raw IP address' });
            }
        } catch {
            // Malformed URL in form action
            exfiltrating.push({ action, reason: 'Malformed form action URL' });
        }
    }

    findings.exfiltratingForms = exfiltrating;

    // Also check for password fields — a form with password input + external action is critical
    const hasPasswordField = /<input[^>]*type\s*=\s*["']?password/i.test(ctx.responseBody);
    findings.hasPasswordField = hasPasswordField;

    if (exfiltrating.length > 0 && hasPasswordField) {
        riskValue = 1.0;
    } else if (exfiltrating.length > 0) {
        riskValue = 0.8;
    } else if (hasPasswordField && matches.length > 0) {
        riskValue = 0.2;
    }

    const description = exfiltrating.length > 0
        ? `${exfiltrating.length} form(s) posting data to external domains${hasPasswordField ? ' — PASSWORD FIELD PRESENT' : ''}.`
        : 'No form exfiltration detected.';

    const severity = riskValue >= 0.8 ? 'critical' : riskValue >= 0.5 ? 'high' : riskValue >= 0.2 ? 'low' : 'info';

    return { moduleName: 'FormExfiltration', riskValue, weight: WEIGHT, weightedScore: riskValue * WEIGHT, description, severity, findings };
};
