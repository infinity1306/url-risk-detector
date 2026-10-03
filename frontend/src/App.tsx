import React, { useState } from 'react';
import Header from './components/layout/Header';
import Home from './pages/Home';
import Report from './pages/Report';
import Stats from './pages/Stats';
import { ReportData } from './services/api';

const App: React.FC = () => {
    const [viewMode, setViewMode] = useState<'home' | 'report' | 'stats'>('home');
    const [report, setReport] = useState<ReportData | null>(null);

    const handleNavigateHome = () => {
        setReport(null);
        setViewMode('home');
    };

    const handleNavigateStats = () => {
        setViewMode('stats');
    };

    const handleReportReady = (r: ReportData) => {
        setReport(r);
        setViewMode('report');
    };

    return (
        <div className="min-h-screen bg-cyber-bg flex flex-col">
            <Header onNavigateHome={handleNavigateHome} onNavigateStats={handleNavigateStats} />
            
            {viewMode === 'stats' && <Stats />}
            {viewMode === 'report' && report && <Report report={report} onNewScan={handleNavigateHome} />}
            {viewMode === 'home' && <Home onReportReady={handleReportReady} />}
        </div>
    );
};

export default App;
