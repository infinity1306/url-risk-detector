import { ThreatModule, ScanContext, ThreatModuleResult } from '../types';

/**
 * Module 17: Suspicious File Extension Detection
 * Weight: 25
 * Logic: URLs pointing to executable or dangerous file types.
 */
const DANGEROUS_EXTENSIONS = new Set([
    '.exe', '.scr', '.bat', '.cmd', '.com', '.pif', '.msi', '.msp',
    '.dll', '.vbs', '.vbe', '.js', '.jse', '.wsf', '.wsh', '.ps1',
    '.hta', '.cpl', '.inf', '.reg', '.rgs', '.sct',
]);

const SUSPICIOUS_EXTENSIONS = new Set([
    '.apk', '.jar', '.iso', '.img', '.dmg', '.deb', '.rpm',
    '.cab', '.zip', '.rar', '.7z', '.tar', '.gz',
    '.docm', '.xlsm', '.pptm', '.dotm',
]);

export const suspiciousExtension: ThreatModule = async (ctx: ScanContext): Promise<ThreatModuleResult> => {
    const WEIGHT = 25;
    let riskValue = 0;
    const findings: Record<string, any> = {};

    const urlPath = ctx.parsedUrl.pathname.toLowerCase();
    const lastSegment = urlPath.split('/').pop() || '';
    const extMatch = lastSegment.match(/\.[a-z0-9]{1,10}$/);
    const extension = extMatch ? extMatch[0] : '';

    findings.detectedExtension = extension;
    findings.path = urlPath;

    if (DANGEROUS_EXTENSIONS.has(extension)) {
        riskValue = 1.0;
        findings.category = 'dangerous';
    } else if (SUSPICIOUS_EXTENSIONS.has(extension)) {
        riskValue = 0.6;
        findings.category = 'suspicious';
    } else {
        riskValue = 0;
        findings.category = 'clean';
    }

    // Also check Content-Disposition header
    const contentDisposition = ctx.responseHeaders['content-disposition'] || '';
    if (contentDisposition.includes('attachment')) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i);
        if (filenameMatch) {
            const filename = filenameMatch[1].replace(/['"]/g, '').toLowerCase();
            findings.downloadFilename = filename;
            const dlExt = filename.match(/\.[a-z0-9]{1,10}$/);
            if (dlExt && DANGEROUS_EXTENSIONS.has(dlExt[0])) {
                riskValue = Math.max(riskValue, 1.0);
                findings.category = 'dangerous_download';
            }
        }
    }

    const description = riskValue > 0
        ? `Suspicious file extension "${extension || findings.downloadFilename}" detected — ${findings.category} category.`
        : 'No suspicious file extensions detected.';

    const severity = riskValue >= 0.8 ? 'critical' : riskValue >= 0.5 ? 'high' : 'info';

    return { moduleName: 'SuspiciousExtension', riskValue, weight: WEIGHT, weightedScore: riskValue * WEIGHT, description, severity, findings };
};
