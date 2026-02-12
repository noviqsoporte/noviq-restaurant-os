import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';
import { MobileCardContainer, MobileCard, MobileCardHeader, MobileCardGrid, MobileCardField, MobileCardActions } from '../components/MobileCard';

const emptyForm = {
  'Pedido ID': '', Nombre: '', Telefono: '', fecha: '', hora: '',
  'Ubicación': '', 'Monto Total': '', Alimentos: '',
  'Metodo de Pago': 'Efectivo', Estado: 'Pendiente',
};

function parseFecha(raw) {
  if (!raw) return { fecha: '', hora: '' };
  try {
    const str = String(raw);
    if (str.includes('T')) {
      const [datePart, timePart] = str.split('T');
      const fecha = datePart;
      const timeClean = timePart.replace('Z', '').split('.')[0];
      const [hh, mm] = timeClean.split(':');
      return { fecha, hora: `${hh}:${mm}` };
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      return { fecha: str, hora: '' };
    }
    const d = new Date(raw);
    if (isNaN(d.getTime())) return { fecha: str, hora: '' };
    const fecha = d.toISOString().split('T')[0];
    return { fecha, hora: '' };
  } catch {
    return { fecha: String(raw), hora: '' };
  }
}

function combineFechaHora(fecha, hora) {
  if (!fecha) return '';
  if (!hora) return fecha;
  return `${fecha}T${hora}:00.000Z`;
}

function formatDisplayDate(raw) {
  if (!raw) return '—';
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return raw;
  }
}

function formatShortDate(raw) {
  if (!raw) return '—';
  const { fecha, hora } = parseFecha(raw);
  return hora ? `${fecha} ${hora}` : fecha;
}

export default function Pedidos() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pedidos');
      setData(await res.json());
    } catch (err) { console.error(err); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setModalOpen(true); };

  const openEdit = (r) => {
    const { fecha, hora } = parseFecha(r.Fecha);
    setForm({
      'Pedido ID': r['Pedido ID'] || '',
      Nombre: r.Nombre || '',
      Telefono: r.Telefono || '',
      fecha, hora,
      'Ubicación': r['Ubicación'] || '',
      'Monto Total': r['Monto Total'] || '',
      Alimentos: r.Alimentos || '',
      'Metodo de Pago': r['Metodo de Pago'] || 'Efectivo',
      Estado: r.Estado || 'Pendiente',
    });
    setEditingId(r.id);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const { fecha, hora, ...rest } = form;
      const payload = { ...rest, Fecha: combineFechaHora(fecha, hora) };
      const body = editingId ? { recordId: editingId, ...payload } : payload;
      await fetch('/api/pedidos', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      setModalOpen(false);
      setToast({ message: editingId ? 'Pedido actualizado' : 'Pedido creado', type: 'success' });
      fetchData();
    } catch (err) { setToast({ message: 'Error al guardar', type: 'error' }); }
    setSaving(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await fetch('/api/pedidos', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ recordId: confirmDelete }) });
      setConfirmDelete(null);
      setToast({ message: 'Pedido eliminado', type: 'success' });
      fetchData();
    } catch (err) { setToast({ message: 'Error al eliminar', type: 'error' }); }
    setDeleting(false);
  };

  const u = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const fmtMoney = (n) => n ? `$${Number(n).toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '—';

  return (
    <>
      <Head><title>Pedidos | NOVIQ Restaurant OS</title></Head>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Pedidos</h1>
            <p className="text-sm text-gray-500 mt-1">{data.length} registros</p>
          </div>
          <button className="btn-primary flex items-center gap-2" onClick={openCreate}>
            <Plus size={16} /> <span className="hidden sm:inline">Nuevo pedido</span><span className="sm:hidden">Nuevo</span>
          </button>
        </div>

        {/* Mobile Cards */}
        {loading ? (
          <p className="text-center py-12 text-gray-500 lg:hidden">Cargando...</p>
        ) : data.length === 0 ? (
          <p className="text-center py-12 text-gray-500 lg:hidden">No hay pedidos</p>
        ) : (
          <MobileCardContainer>
            {data.map((r) => (
              <MobileCard key={r.id}>
                <MobileCardHeader
                  title={r.Nombre || 'Sin nombre'}
                  subtitle={`#${r['Pedido ID'] || '—'} · ${r['Ubicación'] || ''}`}
                  badge={<StatusBadge status={r.Estado} />}
                />
                <MobileCardGrid>
                  <MobileCardField label="Fecha" value={formatShortDate(r.Fecha)} />
                  <MobileCardField label="Monto" value={fmtMoney(r['Monto Total'])} />
                  <MobileCardField label="Pago" value={r['Metodo de Pago']} />
                </MobileCardGrid>
                <MobileCardGrid cols={2}>
                  <MobileCardField label="Teléfono" value={r.Telefono} />
                  <MobileCardField label="Alimentos" value={r.Alimentos ? (r.Alimentos.length > 40 ? r.Alimentos.slice(0, 40) + '...' : r.Alimentos) : '—'} />
                </MobileCardGrid>
                <MobileCardActions>
                  <button onClick={() => openEdit(r)} className="btn-secondary flex-1 text-xs !py-1.5">Editar</button>
                  <button onClick={() => setConfirmDelete(r.id)} className="btn-danger flex-1 text-xs !py-1.5">Eliminar</button>
                </MobileCardActions>
              </MobileCard>
            ))}
          </MobileCardContainer>
        )}

        {/* Desktop Table */}
        <div className="table-container hidden lg:block">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Nombre</th><th>Teléfono</th><th>Fecha</th><th>Ubicación</th><th>Monto</th><th>Alimentos</th><th>Pago</th><th>Estado</th><th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="text-center py-12 text-gray-500">Cargando...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-12 text-gray-500">No hay pedidos</td></tr>
              ) : (
                data.map((r) => (
                  <tr key={r.id}>
                    <td className="text-gray-400 font-mono text-xs">{r['Pedido ID'] || '—'}</td>
                    <td className="font-medium">{r.Nombre || '—'}</td>
                    <td className="text-gray-400">{r.Telefono || '—'}</td>
                    <td className="text-sm">{formatDisplayDate(r.Fecha)}</td>
                    <td className="text-gray-400">{r['Ubicación'] || '—'}</td>
                    <td className="font-medium">{fmtMoney(r['Monto Total'])}</td>
                    <td className="text-gray-400 max-w-[200px] truncate">{r.Alimentos || '—'}</td>
                    <td><span className="badge-blue">{r['Metodo de Pago'] || '—'}</span></td>
                    <td><StatusBadge status={r.Estado} /></td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-dark-500 text-gray-400 hover:text-white transition-colors"><Pencil size={14} /></button>
                        <button onClick={() => setConfirmDelete(r.id)} className="p-1.5 rounded-lg hover:bg-dark-500 text-gray-400 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar Pedido' : 'Nuevo Pedido'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs text-gray-400 mb-1 block">Pedido ID</label><input className="input-field" value={form['Pedido ID']} onChange={(e) => u('Pedido ID', e.target.value)} placeholder="1" /></div>
            <div><label className="text-xs text-gray-400 mb-1 block">Estado</label>
              <select className="select-field" value={form.Estado} onChange={(e) => u('Estado', e.target.value)}>
                <option value="Pendiente">Pendiente</option><option value="Preparando">Preparando</option><option value="En camino">En camino</option><option value="Entregado">Entregado</option><option value="Cancelado">Cancelado</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs text-gray-400 mb-1 block">Fecha</label><input type="date" className="input-field" value={form.fecha} onChange={(e) => u('fecha', e.target.value)} /></div>
            <div><label className="text-xs text-gray-400 mb-1 block">Hora</label><input type="time" className="input-field" value={form.hora} onChange={(e) => u('hora', e.target.value)} /></div>
          </div>
          <div><label className="text-xs text-gray-400 mb-1 block">Nombre</label><input className="input-field" value={form.Nombre} onChange={(e) => u('Nombre', e.target.value)} placeholder="Nombre del cliente" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs text-gray-400 mb-1 block">Teléfono</label><input className="input-field" value={form.Telefono} onChange={(e) => u('Telefono', e.target.value)} placeholder="5512345678" /></div>
            <div><label className="text-xs text-gray-400 mb-1 block">Monto Total</label><input type="number" className="input-field" value={form['Monto Total']} onChange={(e) => u('Monto Total', e.target.value)} placeholder="0.00" /></div>
          </div>
          <div><label className="text-xs text-gray-400 mb-1 block">Ubicación</label><input className="input-field" value={form['Ubicación']} onChange={(e) => u('Ubicación', e.target.value)} placeholder="Dirección de entrega" /></div>
          <div><label className="text-xs text-gray-400 mb-1 block">Alimentos</label><textarea className="input-field" rows={2} value={form.Alimentos} onChange={(e) => u('Alimentos', e.target.value)} placeholder="10 pasteles, 5 bolillos..." /></div>
          <div><label className="text-xs text-gray-400 mb-1 block">Método de Pago</label>
            <select className="select-field" value={form['Metodo de Pago']} onChange={(e) => u('Metodo de Pago', e.target.value)}>
              <option value="Efectivo">Efectivo</option><option value="Transferencia">Transferencia</option><option value="Tarjeta">Tarjeta</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={handleDelete} title="Eliminar pedido" message="¿Seguro que deseas eliminar este pedido?" loading={deleting} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
