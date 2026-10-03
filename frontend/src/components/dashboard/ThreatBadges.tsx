import React from 'react';
import { motion } from 'framer-motion';
import { Indicator } from '../../services/api';
import { getSeverityColor } from '../../utils/colors';

interface ThreatBadgesProps {
    indicators: Indicator[];
}

const ThreatBadges: React.FC<ThreatBadgesProps> = ({ indicators }) => {
    const flagged = indicators.filter((i) => i.riskValue > 0);

    if (flagged.length === 0) return null;

    return (
        <motion.div
            className="flex flex-wrap gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
        >
            {flagged.map((indicator, idx) => (
                <motion.span
                    key={idx}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getSeverityColor(indicator.severity)}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + idx * 0.05 }}
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {indicator.module}
                </motion.span>
            ))}
        </motion.div>
    );
};

export default ThreatBadges;
