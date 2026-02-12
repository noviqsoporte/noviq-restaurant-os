import { Calendar } from 'lucide-react';

const presets = [
  { value: 'today', label: 'Hoy' },
  { value: '7d', label: '7 días' },
  { value: '30d', label: '30 días' },
  { value: 'custom', label: 'Personalizado' },
];

export default function DateFilter({ range, customStart, customEnd, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Calendar size={16} className="text-gray-500" />
      <div className="flex items-center rounded-lg overflow-hidden border border-dark-400">
        {presets.map((p) => (
          <button
            key={p.value}
            onClick={() => onChange({ range: p.value, customStart, customEnd })}
            className={`px-3 py-1.5 text-xs font-medium transition-all ${
              range === p.value
                ? 'text-dark-900'
                : 'text-gray-400 hover:text-white hover:bg-dark-500'
            }`}
            style={range === p.value ? { background: 'var(--gold)' } : {}}
          >
            {p.label}
          </button>
        ))}
      </div>
      {range === 'custom' && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customStart || ''}
            onChange={(e) => onChange({ range, customStart: e.target.value, customEnd })}
            className="input-field !w-auto !py-1.5 text-xs"
          />
          <span className="text-gray-500 text-xs">a</span>
          <input
            type="date"
            value={customEnd || ''}
            onChange={(e) => onChange({ range, customStart, customEnd: e.target.value })}
            className="input-field !w-auto !py-1.5 text-xs"
          />
        </div>
      )}
    </div>
  );
}
