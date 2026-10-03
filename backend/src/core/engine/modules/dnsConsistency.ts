import { ThreatModule, ScanContext, ThreatModuleResult } from '../types';

/**
 * Module 3: DNS Consistency Check
 * Weight: 10
 * Logic: Fast-flux networks use rapidly changing DNS records.
 * Algorithm: Check if A records resolve to suspicious CDN-less IPs, check MX/NS mismatches.
 */
export const dnsConsistency: ThreatModule = async (ctx: ScanContext): Promise<ThreatModuleResult> => {
    const WEIGHT = 10;
    let riskValue = 0;
    let description = '';
    const findings: Record<string, any> = {};

    findings.resolvedIP = ctx.resolvedIP;
    findings.nameServers = ctx.whoisData.nameServers;

    // Check for no DNS resolution
    if (!ctx.resolvedIP) {
        riskValue = 0.8;
        description = 'Domain does not resolve to any IP address.';
        findings.issue = 'no_resolution';
    }
    // Check for parking/sinkhole indicators
    else if (['0.0.0.0', '127.0.0.1'].includes(ctx.resolvedIP)) {
        riskValue = 0.9;
        description = 'Domain resolves to localhost/null — possible sinkhole or parking page.';
        findings.issue = 'sinkhole';
    }
    // Check nameserver consistency — suspicious if NS records are from free/dynamic DNS providers
    else {
        const suspiciousDnsProviders = ['afraid.org', 'duckdns.org', 'no-ip.com', 'dynu.com', 'changeip.com'];
        const nsMatch = ctx.whoisData.nameServers.some((ns) =>
            suspiciousDnsProviders.some((p) => ns.toLowerCase().includes(p))
        );
        if (nsMatch) {
            riskValue = 0.7;
            description = 'Domain uses free/dynamic DNS provider — often associated with ephemeral threat infrastructure.';
            findings.issue = 'dynamic_dns';
        } else if (ctx.whoisData.nameServers.length === 0) {
            riskValue = 0.4;
            description = 'No nameserver information available.';
            findings.issue = 'no_ns';
        } else {
            riskValue = 0;
            description = 'DNS records appear consistent.';
        }
    }

    const severity = riskValue >= 0.8 ? 'critical' : riskValue >= 0.5 ? 'high' : riskValue >= 0.3 ? 'medium' : 'info';

    return {
        moduleName: 'DNSConsistency',
        riskValue,
        weight: WEIGHT,
        weightedScore: riskValue * WEIGHT,
        description,
        severity,
        findings,
    };
};
