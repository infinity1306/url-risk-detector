import React from 'react';
import { motion } from 'framer-motion';
import { formatDate } from '../../utils/colors';

interface SSLCardProps {
    ssl: {
        valid: boolean;
        issuer: string;
        expiresAt: string | null;
        protocol: string;
    };
}

const SSLCard: React.FC<SSLCardProps> = ({ ssl }) => {
    return (
        <motion.div
            className="glass-card glow-border p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
        >
            <div className="flex items-center gap-2 mb-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${ssl.valid ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L6 7V12C6 16.5 8.5 20.5 12 22C15.5 20.5 18 16.5 18 12V7L12 2Z"
                            stroke={ssl.valid ? '#22c55e' : '#ef4444'} strokeWidth="2" fill="none" />
                        {ssl.valid ? (
                            <path d="M9 12L11 14L15 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
                        ) : (
                            <path d="M9 9L15 15M15 9L9 15" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
                        )}
                    </svg>
                </div>
                <h3 className="text-sm font-semibold text-cyber-text">SSL Certificate</h3>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between">
                    <span className="text-xs text-cyber-muted">Status</span>
                    <span className={`text-xs font-bold ${ssl.valid ? 'text-green-400' : 'text-red-400'}`}>
                        {ssl.valid ? '✓ Valid' : '✗ Invalid'}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-xs text-cyber-muted">Issuer</span>
                    <span className="text-xs font-mono text-cyber-text">{ssl.issuer || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-xs text-cyber-muted">Protocol</span>
                    <span className="text-xs font-mono text-cyber-text">{ssl.protocol || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-xs text-cyber-muted">Expires</span>
                    <span className="text-xs font-mono text-cyber-text">{formatDate(ssl.expiresAt)}</span>
                </div>
            </div>
        </motion.div>
    );
};

export default SSLCard;
