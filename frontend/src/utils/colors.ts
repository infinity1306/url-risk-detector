export function getRiskColor(score: number): string {
    if (score <= 20) return '#22c55e';   // Green
    if (score <= 40) return '#84cc16';   // Lime
    if (score <= 60) return '#eab308';   // Yellow
    if (score <= 80) return '#f97316';   // Orange
    return '#ef4444';                     // Red
}

export function getRiskGradient(score: number): string {
    if (score <= 20) return 'from-green-500 to-emerald-400';
    if (score <= 40) return 'from-lime-500 to-green-400';
    if (score <= 60) return 'from-yellow-500 to-amber-400';
    if (score <= 80) return 'from-orange-500 to-amber-500';
    return 'from-red-600 to-red-400';
}

export function getRiskBg(score: number): string {
    if (score <= 20) return 'bg-green-500/10 border-green-500/30';
    if (score <= 40) return 'bg-lime-500/10 border-lime-500/30';
    if (score <= 60) return 'bg-yellow-500/10 border-yellow-500/30';
    if (score <= 80) return 'bg-orange-500/10 border-orange-500/30';
    return 'bg-red-500/10 border-red-500/30';
}

export function getSeverityColor(severity: string): string {
    switch (severity) {
        case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/30';
        case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
        case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
        case 'low': return 'text-lime-400 bg-lime-500/10 border-lime-500/30';
        default: return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
    }
}

export function formatDate(dateStr: string | null): string {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}
