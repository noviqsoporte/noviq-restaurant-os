export default function StatusBadge({ status }) {
  const normalized = (status || '').toLowerCase().trim();

  const map = {
    'confirmada': 'badge-green',
    'pendiente': 'badge-yellow',
    'cancelada': 'badge-red',
    'completada': 'badge-green',
    'completado': 'badge-green',
    'en proceso': 'badge-blue',
    'sin empezar': 'badge-gray',
    'entregado': 'badge-green',
    'en camino': 'badge-blue',
    'preparando': 'badge-yellow',
  };

  const cls = map[normalized] || 'badge-gray';

  return <span className={cls}>{status || '—'}</span>;
}
