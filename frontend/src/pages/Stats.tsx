import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getStats, StatsData } from '../services/api';

const Stats: React.FC = () => {
    const [stats, setStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await getStats();
                if (res.success && res.data) {
                    setStats(res.data);
                } else {
                    setError('Failed to load statistics.');
                }
            } catch (err: any) {
                setError(err.message || 'An error occurred while fetching statistics.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 rounded-full border-t-2 border-r-2 border-cyber-accent animate-spin" />
                <p className="mt-4 text-cyber-muted tracking-widest text-sm uppercase">Loading Statistics...</p>
            </main>
        );
    }

    if (error || !stats) {
        return (
            <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-[60vh]">
                <div className="text-cyber-red p-4 bg-cyber-red/10 border border-cyber-red/20 rounded-xl max-w-md text-center">
                    <p>{error || 'No stats available'}</p>
                </div>
            </main>
        );
    }

    const StatCard = ({ title, value, colorClass }: { title: string, value: string | number, colorClass: string }) => (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-cyber-card border border-cyber-border shadow-lg relative overflow-hidden group"
        >
            <div className={`absolute -right-10 -bottom-10 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity ${colorClass.replace('text-', 'bg-')}`} />
            <h3 className="text-cyber-muted text-sm font-medium uppercase tracking-wider mb-2">{title}</h3>
            <p className={`text-4xl font-black ${colorClass}`}>{value}</p>
        </motion.div>
    );

    return (
        <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10"
            >
                <h2 className="text-3xl font-bold text-white mb-2">Global Threat Intelligence</h2>
                <p className="text-cyber-muted max-w-2xl">Aggregate platform statistics from all analyzed URLs.</p>
            </motion.div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard title="Total Scans" value={stats.totalScans} colorClass="text-cyber-accent" />
                <StatCard title="Completed" value={stats.completedScans} colorClass="text-cyber-green" />
                <StatCard title="Critical Threats" value={stats.criticalThreats} colorClass="text-cyber-red" />
                <StatCard title="Avg Risk Score" value={stats.averageScore} colorClass="text-cyber-yellow" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Risk Distribution Chart/List */}
                <div className="lg:col-span-1 p-6 rounded-2xl bg-cyber-card border border-cyber-border">
                    <h3 className="text-lg font-bold text-white mb-6">Risk Distribution</h3>
                    <div className="space-y-4">
                        {Object.entries(stats.riskDistribution).map(([level, count], index) => {
                            let barColor = 'bg-cyber-muted';
                            if (level === 'Safe') barColor = 'bg-cyber-green';
                            else if (level === 'Low') barColor = 'bg-cyber-accent2';
                            else if (level === 'Moderate') barColor = 'bg-cyber-yellow';
                            else if (level === 'High') barColor = 'bg-orange-500';
                            else if (level === 'Critical') barColor = 'bg-cyber-red';

                            const percentage = stats.completedScans > 0 ? (count / stats.completedScans) * 100 : 0;

                            return (
                                <div key={level}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-cyber-text">{level}</span>
                                        <span className="text-cyber-muted font-mono">{count}</span>
                                    </div>
                                    <div className="w-full h-2 bg-cyber-bg rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ duration: 1, delay: index * 0.1 }}
                                            className={`h-full rounded-full ${barColor}`}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        {Object.keys(stats.riskDistribution).length === 0 && (
                            <p className="text-cyber-muted text-sm">No completed scans yet.</p>
                        )}
                    </div>
                </div>

                {/* Recent Scans */}
                <div className="lg:col-span-2 p-6 rounded-2xl bg-cyber-card border border-cyber-border relative overflow-hidden">
                    <h3 className="text-lg font-bold text-white mb-6">Recent Scans</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="py-3 px-4 text-xs font-medium text-cyber-muted uppercase tracking-wider border-b border-cyber-border/50">URL</th>
                                    <th className="py-3 px-4 text-xs font-medium text-cyber-muted uppercase tracking-wider border-b border-cyber-border/50">Score</th>
                                    <th className="py-3 px-4 text-xs font-medium text-cyber-muted uppercase tracking-wider border-b border-cyber-border/50">Risk</th>
                                    <th className="py-3 px-4 text-xs font-medium text-cyber-muted uppercase tracking-wider border-b border-cyber-border/50 text-right">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentScans.map((scan, i) => (
                                    <motion.tr 
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="border-b border-cyber-border/30 hover:bg-cyber-bg/50 transition-colors"
                                    >
                                        <td className="py-3 px-4 text-sm text-cyber-text truncate max-w-[200px]" title={scan.url}>
                                            {scan.url}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-xs font-mono px-2 py-1 rounded bg-black/20 text-white border border-cyber-border/50">
                                                {scan.finalScore}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            {scan.riskLevel === 'Safe' && <span className="text-cyber-green text-xs font-medium">Safe</span>}
                                            {scan.riskLevel === 'Low' && <span className="text-cyber-accent2 text-xs font-medium">Low</span>}
                                            {scan.riskLevel === 'Moderate' && <span className="text-cyber-yellow text-xs font-medium">Moderate</span>}
                                            {scan.riskLevel === 'High' && <span className="text-orange-500 text-xs font-medium">High</span>}
                                            {scan.riskLevel === 'Critical' && <span className="text-cyber-red text-xs font-medium">Critical</span>}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-cyber-muted text-right">
                                            {new Date(scan.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                    </motion.tr>
                                ))}
                                {stats.recentScans.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-cyber-muted">No recent scans found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Stats;
