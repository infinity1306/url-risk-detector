import { ThreatModule, ScanContext, ThreatModuleResult } from '../types';

/**
 * Module 15: Hidden iFrame Detection
 * Weight: 20
 * Logic: Zero-dimension or hidden iframes used for drive-by downloads.
 * Algorithm: Parse DOM for iframes with suspicious attributes.
 */
export const hiddenIframe: ThreatModule = async (ctx: ScanContext): Promise<ThreatModuleResult> => {
    const WEIGHT = 20;
    let riskValue = 0;
    const findings: Record<string, any> = { hiddenIframes: [], totalIframes: 0 };

    if (!ctx.responseBody) {
        return {
            moduleName: 'HiddenIframe', riskValue: 0, weight: WEIGHT, weightedScore: 0,
            description: 'No response body available for iframe analysis.', severity: 'info', findings: { reason: 'no_body' },
        };
    }

    const body = ctx.responseBody;

    // Extract all iframe tags
    const iframeRegex = /<iframe[^>]*>/gi;
    const iframes = body.match(iframeRegex) || [];
    findings.totalIframes = iframes.length;

    const hiddenIframes: string[] = [];
    for (const iframe of iframes) {
        const iframeLower = iframe.toLowerCase();
        const isHidden =
            /width\s*[:=]\s*["']?0/i.test(iframe) ||
            /height\s*[:=]\s*["']?0/i.test(iframe) ||
            /display\s*:\s*none/i.test(iframe) ||
            /visibility\s*:\s*hidden/i.test(iframe) ||
            /position\s*:\s*absolute.*?left\s*:\s*-\d+/i.test(iframe) ||
            iframeLower.includes('hidden');

        if (isHidden) {
            hiddenIframes.push(iframe.substring(0, 200));
        }
    }

    findings.hiddenIframes = hiddenIframes;
    findings.hiddenCount = hiddenIframes.length;

    if (hiddenIframes.length >= 3) {
        riskValue = 1.0;
    } else if (hiddenIframes.length >= 1) {
        riskValue = 0.9;
    } else if (iframes.length > 5) {
        riskValue = 0.3;
    } else {
        riskValue = 0;
    }

    const description = hiddenIframes.length > 0
        ? `${hiddenIframes.length} hidden iframe(s) detected — potential drive-by download or clickjacking.`
        : iframes.length > 0
            ? `${iframes.length} iframe(s) found, none hidden.`
            : 'No iframes detected.';

    const severity = riskValue >= 0.8 ? 'critical' : riskValue >= 0.3 ? 'medium' : 'info';

    return { moduleName: 'HiddenIframe', riskValue, weight: WEIGHT, weightedScore: riskValue * WEIGHT, description, severity, findings };
};
