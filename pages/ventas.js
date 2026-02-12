import { useState, useEffect, useCallback, useMemo } from 'react';
import Head from 'next/head';
import DateFilter from '../components/DateFilter';
import { isInRange } from '../lib/dates';

export default function Ventas() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ range: '30d', customStart: '', customEnd: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ventas');
      setData(await res.json());
    } catch (err) { console.error(err); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = useMemo(() => {
    return data.filter((v) => isInRange(v['Fecha y Hora'], filter.range, filter.customStart, filter.customEnd));
  }, [data, filter]);

  const totalVendido = useMemo(() => filtered.reduce((s, v) => s + (v['Total Venta'] || 0), 0), [filtered]);
  const totalProductos = useMemo(() => filtered.reduce((s, v) => s + (v.Cantidad || 0), 0), [filtered]);

  const fmtMoney = (n) => `$${Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;

  return (
    <>
      <Head><title>Ventas | NOVIQ Restaurant OS</title></Head>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Ventas</h1>
            <p className="text-sm text-gray-500 mt-1">{filtered.length} ventas · Total: {fmtMoney(totalVendido)} · {totalProductos} productos</p>
          </div>
          <DateFilter range={filter.range} customStart={filter.customStart} customEnd={filter.customEnd} onChange={setFilter} />
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID Venta</th>
                <th>ID Producto</th>
                <th>Producto</th>
                <th>Fecha y Hora</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Total</th>
                <th>Tipo</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-500">Cargando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-500">No hay ventas en este rango</td></tr>
              ) : (
                filtered.map((v) => (
                  <tr key={v.id}>
                    <td className="text-gray-400 font-mono text-xs">{v['ID Venta'] || '—'}</td>
                    <td className="text-gray-400 font-mono text-xs">{v['ID Producto POS'] || '—'}</td>
                    <td className="font-medium">{v['Nombre del Producto'] || '—'}</td>
                    <td>{v['Fecha y Hora'] || '—'}</td>
                    <td className="font-mono">{v.Cantidad ?? '—'}</td>
                    <td>{fmtMoney(v['Precio Unitario'])}</td>
                    <td className="font-medium">{fmtMoney(v['Total Venta'])}</td>
                    <td><span className={v['Tipo de Movimiento'] === 'OUT' ? 'badge-red' : 'badge-green'}>{v['Tipo de Movimiento'] || '—'}</span></td>
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
