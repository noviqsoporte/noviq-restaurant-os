import { useState, useEffect, useCallback, useMemo } from 'react';
import Head from 'next/head';
import DateFilter from '../components/DateFilter';
import { isInRange } from '../lib/dates';

export default function Movimientos() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ range: 'today', customStart: '', customEnd: '' });
  const [tipoFilter, setTipoFilter] = useState('all');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/movimientos');
      setData(await res.json());
    } catch (err) { console.error(err); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = useMemo(() => {
    return data.filter((m) => {
      const dateMatch = isInRange(m.fecha_hora, filter.range, filter.customStart, filter.customEnd);
      const tipoMatch = tipoFilter === 'all' || m.tipo === tipoFilter;
      return dateMatch && tipoMatch;
    });
  }, [data, filter, tipoFilter]);

  return (
    <>
      <Head><title>Movimientos | NOVIQ Restaurant OS</title></Head>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Movimientos</h1>
            <p className="text-sm text-gray-500 mt-1">{filtered.length} de {data.length} registros</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-lg overflow-hidden border border-dark-400">
              {['all', 'IN', 'OUT'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTipoFilter(t)}
                  className={`px-3 py-1.5 text-xs font-medium transition-all ${
                    tipoFilter === t ? 'text-dark-900' : 'text-gray-400 hover:text-white hover:bg-dark-500'
                  }`}
                  style={tipoFilter === t ? { background: 'var(--gold)' } : {}}
                >
                  {t === 'all' ? 'Todos' : t}
                </button>
              ))}
            </div>
            <DateFilter range={filter.range} customStart={filter.customStart} customEnd={filter.customEnd} onChange={setFilter} />
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha / Hora</th>
                <th>Tipo</th>
                <th>Item</th>
                <th>Cantidad</th>
                <th>Usuario</th>
                <th>Origen</th>
                <th>Motivo</th>
                <th>Categoría</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-12 text-gray-500">Cargando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-gray-500">No hay movimientos en este rango</td></tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id}>
                    <td className="text-gray-400 font-mono text-xs">{m.mov_id || '—'}</td>
                    <td className="text-sm">{m.fecha_hora || '—'}</td>
                    <td>
                      <span className={m.tipo === 'IN' ? 'badge-green' : 'badge-red'}>
                        {m.tipo || '—'}
                      </span>
                    </td>
                    <td className="font-medium">{m.item_nombre || (Array.isArray(m.item) ? m.item[0] : m.item) || '—'}</td>
                    <td className="font-mono">{m.cantidad_base ?? '—'}</td>
                    <td className="text-gray-400">{m.usuario || '—'}</td>
                    <td className="text-gray-400">{m.origen || '—'}</td>
                    <td className="text-gray-400">{m.motivo_salida || '—'}</td>
                    <td><span className="badge-gold">{m.item_categoria || '—'}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
