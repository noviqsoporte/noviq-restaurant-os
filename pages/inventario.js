import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { Plus, Pencil, Power, PowerOff, AlertTriangle } from 'lucide-react';
import Modal from '../components/Modal';
import Toast from '../components/Toast';

const emptyForm = {
  nombre: '', unidad_base: 'kg', min_level: '', stock_ideal: '',
  limite_cocina: '', categoria: '', subcategoria: '', proveedor: '', activo: true,
};

export default function Inventario() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inventario');
      setData(await res.json());
    } catch (err) { console.error(err); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setModalOpen(true); };

  const openEdit = (r) => {
    setForm({
      nombre: r.nombre || '',
      unidad_base: r.unidad_base || 'kg',
      min_level: r.min_level || '',
      stock_ideal: r.stock_ideal || '',
      limite_cocina: r.limite_cocina || '',
      categoria: r.categoria || '',
      subcategoria: r.subcategoria || '',
      proveedor: r.proveedor || '',
      activo: r.activo !== false,
    });
    setEditingId(r.id);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { recordId: editingId, ...form } : form;
      await fetch('/api/inventario', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      setModalOpen(false);
      setToast({ message: editingId ? 'Item actualizado' : 'Item creado', type: 'success' });
      fetchData();
    } catch (err) { setToast({ message: 'Error al guardar', type: 'error' }); }
    setSaving(false);
  };

  const toggleActive = async (record) => {
    try {
      await fetch('/api/inventario', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordId: record.id, activo: !record.activo }),
      });
      setToast({ message: record.activo ? 'Item desactivado' : 'Item activado', type: 'success' });
      fetchData();
    } catch (err) { setToast({ message: 'Error', type: 'error' }); }
  };

  const u = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <>
      <Head><title>Inventario | NOVIQ Restaurant OS</title></Head>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Inventario</h1>
            <p className="text-sm text-gray-500 mt-1">{data.length} items</p>
          </div>
          <button className="btn-primary flex items-center gap-2" onClick={openCreate}>
            <Plus size={16} /> Nuevo item
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Unidad</th>
                <th>Stock</th>
                <th>Mínimo</th>
                <th>Ideal</th>
                <th>Lím. Cocina</th>
                <th>Categoría</th>
                <th>Proveedor</th>
                <th>Estado</th>
                <th>Stock</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={11} className="text-center py-12 text-gray-500">Cargando...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={11} className="text-center py-12 text-gray-500">No hay items</td></tr>
              ) : (
                data.map((r) => {
                  const isBajo = r.bajo_stock === 'BAJO' || (r.stock_actual !== undefined && r.min_level !== undefined && r.stock_actual <= r.min_level);
                  return (
                    <tr key={r.id} className={!r.activo ? 'opacity-50' : ''}>
                      <td className="font-medium">{r.nombre || '—'}</td>
                      <td><span className="badge-blue">{r.unidad_base || '—'}</span></td>
                      <td className="font-mono">{r.stock_actual ?? '—'}</td>
                      <td className="text-gray-400">{r.min_level ?? '—'}</td>
                      <td className="text-gray-400">{r.stock_ideal ?? '—'}</td>
                      <td className="text-gray-400">{r.limite_cocina ?? '—'}</td>
                      <td>
                        <span className="badge-gold">{r.categoria || '—'}</span>
                        {r.subcategoria && <span className="text-gray-500 text-xs ml-1">/ {r.subcategoria}</span>}
                      </td>
                      <td className="text-gray-400">{r.proveedor || '—'}</td>
                      <td>{r.activo ? <span className="badge-green">Activo</span> : <span className="badge-gray">Inactivo</span>}</td>
                      <td>
                        {isBajo ? (
                          <span className="flex items-center gap-1 text-xs font-medium text-yellow-400">
                            <AlertTriangle size={12} /> BAJO
                          </span>
                        ) : (
                          <span className="text-xs text-green-400">OK</span>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-dark-500 text-gray-400 hover:text-white transition-colors"><Pencil size={14} /></button>
                          <button onClick={() => toggleActive(r)} className="p-1.5 rounded-lg hover:bg-dark-500 text-gray-400 hover:text-yellow-400 transition-colors">
                            {r.activo ? <PowerOff size={14} /> : <Power size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar Item' : 'Nuevo Item'}>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Nombre</label>
            <input className="input-field" value={form.nombre} onChange={(e) => u('nombre', e.target.value)} placeholder="Jitomate, Harina..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Unidad base</label>
              <select className="select-field" value={form.unidad_base} onChange={(e) => u('unidad_base', e.target.value)}>
                <option value="kg">kg</option>
                <option value="l">l</option>
                <option value="pieza">pieza</option>
                <option value="caja">caja</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Nivel mínimo</label>
              <input type="number" className="input-field" value={form.min_level} onChange={(e) => u('min_level', e.target.value)} placeholder="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Stock ideal</label>
              <input type="number" className="input-field" value={form.stock_ideal} onChange={(e) => u('stock_ideal', e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Límite cocina</label>
              <input type="number" className="input-field" value={form.limite_cocina} onChange={(e) => u('limite_cocina', e.target.value)} placeholder="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Categoría</label>
              <input className="input-field" value={form.categoria} onChange={(e) => u('categoria', e.target.value)} placeholder="Cocina, Bebidas..." />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Subcategoría</label>
              <input className="input-field" value={form.subcategoria} onChange={(e) => u('subcategoria', e.target.value)} placeholder="Verduras, Lácteos..." />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Proveedor</label>
            <input className="input-field" value={form.proveedor} onChange={(e) => u('proveedor', e.target.value)} placeholder="Walmart, Costco..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
