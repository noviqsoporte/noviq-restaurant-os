import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { Plus, Pencil, Trash2, CalendarCheck } from 'lucide-react';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';

const emptyForm = {
  ID: '', fecha: '', hora: '', nombre: '', personas: '',
  telefono: '', ocasion_especial: '', observaciones: '',
  anticipo_pagado: '', estado: 'Pendiente',
};

export default function Reservas() {
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
      const res = await fetch('/api/reservas');
      const records = await res.json();
      setData(records);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setForm({
      ID: record.ID || '',
      fecha: record.fecha || '',
      hora: record.hora || '',
      nombre: record.nombre || '',
      personas: record.personas || '',
      telefono: record.telefono || '',
      ocasion_especial: record.ocasion_especial || '',
      observaciones: record['observaciones (Discapacidades)'] || '',
      anticipo_pagado: record.anticipo_pagado || '',
      estado: record.estado || 'Pendiente',
    });
    setEditingId(record.id);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { recordId: editingId, ...form } : form;
      await fetch('/api/reservas', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      setModalOpen(false);
      setToast({ message: editingId ? 'Reserva actualizada' : 'Reserva creada', type: 'success' });
      fetchData();
    } catch (err) {
      setToast({ message: 'Error al guardar', type: 'error' });
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await fetch('/api/reservas', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordId: confirmDelete }),
      });
      setConfirmDelete(null);
      setToast({ message: 'Reserva eliminada', type: 'success' });
      fetchData();
    } catch (err) {
      setToast({ message: 'Error al eliminar', type: 'error' });
    }
    setDeleting(false);
  };

  const updateField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <>
      <Head><title>Reservas | NOVIQ Restaurant OS</title></Head>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Reservas</h1>
            <p className="text-sm text-gray-500 mt-1">{data.length} registros</p>
          </div>
          <button className="btn-primary flex items-center gap-2" onClick={openCreate}>
            <Plus size={16} /> Nueva reserva
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Nombre</th>
                <th>Personas</th>
                <th>Teléfono</th>
                <th>Ocasión</th>
                <th>Estado</th>
                <th>Anticipo</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="text-center py-12 text-gray-500">Cargando...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-12 text-gray-500">No hay reservas</td></tr>
              ) : (
                data.map((r) => (
                  <tr key={r.id}>
                    <td className="text-gray-400 font-mono text-xs">{r.ID || '—'}</td>
                    <td>{r.fecha || '—'}</td>
                    <td>{r.hora || '—'}</td>
                    <td className="font-medium">{r.nombre || '—'}</td>
                    <td>{r.personas || '—'}</td>
                    <td className="text-gray-400">{r.telefono || '—'}</td>
                    <td className="text-gray-400">{r.ocasion_especial || '—'}</td>
                    <td><StatusBadge status={r.estado} /></td>
                    <td>{r.anticipo_pagado || '—'}</td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-dark-500 text-gray-400 hover:text-white transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setConfirmDelete(r.id)} className="p-1.5 rounded-lg hover:bg-dark-500 text-gray-400 hover:text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar Reserva' : 'Nueva Reserva'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">ID</label>
              <input className="input-field" value={form.ID} onChange={(e) => updateField('ID', e.target.value)} placeholder="12345" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Estado</label>
              <select className="select-field" value={form.estado} onChange={(e) => updateField('estado', e.target.value)}>
                <option value="Pendiente">Pendiente</option>
                <option value="Confirmada">Confirmada</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Fecha</label>
              <input type="date" className="input-field" value={form.fecha} onChange={(e) => updateField('fecha', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Hora</label>
              <input type="time" className="input-field" value={form.hora} onChange={(e) => updateField('hora', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Nombre</label>
            <input className="input-field" value={form.nombre} onChange={(e) => updateField('nombre', e.target.value)} placeholder="Nombre del cliente" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Personas</label>
              <input type="number" className="input-field" value={form.personas} onChange={(e) => updateField('personas', e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Teléfono</label>
              <input className="input-field" value={form.telefono} onChange={(e) => updateField('telefono', e.target.value)} placeholder="5512345678" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Ocasión especial</label>
            <input className="input-field" value={form.ocasion_especial} onChange={(e) => updateField('ocasion_especial', e.target.value)} placeholder="Cumpleaños, aniversario..." />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Observaciones</label>
            <textarea className="input-field" rows={2} value={form.observaciones} onChange={(e) => updateField('observaciones', e.target.value)} placeholder="Notas adicionales..." />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Anticipo pagado</label>
            <input className="input-field" value={form.anticipo_pagado} onChange={(e) => updateField('anticipo_pagado', e.target.value)} placeholder="$0.00 o N/A" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Eliminar reserva"
        message="¿Seguro que deseas eliminar esta reserva? No se puede deshacer."
        loading={deleting}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
