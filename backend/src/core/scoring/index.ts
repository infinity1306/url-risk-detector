import { ThreatModuleResult } from '../engine/types';

export interface ScoringResult {
    score: number;
    riskLevel: 'Safe' | 'Low' | 'Moderate' | 'High' | 'Critical';
    confidence: number;
    summary: string;
}

/**
 * Risk Scoring Engine
 * Formula: Final Score = min(100, Σ (Factor Weight × Risk Value))
 * Confidence = (successfulModules / totalModules) × 100
 */
export function calculateScore(results: ThreatModuleResult[], totalModules: number): ScoringResult {
    // Sum all weighted scores
    const rawScore = results.reduce((sum, r) => sum + r.weightedScore, 0);

    // Normalize to 0-100 scale
    // Max possible raw score = sum of all weights (assuming all riskValues = 1.0)
    // Weights: 15+15+10+25+8+20+15+10+5+15+20+10+20+10+20+10+25+20+25+5 = 303
    const MAX_RAW_SCORE = 303;
    const normalizedScore = Math.min(100, Math.round((rawScore / MAX_RAW_SCORE) * 100));

    // Determine risk level
    const riskLevel = getRiskLevel(normalizedScore);

    // Calculate confidence based on how many modules successfully ran
    const confidence = Math.round((results.length / totalModules) * 100 * 10) / 10;

    // Generate summary
    const summary = generateSummary(results, normalizedScore, riskLevel);

    return { score: normalizedScore, riskLevel, confidence, summary };
}

function getRiskLevel(score: number): 'Safe' | 'Low' | 'Moderate' | 'High' | 'Critical' {
    if (score <= 20) return 'Safe';
    if (score <= 40) return 'Low';
    if (score <= 60) return 'Moderate';
    if (score <= 80) return 'High';
    return 'Critical';
}

function generateSummary(results: ThreatModuleResult[], score: number, riskLevel: string): string {
    const criticalFindings = results.filter((r) => r.severity === 'critical');
    const highFindings = results.filter((r) => r.severity === 'high');
    const mediumFindings = results.filter((r) => r.severity === 'medium');

    let summary = `Threat Score: ${score}/100 (${riskLevel}). `;

    if (criticalFindings.length > 0) {
        summary += `CRITICAL: ${criticalFindings.map((f) => f.moduleName).join(', ')}. `;
    }

    if (highFindings.length > 0) {
        summary += `High Risk: ${highFindings.map((f) => f.moduleName).join(', ')}. `;
    }

    if (mediumFindings.length > 0) {
        summary += `Moderate Risk: ${mediumFindings.map((f) => f.moduleName).join(', ')}. `;
    }

    if (criticalFindings.length === 0 && highFindings.length === 0 && mediumFindings.length === 0) {
        summary += 'No significant threats detected across all analysis modules.';
    }

    // Add top-3 most impactful findings
    const top3 = results
        .filter((r) => r.riskValue > 0)
        .sort((a, b) => b.weightedScore - a.weightedScore)
        .slice(0, 3);

    if (top3.length > 0) {
        summary += ' Key findings: ' + top3.map((f) => f.description).join(' ');
    }

    return summary;
}
