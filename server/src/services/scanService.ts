import { ThreatModuleResult, ThreatModule } from '../core/engine/types';
import { buildScanContext } from '../core/sandbox/index';
import { calculateScore } from '../core/scoring/index';
import { cacheGet, cacheSet } from '../config/redis';
import { logger } from '../utils/logger';
import * as modules from '../core/engine/modules/index';
import { mockDB, mockIndicators } from '../api/controllers/scan.controller';
import { randomUUID } from 'crypto';

// Register all 20 threat modules
const THREAT_MODULES: ThreatModule[] = [
    modules.domainAge,
    modules.sslCertificate,
    modules.dnsConsistency,
    modules.ipReputation,
    modules.suspiciousTld,
    modules.punycodeHomograph,
    modules.typosquatting,
    modules.urlEntropy,
    modules.urlLength,
    modules.phishingKeywords,
    modules.scamPhrases,
    modules.obfuscatedUrl,
    modules.encodedPayload,
    modules.redirectChain,
    modules.hiddenIframe,
    modules.metaRefresh,
    modules.suspiciousExtension,
    modules.paramInjection,
    modules.formExfiltration,
    modules.mixedContent,
];

export async function runScan(scanId: string, url: string): Promise<void> {
    const startTime = Date.now();
    logger.info(`Starting scan for: ${url} (scanId: ${scanId})`);

    try {
        const scanRecord = mockDB.get(scanId);
        if (!scanRecord) throw new Error('Scan record not found in mock store');

        // Update status to PROCESSING
        scanRecord.status = 'PROCESSING';

        // Check cache first
        const cacheKey = `scan:${Buffer.from(url).toString('base64')}`;
        const cached = await cacheGet(cacheKey);
        if (cached) {
            const cachedResult = JSON.parse(cached);
            
            // Restore indicators
            mockIndicators.set(scanId, cachedResult.indicators || []);

            Object.assign(scanRecord, {
                status: 'COMPLETED',
                finalScore: cachedResult.score,
                riskLevel: cachedResult.riskLevel,
                confidence: cachedResult.confidence,
                summary: cachedResult.summary + ' [Cached result]',
                metadata: { ...cachedResult.metadata, scanDurationMs: Date.now() - startTime },
                ssl: cachedResult.ssl,
                domain: cachedResult.domain,
                indicators: (cachedResult.indicators || []).map((i: any) => i._id),
            });
            
            logger.info(`Scan completed from cache for: ${url}`);
            return;
        }

        // Build scan context (SSRF-safe HTTP crawl, SSL check, WHOIS)
        const ctx = await buildScanContext(url);

        // Run all threat modules concurrently
        const results: ThreatModuleResult[] = [];
        const modulePromises = THREAT_MODULES.map(async (mod) => {
            try {
                const result = await mod(ctx);
                return result;
            } catch (err: any) {
                logger.warn(`Module failed: ${err.message}`);
                return null;
            }
        });

        const moduleResults = await Promise.allSettled(modulePromises);
        for (const r of moduleResults) {
            if (r.status === 'fulfilled' && r.value) {
                results.push(r.value);
            }
        }

        // Calculate final score
        const scoring = calculateScore(results, THREAT_MODULES.length);

        // Save threat indicators
        const indicators = [];
        for (const result of results) {
            if (result.riskValue > 0) {
                indicators.push({
                    _id: randomUUID(),
                    scanId,
                    moduleName: result.moduleName,
                    riskValue: result.riskValue,
                    weightApplied: result.weight,
                    weightedScore: result.weightedScore,
                    findings: result.findings,
                    description: result.description,
                    severity: result.severity,
                });
            }
        }
        mockIndicators.set(scanId, indicators);

        // Update scan record
        Object.assign(scanRecord, {
            status: 'COMPLETED',
            finalScore: scoring.score,
            riskLevel: scoring.riskLevel,
            confidence: scoring.confidence,
            summary: scoring.summary,
            indicators: indicators.map(i => i._id),
            metadata: {
                scanDurationMs: Date.now() - startTime,
                ipAddress: ctx.resolvedIP,
                redirectChain: ctx.redirectChain,
                server: ctx.responseHeaders['server'] || '',
                contentType: ctx.responseHeaders['content-type'] || '',
                statusCode: ctx.statusCode,
            },
            ssl: {
                valid: ctx.sslInfo.valid,
                issuer: ctx.sslInfo.issuer,
                expiresAt: ctx.sslInfo.expiresAt,
                protocol: ctx.sslInfo.protocol,
            },
            domain: {
                hostname: ctx.hostname,
                ageDays: ctx.whoisData.creationDate
                    ? Math.floor((Date.now() - new Date(ctx.whoisData.creationDate).getTime()) / (1000 * 60 * 60 * 24))
                    : -1,
                registrar: ctx.whoisData.registrar,
                creationDate: ctx.whoisData.creationDate,
                country: ctx.whoisData.country,
            }
        });

        // Cache result for 1 hour
        const cachePayload = {
            score: scoring.score,
            riskLevel: scoring.riskLevel,
            confidence: scoring.confidence,
            summary: scoring.summary,
            ssl: scanRecord.ssl,
            domain: scanRecord.domain,
            metadata: scanRecord.metadata,
            indicators: indicators,
        };
        await cacheSet(cacheKey, JSON.stringify(cachePayload), 3600);

        logger.info(`Scan completed: ${url} — Score: ${scoring.score} (${scoring.riskLevel})`);
    } catch (err: any) {
        logger.error(`Scan failed for ${url}: ${err.message}`);
        
        const scanRecord = mockDB.get(scanId);
        if (scanRecord) {
            Object.assign(scanRecord, {
                status: 'FAILED',
                summary: `Scan failed: ${err.message}`,
                metadata: { scanDurationMs: Date.now() - startTime }
            });
        }
    }
}
