import React from 'react';
import { motion } from 'framer-motion';
import { ReportData } from '../services/api';
import RiskMeter from '../components/dashboard/RiskMeter';
import ThreatAccordion from '../components/dashboard/ThreatAccordion';
import SSLCard from '../components/dashboard/SSLCard';
import DomainCard from '../components/dashboard/DomainCard';
import RedirectTimeline from '../components/dashboard/RedirectTimeline';
import ThreatBadges from '../components/dashboard/ThreatBadges';
import { getRiskBg } from '../utils/colors';

interface ReportProps {
    report: ReportData;
    onNewScan: () => void;
}

const Report: React.FC<ReportProps> = ({ report, onNewScan }) => {
    const copyLink = () => {
        navigator.clipboard.writeText(window.location.origin + '/report/' + report.scanId);
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Top bar */}
            <motion.div
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div>
                    <button onClick={onNewScan} className="text-xs text-cyber-accent hover:text-cyan-300 mb-2 flex items-center gap-1">
                        ← New Scan
                    </button>
                    <h1 className="text-2xl font-bold text-cyber-text">Threat Analysis Report</h1>
                    <p className="text-sm font-mono text-cyber-muted mt-1 break-all">{report.url}</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={copyLink} className="btn-secondary text-xs py-2 px-4">
                        📋 Copy Link
                    </button>
                    <button onClick={onNewScan} className="btn-primary text-xs py-2 px-4">
                        🔍 New Scan
                    </button>
                </div>
            </motion.div>

            {/* Summary banner */}
            <motion.div
                className={`rounded-xl border p-4 mb-8 ${getRiskBg(report.finalScore)}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <p className="text-sm leading-relaxed">{report.summary}</p>
            </motion.div>

            {/* Threat badges */}
            <div className="mb-6">
                <ThreatBadges indicators={report.indicators} />
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left column — Risk Meter */}
                <div className="lg:col-span-4">
                    <RiskMeter
                        score={report.finalScore}
                        riskLevel={report.riskLevel}
                        confidence={report.confidence}
                    />
                </div>

                {/* Right column — Info Cards */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SSLCard ssl={report.ssl} />
                        <DomainCard domain={report.domain} metadata={report.metadata} />
                    </div>

                    <RedirectTimeline
                        chain={report.metadata.redirectChain}
                        originalUrl={report.url}
                    />
                </div>
            </div>

            {/* Threat Breakdown */}
            <div className="mt-8">
                <ThreatAccordion indicators={report.indicators} />
            </div>

            {/* Scan metadata footer */}
            <motion.div
                className="mt-8 glass-card p-4 flex flex-wrap justify-between gap-4 text-xs text-cyber-muted"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
            >
                <span>Scan ID: <span className="font-mono text-cyber-text">{report.scanId}</span></span>
                <span>Modules: <span className="font-mono text-cyber-text">{report.indicators.length} findings</span></span>
                <span>Duration: <span className="font-mono text-cyber-text">{report.metadata.scanDurationMs}ms</span></span>
                <span>Scanned: <span className="font-mono text-cyber-text">{new Date(report.scannedAt).toLocaleString()}</span></span>
            </motion.div>
        </div>
    );
};

export default Report;
