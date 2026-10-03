import React from 'react';
import { motion } from 'framer-motion';

interface HeaderProps {
    onNavigateHome: () => void;
    onNavigateStats: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigateHome, onNavigateStats }) => {
    return (
        <header className="border-b border-cyber-border bg-cyber-bg/90 backdrop-blur-xl sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <motion.div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => onNavigateHome()}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Logo */}
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyber-accent to-cyber-accent2 flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L3 7V12C3 17.55 6.84 22.74 12 24C17.16 22.74 21 17.55 21 12V7L12 2Z" fill="#0a0e17" />
                            <path d="M12 5L6 8.5V12C6 15.87 8.67 19.47 12 20.5C15.33 19.47 18 15.87 18 12V8.5L12 5Z" stroke="#0a0e17" strokeWidth="1" fill="none" />
                            <path d="M10 12L11.5 13.5L14.5 10.5" stroke="#0a0e17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gradient">ThreatLens</h1>
                        <p className="text-[10px] text-cyber-muted tracking-[0.2em] uppercase">URL Intelligence</p>
                    </div>
                </motion.div>

                <nav className="flex items-center gap-6">
                    <a href="/" onClick={(e) => { e.preventDefault(); onNavigateHome(); }} className="text-sm text-cyber-muted hover:text-cyber-accent transition-colors cursor-pointer">Scan</a>
                    <a href="/stats" onClick={(e) => { e.preventDefault(); onNavigateStats(); }} className="text-sm text-cyber-muted hover:text-cyber-accent transition-colors cursor-pointer">Statistics</a>
                    <div className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" title="System Online" />
                </nav>
            </div>
        </header>
    );
};

export default Header;
