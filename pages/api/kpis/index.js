import { fetchRecords, TABLES } from '../../../lib/airtable';
import { isInRange } from '../../../lib/dates';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { range = 'today', customStart, customEnd } = req.query;

    // Fetch all data in parallel
    const [items, movimientos, ventas, reservas, pedidos, tareas] = await Promise.all([
      fetchRecords(TABLES.ITEMS),
      fetchRecords(TABLES.MOVIMIENTOS),
      fetchRecords(TABLES.VENTAS),
      fetchRecords(TABLES.RESERVAS),
      fetchRecords(TABLES.PEDIDOS),
      fetchRecords(TABLES.TAREAS),
    ]);

    // Filter by date range
    const filteredMovimientos = movimientos.filter((m) => isInRange(m.fecha_hora, range, customStart, customEnd));
    const filteredVentas = ventas.filter((v) => isInRange(v['Fecha y Hora'], range, customStart, customEnd));
    const filteredReservas = reservas.filter((r) => isInRange(r.fecha, range, customStart, customEnd));
    const filteredPedidos = pedidos.filter((p) => isInRange(p.Fecha, range, customStart, customEnd));

    // --- INVENTARIO KPIs ---
    const itemsActivos = items.filter((i) => i.activo).length;
    const itemsBajoStock = items.filter((i) => i.bajo_stock === 'BAJO' || (i.stock_actual !== undefined && i.min_level !== undefined && i.stock_actual <= i.min_level)).length;
    const movimientosCount = filteredMovimientos.length;
    const consumoHoy = filteredMovimientos
      .filter((m) => m.tipo === 'OUT')
      .reduce((sum, m) => sum + (m.cantidad_base || 0), 0);

    // --- VENTAS KPIs ---
    const ventasCount = filteredVentas.length;
    const totalVendido = filteredVentas.reduce((sum, v) => sum + (v['Total Venta'] || 0), 0);
    const ticketPromedio = ventasCount > 0 ? totalVendido / ventasCount : 0;
    const productosVendidos = filteredVentas.reduce((sum, v) => sum + (v.Cantidad || 0), 0);

    // --- RESERVAS KPIs ---
    const reservasCount = filteredReservas.length;
    const personasTotal = filteredReservas.reduce((sum, r) => sum + (r.personas || 0), 0);
    const confirmadas = filteredReservas.filter((r) => (r.estado || '').toLowerCase() === 'confirmada').length;
    const reservasPendientes = filteredReservas.filter((r) => (r.estado || '').toLowerCase() === 'pendiente').length;

    // --- PEDIDOS KPIs ---
    const pedidosCount = filteredPedidos.length;
    const totalPedidos = filteredPedidos.reduce((sum, p) => sum + (p['Monto Total'] || 0), 0);
    const pedidosPendientes = filteredPedidos.filter((p) => (p.Estado || '').toLowerCase() === 'pendiente').length;

    // --- TAREAS KPIs ---
    const tareasActivas = tareas.filter((t) => t.Activa).length;
    const tareasPendientes = tareas.filter((t) => (t.Estado || '').toLowerCase() === 'sin empezar').length;
    const tareasCompletadas = tareas.filter((t) => (t.Estado || '').toLowerCase() === 'completada').length;
    const tareasVencidas = tareas.filter((t) => {
      if (!t['Fecha Limite']) return false;
      return new Date(t['Fecha Limite']) < new Date() && (t.Estado || '').toLowerCase() !== 'completada';
    }).length;

    res.status(200).json({
      inventario: {
        itemsActivos,
        itemsBajoStock,
        movimientos: movimientosCount,
        consumo: consumoHoy,
      },
      ventas: {
        count: ventasCount,
        totalVendido,
        ticketPromedio: Math.round(ticketPromedio * 100) / 100,
        productosVendidos,
      },
      reservas: {
        count: reservasCount,
        personasTotal,
        confirmadas,
        pendientes: reservasPendientes,
      },
      pedidos: {
        count: pedidosCount,
        totalPedidos,
        pendientes: pedidosPendientes,
      },
      tareas: {
        activas: tareasActivas,
        pendientes: tareasPendientes,
        completadas: tareasCompletadas,
        vencidas: tareasVencidas,
      },
    });
  } catch (error) {
    console.error('KPIs error:', error);
    res.status(500).json({ error: 'Error fetching KPIs' });
  }
}
