import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { submitScan, getReport, ReportData } from '../services/api';

interface HomePageProps {
    onReportReady: (report: ReportData) => void;
}

const Home: React.FC<HomePageProps> = ({ onReportReady }) => {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault();
        let targetUrl = url.trim();
        if (!targetUrl) return;

        // Auto-append .com if there is no domain extension (no dot) and it's not a local IP
        if (!targetUrl.includes('.') && targetUrl !== 'localhost') {
            targetUrl = `${targetUrl}.com`;
        }

        // Auto-prepend https:// if the user just entered a domain
        if (!/^https?:\/\//i.test(targetUrl)) {
            targetUrl = `https://${targetUrl}`;
        }

        setLoading(true);
        setError('');
        setStatus('Submitting scan...');

        try {
            const scanRes = await submitScan(targetUrl);
            
            if (scanRes.data && scanRes.data.status === 'COMPLETED') {
                setLoading(false);
                onReportReady(scanRes.data);
            } else {
                setLoading(false);
                setError(scanRes.message || 'Scan failed to complete or return valid data.');
            }
        } catch (err: any) {
            setLoading(false);
            const actualError = err.response?.data?.error || err.message || 'Unknown network error';
            setError(`System Error: ${actualError}`);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-6 scan-grid">
            {/* Hero */}
            <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <motion.div
                    className="inline-block mb-6"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyber-accent to-cyber-accent2 flex items-center justify-center shadow-cyber-lg">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L3 7V12C3 17.55 6.84 22.74 12 24C17.16 22.74 21 17.55 21 12V7L12 2Z" fill="#0a0e17" />
                            <circle cx="12" cy="11" r="3" stroke="#0a0e17" strokeWidth="2" />
                            <path d="M12 14V17" stroke="#0a0e17" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                </motion.div>

                <h1 className="text-5xl md:text-6xl font-black mb-4">
                    <span className="text-gradient">ThreatLens</span>
                </h1>
                <p className="text-lg text-cyber-muted max-w-xl mx-auto">
                    Advanced URL Threat Intelligence powered by <span className="text-cyber-accent font-semibold">20 detection modules</span>.
                    Analyze any URL for phishing, malware, and cybersecurity threats in seconds.
                </p>
            </motion.div>

            {/* Scan Input */}
            <motion.form
                className="w-full max-w-2xl"
                onSubmit={handleScan}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
            >
                <div className="glass-card glow-border p-2 flex items-center gap-2">
                    <div className="flex-1 relative">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyber-muted" viewBox="0 0 24 24" fill="none">
                            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                            <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Enter site to analyze (e.g., example)"
                            className="w-full bg-transparent text-cyber-text pl-12 pr-4 py-4 text-sm font-mono outline-none placeholder-cyber-muted/50"
                            disabled={loading}
                            id="url-input"
                        />
                    </div>
                    <button
                        type="submit"
                        onClick={handleScan}
                        disabled={loading || !url.trim()}
                        className="btn-primary whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                        id="scan-btn"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.42" strokeDashoffset="10" />
                                </svg>
                                Scanning...
                            </span>
                        ) : (
                            'Analyze URL'
                        )}
                    </button>
                </div>
            </motion.form>

            {/* Status */}
            {loading && (
                <motion.div
                    className="mt-6 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <div className="w-2 h-2 rounded-full bg-cyber-accent animate-ping" />
                        <p className="text-sm text-cyber-accent font-mono">{status}</p>
                    </div>

                    {/* Animated scan bars */}
                    <div className="flex justify-center gap-1 mt-4">
                        {Array.from({ length: 20 }).map((_, i) => (
                            <motion.div
                                key={i}
                                className="w-1.5 bg-gradient-to-t from-cyber-accent to-cyber-accent2 rounded-full"
                                animate={{ height: [8, 24, 8] }}
                                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.05 }}
                            />
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Error */}
            {error && (
                <motion.div
                    className="mt-6 glass-card border-red-500/30 p-4 max-w-lg"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <p className="text-red-400 text-sm flex items-center gap-2">
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" />
                        </svg>
                        {error}
                    </p>
                </motion.div>
            )}

            {/* Feature grid */}
            <motion.div
                className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                {[
                    { icon: '🛡️', title: '20 Threat Modules', desc: 'Comprehensive analysis across phishing, malware, and injection vectors' },
                    { icon: '⚡', title: 'Real-time Scoring', desc: 'Weighted risk aggregation with confidence-based assessment' },
                    { icon: '🔍', title: 'Deep Inspection', desc: 'SSL, DNS, WHOIS, DOM parsing, redirect tracking & more' },
                ].map((f, i) => (
                    <div key={i} className="glass-card p-4 text-center hover:border-cyber-accent/30 transition-colors">
                        <span className="text-2xl">{f.icon}</span>
                        <h3 className="text-sm font-bold text-cyber-text mt-2">{f.title}</h3>
                        <p className="text-xs text-cyber-muted mt-1">{f.desc}</p>
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

export default Home;
