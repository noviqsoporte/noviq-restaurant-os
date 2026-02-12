import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import KpiCard from '../components/KpiCard';
import DateFilter from '../components/DateFilter';
import {
  Package, AlertTriangle, ArrowLeftRight, TrendingDown,
  ShoppingCart, DollarSign, Receipt, BarChart3,
  CalendarCheck, Users, CheckCircle, Clock,
  ShoppingBag, CreditCard, Loader,
  ListTodo, CircleDot, CheckSquare, AlertCircle,
} from 'lucide-react';

export default function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ range: 'today', customStart: '', customEnd: '' });

  const fetchKpis = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ range: filter.range });
      if (filter.range === 'custom') {
        if (filter.customStart) params.set('customStart', filter.customStart);
        if (filter.customEnd) params.set('customEnd', filter.customEnd);
      }
      const res = await fetch(`/api/kpis?${params}`);
      const data = await res.json();
      setKpis(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchKpis();
  }, [fetchKpis]);

  const fmt = (n) => {
    if (n === undefined || n === null) return '—';
    return n.toLocaleString('es-MX');
  };

  const fmtMoney = (n) => {
    if (n === undefined || n === null) return '—';
    return `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
  };

  const rangeLabel = {
    today: 'Hoy',
    '7d': 'Últimos 7 días',
    '30d': 'Últimos 30 días',
    custom: 'Personalizado',
  };

  return (
    <>
      <Head>
        <title>Dashboard | NOVIQ Restaurant OS</title>
      </Head>

      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Resumen general · {rangeLabel[filter.range]}</p>
          </div>
          <DateFilter
            range={filter.range}
            customStart={filter.customStart}
            customEnd={filter.customEnd}
            onChange={setFilter}
          />
        </div>

        {/* INVENTARIO */}
        <section>
          <h2 className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-4 flex items-center gap-2">
            <Package size={14} style={{ color: 'var(--gold)' }} />
            Inventario
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="Items activos" value={fmt(kpis?.inventario?.itemsActivos)} icon={Package} color="gold" loading={loading} />
            <KpiCard label="Bajo stock" value={fmt(kpis?.inventario?.itemsBajoStock)} icon={AlertTriangle} color="red" loading={loading} />
            <KpiCard label="Movimientos" value={fmt(kpis?.inventario?.movimientos)} icon={ArrowLeftRight} color="blue" loading={loading} />
            <KpiCard label="Consumo (OUT)" value={fmt(kpis?.inventario?.consumo)} icon={TrendingDown} color="purple" loading={loading} />
          </div>
        </section>

        {/* VENTAS */}
        <section>
          <h2 className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-4 flex items-center gap-2">
            <BarChart3 size={14} style={{ color: 'var(--gold)' }} />
            Ventas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="Ventas" value={fmt(kpis?.ventas?.count)} icon={ShoppingCart} color="gold" loading={loading} />
            <KpiCard label="Total vendido" value={fmtMoney(kpis?.ventas?.totalVendido)} icon={DollarSign} color="green" loading={loading} />
            <KpiCard label="Ticket promedio" value={fmtMoney(kpis?.ventas?.ticketPromedio)} icon={Receipt} color="blue" loading={loading} />
            <KpiCard label="Productos vendidos" value={fmt(kpis?.ventas?.productosVendidos)} icon={BarChart3} color="purple" loading={loading} />
          </div>
        </section>

        {/* RESERVAS */}
        <section>
          <h2 className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-4 flex items-center gap-2">
            <CalendarCheck size={14} style={{ color: 'var(--gold)' }} />
            Reservas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="Reservas" value={fmt(kpis?.reservas?.count)} icon={CalendarCheck} color="gold" loading={loading} />
            <KpiCard label="Personas total" value={fmt(kpis?.reservas?.personasTotal)} icon={Users} color="blue" loading={loading} />
            <KpiCard label="Confirmadas" value={fmt(kpis?.reservas?.confirmadas)} icon={CheckCircle} color="green" loading={loading} />
            <KpiCard label="Pendientes" value={fmt(kpis?.reservas?.pendientes)} icon={Clock} color="red" loading={loading} />
          </div>
        </section>

        {/* PEDIDOS */}
        <section>
          <h2 className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-4 flex items-center gap-2">
            <ShoppingBag size={14} style={{ color: 'var(--gold)' }} />
            Pedidos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <KpiCard label="Pedidos" value={fmt(kpis?.pedidos?.count)} icon={ShoppingBag} color="gold" loading={loading} />
            <KpiCard label="Total pedidos" value={fmtMoney(kpis?.pedidos?.totalPedidos)} icon={CreditCard} color="green" loading={loading} />
            <KpiCard label="Pendientes" value={fmt(kpis?.pedidos?.pendientes)} icon={Loader} color="red" loading={loading} />
          </div>
        </section>

        {/* TAREAS */}
        <section>
          <h2 className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-4 flex items-center gap-2">
            <CheckSquare size={14} style={{ color: 'var(--gold)' }} />
            Tareas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="Activas" value={fmt(kpis?.tareas?.activas)} icon={ListTodo} color="gold" loading={loading} />
            <KpiCard label="Pendientes" value={fmt(kpis?.tareas?.pendientes)} icon={CircleDot} color="blue" loading={loading} />
            <KpiCard label="Completadas" value={fmt(kpis?.tareas?.completadas)} icon={CheckSquare} color="green" loading={loading} />
            <KpiCard label="Vencidas" value={fmt(kpis?.tareas?.vencidas)} icon={AlertCircle} color="red" loading={loading} />
          </div>
        </section>
      </div>
    </>
  );
}
