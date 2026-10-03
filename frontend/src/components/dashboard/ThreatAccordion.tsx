import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Indicator } from '../../services/api';
import { getSeverityColor } from '../../utils/colors';

interface ThreatAccordionProps {
    indicators: Indicator[];
}

const ThreatAccordion: React.FC<ThreatAccordionProps> = ({ indicators }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    if (indicators.length === 0) {
        return (
            <div className="glass-card p-6 text-center">
                <p className="text-cyber-green text-lg font-semibold">✓ No Threats Detected</p>
                <p className="text-cyber-muted text-sm mt-1">All 20 modules passed without significant findings.</p>
            </div>
        );
    }

    return (
        <motion.div
            className="glass-card glow-border overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
        >
            <div className="p-4 border-b border-cyber-border">
                <h3 className="text-sm font-semibold text-cyber-muted uppercase tracking-wider">
                    Threat Breakdown ({indicators.length} findings)
                </h3>
            </div>

            <div className="divide-y divide-cyber-border">
                {indicators.map((indicator, idx) => (
                    <div key={idx}>
                        <button
                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${getSeverityColor(indicator.severity)}`}>
                                    {indicator.severity}
                                </span>
                                <span className="text-sm font-medium text-cyber-text">{indicator.module}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <span className="text-xs text-cyber-muted">Score: </span>
                                    <span className="text-sm font-mono font-bold text-cyber-text">
                                        {indicator.weightedScore.toFixed(1)}
                                    </span>
                                </div>
                                <motion.svg
                                    width="16" height="16" viewBox="0 0 16 16"
                                    className="text-cyber-muted"
                                    animate={{ rotate: openIndex === idx ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                                </motion.svg>
                            </div>
                        </button>

                        <AnimatePresence>
                            {openIndex === idx && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-4 pb-4 pt-1">
                                        <p className="text-sm text-cyber-muted mb-3">{indicator.description}</p>
                                        <div className="grid grid-cols-3 gap-3 mb-3">
                                            <div className="bg-cyber-bg/50 rounded-lg p-2 text-center">
                                                <p className="text-[10px] text-cyber-muted">Risk Value</p>
                                                <p className="text-sm font-mono font-bold">{indicator.riskValue.toFixed(2)}</p>
                                            </div>
                                            <div className="bg-cyber-bg/50 rounded-lg p-2 text-center">
                                                <p className="text-[10px] text-cyber-muted">Weight</p>
                                                <p className="text-sm font-mono font-bold">{indicator.weightApplied}</p>
                                            </div>
                                            <div className="bg-cyber-bg/50 rounded-lg p-2 text-center">
                                                <p className="text-[10px] text-cyber-muted">Impact</p>
                                                <p className="text-sm font-mono font-bold">{indicator.weightedScore.toFixed(1)}</p>
                                            </div>
                                        </div>
                                        {Object.keys(indicator.findings).length > 0 && (
                                            <details className="mt-2">
                                                <summary className="text-xs text-cyber-accent cursor-pointer hover:text-cyan-300">
                                                    Technical Details
                                                </summary>
                                                <pre className="mt-2 p-3 bg-cyber-bg rounded-lg text-xs text-cyber-muted font-mono overflow-x-auto">
                                                    {JSON.stringify(indicator.findings, null, 2)}
                                                </pre>
                                            </details>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default ThreatAccordion;
