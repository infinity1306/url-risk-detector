import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getRiskColor } from '../../utils/colors';

interface RiskMeterProps {
    score: number;
    riskLevel: string;
    confidence: number;
}

const RiskMeter: React.FC<RiskMeterProps> = ({ score, riskLevel, confidence }) => {
    const [animatedScore, setAnimatedScore] = useState(0);
    const color = getRiskColor(score);
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const progress = (animatedScore / 100) * circumference;

    useEffect(() => {
        const timer = setTimeout(() => setAnimatedScore(score), 300);
        return () => clearTimeout(timer);
    }, [score]);

    return (
        <motion.div
            className="glass-card glow-border p-8 flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: 'spring' }}
        >
            <h2 className="text-sm font-semibold text-cyber-muted uppercase tracking-wider mb-6">Threat Score</h2>

            <div className="relative w-72 h-72">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 280 280">
                    {/* Background ring */}
                    <circle
                        cx="140" cy="140" r={radius}
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth="12"
                    />
                    {/* Animated score ring */}
                    <motion.circle
                        cx="140" cy="140" r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: circumference - progress }}
                        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                        style={{ filter: `drop-shadow(0 0 10px ${color}80)` }}
                    />
                    {/* Glow ring */}
                    <motion.circle
                        cx="140" cy="140" r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: circumference - progress }}
                        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                        opacity="0.3"
                        style={{ filter: `blur(4px)` }}
                    />
                </svg>

                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                        className="text-6xl font-black font-mono"
                        style={{ color }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        {animatedScore}
                    </motion.span>
                    <motion.span
                        className="text-lg font-bold mt-1"
                        style={{ color }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                    >
                        {riskLevel}
                    </motion.span>
                    <motion.span
                        className="text-xs text-cyber-muted mt-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 }}
                    >
                        {confidence}% Confidence
                    </motion.span>
                </div>
            </div>

            {/* Risk scale */}
            <div className="w-full mt-6">
                <div className="flex justify-between text-[10px] text-cyber-muted mb-1">
                    <span>SAFE</span><span>LOW</span><span>MODERATE</span><span>HIGH</span><span>CRITICAL</span>
                </div>
                <div className="h-2 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 via-orange-500 to-red-600 relative">
                    <motion.div
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 shadow-lg"
                        style={{ borderColor: color }}
                        initial={{ left: '0%' }}
                        animate={{ left: `${Math.min(score, 100)}%` }}
                        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                    />
                </div>
            </div>
        </motion.div>
    );
};

export default RiskMeter;
