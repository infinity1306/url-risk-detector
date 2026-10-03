import React from 'react';
import { motion } from 'framer-motion';

interface RedirectTimelineProps {
    chain: string[];
    originalUrl: string;
}

const RedirectTimeline: React.FC<RedirectTimelineProps> = ({ chain, originalUrl }) => {
    if (chain.length === 0) {
        return (
            <motion.div
                className="glass-card p-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
            >
                <h3 className="text-sm font-semibold text-cyber-muted uppercase tracking-wider mb-3">Redirect Chain</h3>
                <p className="text-xs text-cyber-green">✓ No redirects — direct connection</p>
            </motion.div>
        );
    }

    const allUrls = [originalUrl, ...chain];

    return (
        <motion.div
            className="glass-card glow-border p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
        >
            <h3 className="text-sm font-semibold text-cyber-muted uppercase tracking-wider mb-4">
                Redirect Chain ({chain.length} hop{chain.length !== 1 ? 's' : ''})
            </h3>

            <div className="relative pl-6">
                {allUrls.map((url, idx) => (
                    <motion.div
                        key={idx}
                        className="relative pb-4 last:pb-0"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + idx * 0.1 }}
                    >
                        {/* Vertical line */}
                        {idx < allUrls.length - 1 && (
                            <div className="absolute left-[-14px] top-3 w-[2px] h-full bg-gradient-to-b from-cyber-accent/50 to-cyber-accent2/50" />
                        )}

                        {/* Node */}
                        <div className={`absolute left-[-18px] top-1 w-3 h-3 rounded-full border-2 ${idx === 0
                                ? 'bg-cyber-accent border-cyber-accent'
                                : idx === allUrls.length - 1
                                    ? 'bg-cyber-accent2 border-cyber-accent2'
                                    : 'bg-transparent border-cyber-muted'
                            }`} />

                        <div className="bg-cyber-bg/50 rounded-lg p-2.5">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] text-cyber-muted">
                                    {idx === 0 ? 'ORIGIN' : idx === allUrls.length - 1 ? 'FINAL' : `HOP ${idx}`}
                                </span>
                                {url.startsWith('http://') && (
                                    <span className="text-[9px] px-1 py-0.5 bg-red-500/20 text-red-400 rounded">INSECURE</span>
                                )}
                            </div>
                            <p className="text-xs font-mono text-cyber-text break-all">{url}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default RedirectTimeline;
