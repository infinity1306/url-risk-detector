import { Request, Response, NextFunction } from 'express';
import { runScan } from '../../services/scanService';
import { logger } from '../../utils/logger';
import { randomUUID } from 'crypto';

// In-Memory Fallback Store (since MongoDB isn't configured in Vercel yet)
export const mockDB = new Map<string, any>();
export const mockIndicators = new Map<string, any[]>();

/**
 * POST /api/analyze
 * Submit a URL for threat analysis
 */
export const analyzeUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { url } = req.body;

        // Normalize URL
        let normalizedUrl = url.trim();
        if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
            normalizedUrl = 'https://' + normalizedUrl;
        }

        const scanId = randomUUID();
        
        // Create mock scan record
        const scan = {
            _id: scanId,
            url: normalizedUrl,
            normalizedUrl,
            status: 'PENDING',
            createdAt: new Date(),
        };
        mockDB.set(scanId, scan);

        // Run scan synchronously to bypass Vercel serverless state issues
        // Wrapped with a 9-second global timeout to stay under Vercel's 10s limit
        await Promise.race([
            runScan(scanId, normalizedUrl),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Analysis Timeout: The scan exceeded 9 seconds. Try again or check the URL stability.')), 9000)
            )
        ]);

        // Fetch completed results
        const completedScan = mockDB.get(scanId);
        const indicators = mockIndicators.get(scanId) || [];
        indicators.sort((a, b) => b.weightedScore - a.weightedScore);

        if (!completedScan || completedScan.status === 'FAILED') {
            res.status(500).json({
                success: false,
                error: completedScan?.summary || 'Scan failed to complete successfully.',
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: {
                ...completedScan,
                scanId: completedScan._id,
                indicators: indicators.map((ind) => ({
                    module: ind.moduleName,
                    riskValue: ind.riskValue,
                    weightApplied: ind.weightApplied,
                    weightedScore: ind.weightedScore,
                    description: ind.description,
                    severity: ind.severity,
                    findings: ind.findings,
                })),
                scannedAt: completedScan.createdAt,
            },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/report/:id
 * Get scan results
 */
export const getReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        const scan = mockDB.get(id as string);
        if (!scan) {
            res.status(404).json({ success: false, error: 'Scan not found' });
            return;
        }

        // If scan is still processing, return status
        if (scan.status === 'PENDING' || scan.status === 'PROCESSING') {
            res.json({
                success: true,
                data: {
                    scanId: scan._id,
                    url: scan.url,
                    status: scan.status,
                    message: 'Scan is still in progress. Please wait and retry.',
                },
            });
            return;
        }

        // Fetch indicators
        const indicators = mockIndicators.get(id as string) || [];
        indicators.sort((a, b) => b.weightedScore - a.weightedScore);

        res.json({
            success: true,
            data: {
                ...scan,
                scanId: scan._id,
                indicators: indicators.map((ind) => ({
                    module: ind.moduleName,
                    riskValue: ind.riskValue,
                    weightApplied: ind.weightApplied,
                    weightedScore: ind.weightedScore,
                    description: ind.description,
                    severity: ind.severity,
                    findings: ind.findings,
                })),
                scannedAt: scan.createdAt,
            },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/stats
 * Platform statistics
 */
export const getStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const scans = Array.from(mockDB.values());
        const totalScans = scans.length;
        const completedScans = scans.filter(s => s.status === 'COMPLETED');
        
        const criticalThreats = completedScans.filter(s => s.riskLevel === 'Critical').length;
        const highThreats = completedScans.filter(s => s.riskLevel === 'High').length;

        const totalScore = completedScans.reduce((acc, s) => acc + (s.finalScore || 0), 0);
        const avgScore = completedScans.length > 0 ? Math.round(totalScore / completedScans.length) : 0;

        const recentScans = completedScans
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 10)
            .map(s => ({ url: s.url, finalScore: s.finalScore, riskLevel: s.riskLevel, createdAt: s.createdAt }));

        const distribution: Record<string, number> = {};
        for (const s of completedScans) {
            const level = s.riskLevel || 'Safe';
            distribution[level] = (distribution[level] || 0) + 1;
        }

        res.json({
            success: true,
            data: {
                totalScans,
                completedScans: completedScans.length,
                criticalThreats,
                highThreats,
                averageScore: avgScore,
                riskDistribution: distribution,
                recentScans,
            },
        });
    } catch (err) {
        next(err);
    }
};
