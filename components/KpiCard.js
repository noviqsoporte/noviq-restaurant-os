export default function KpiCard({ label, value, icon: Icon, color = 'gold', loading }) {
  const colorMap = {
    gold: { bg: 'rgba(201,149,44,0.1)', text: '#d4a843', icon: '#c9952c' },
    green: { bg: 'rgba(34,197,94,0.1)', text: '#4ade80', icon: '#22c55e' },
    red: { bg: 'rgba(239,68,68,0.1)', text: '#f87171', icon: '#ef4444' },
    blue: { bg: 'rgba(59,130,246,0.1)', text: '#60a5fa', icon: '#3b82f6' },
    purple: { bg: 'rgba(168,85,247,0.1)', text: '#c084fc', icon: '#a855f7' },
  };

  const c = colorMap[color] || colorMap.gold;

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="shimmer h-3 w-24" />
            <div className="shimmer h-8 w-16" />
          </div>
          <div className="shimmer w-10 h-10 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2">{label}</p>
          <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
        </div>
        {Icon && (
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: c.bg }}
          >
            <Icon size={20} style={{ color: c.icon }} />
          </div>
        )}
      </div>
    </div>
  );
}
