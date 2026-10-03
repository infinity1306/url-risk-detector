import React from 'react';
import { motion } from 'framer-motion';
import { formatDate } from '../../utils/colors';

interface DomainCardProps {
    domain: {
        hostname: string;
        ageDays: number;
        registrar: string;
        creationDate: string | null;
        country: string;
    };
    metadata: {
        ipAddress: string;
        server: string;
        statusCode: number;
        scanDurationMs: number;
    };
}

const DomainCard: React.FC<DomainCardProps> = ({ domain, metadata }) => {
    return (
        <motion.div
            className="glass-card glow-border p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
        >
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="#7c3aed" strokeWidth="2" />
                        <path d="M2 12H22" stroke="#7c3aed" strokeWidth="1.5" />
                        <path d="M12 2C14.5 4.5 16 8 16 12C16 16 14.5 19.5 12 22C9.5 19.5 8 16 8 12C8 8 9.5 4.5 12 2Z" stroke="#7c3aed" strokeWidth="1.5" />
                    </svg>
                </div>
                <h3 className="text-sm font-semibold text-cyber-text">Domain & Server</h3>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between">
                    <span className="text-xs text-cyber-muted">Hostname</span>
                    <span className="text-xs font-mono text-cyber-accent">{domain.hostname || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-xs text-cyber-muted">Domain Age</span>
                    <span className={`text-xs font-bold ${domain.ageDays < 30 ? 'text-red-400' : domain.ageDays < 180 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {domain.ageDays >= 0 ? `${domain.ageDays} days` : 'Unknown'}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-xs text-cyber-muted">Registrar</span>
                    <span className="text-xs text-cyber-text truncate ml-2 max-w-[140px]">{domain.registrar || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-xs text-cyber-muted">Created</span>
                    <span className="text-xs font-mono text-cyber-text">{formatDate(domain.creationDate)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-xs text-cyber-muted">IP Address</span>
                    <span className="text-xs font-mono text-cyber-text">{metadata.ipAddress || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-xs text-cyber-muted">Server</span>
                    <span className="text-xs font-mono text-cyber-text">{metadata.server || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-xs text-cyber-muted">Status Code</span>
                    <span className={`text-xs font-bold ${metadata.statusCode === 200 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {metadata.statusCode || 'N/A'}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-xs text-cyber-muted">Scan Time</span>
                    <span className="text-xs font-mono text-cyber-text">{metadata.scanDurationMs}ms</span>
                </div>
            </div>
        </motion.div>
    );
};

export default DomainCard;
