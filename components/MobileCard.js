export function MobileCardContainer({ children }) {
  return (
    <div className="flex flex-col gap-3 lg:hidden">
      {children}
    </div>
  );
}

export function MobileCard({ children, dimmed }) {
  return (
    <div className={`card space-y-3 ${dimmed ? 'opacity-50' : ''}`}>
      {children}
    </div>
  );
}

export function MobileCardHeader({ title, subtitle, badge }) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <p className="font-semibold text-white text-sm">{title}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {badge}
    </div>
  );
}

export function MobileCardGrid({ children, cols = 3 }) {
  const colClass = cols === 2 ? 'grid-cols-2' : 'grid-cols-3';
  return (
    <div className={`grid ${colClass} gap-2 text-xs`}>
      {children}
    </div>
  );
}

export function MobileCardField({ label, value }) {
  return (
    <div>
      <p className="text-gray-500">{label}</p>
      <p className="text-white font-medium mt-0.5">{value || '—'}</p>
    </div>
  );
}

export function MobileCardActions({ children }) {
  return (
    <div className="flex items-center gap-2 pt-2 border-t border-dark-400">
      {children}
    </div>
  );
}
