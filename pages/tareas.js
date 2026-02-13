import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { Plus, Pencil, Trash2, Power, PowerOff } from 'lucide-react';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';
import { MobileCardContainer, MobileCard, MobileCardHeader, MobileCardGrid, MobileCardField, MobileCardActions } from '../components/MobileCard';

const emptyForm = {
  Tarea: '', Descripción: '', Responsable: [],
  'Fecha Limite': '', 'Fecha de finalización': '',
  Estado: 'Sin empezar', Prioridad: 'Media', Activa: true,
};

export default function Tareas() {
  const [data, setData] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
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
      const [tareasRes, usersRes] = await Promise.all([fetch('/api/tareas'), fetch('/api/usuarios')]);
      setData(await tareasRes.json());
      setUsuarios(await usersRes.json());
    } catch (err) { console.error(err); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getUsuarioName = (ids) => {
    if (!ids || !Array.isArray(ids)) return '—';
    return ids.map((id) => { const user = usuarios.find((u) => u.id === id); return user ? user.Nombre : id; }).join(', ');
  };

  const getDisplayName = (r) => {
    if (r['Nombre (from Responsable)']) {
      return Array.isArray(r['Nombre (from Responsable)']) ? r['Nombre (from Responsable)'].join(', ') : r['Nombre (from Responsable)'];
    }
    return getUsuarioName(r.Responsable);
  };

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setModalOpen(true); };

  const openEdit = (r) => {
    setForm({
      Tarea: r.Tarea || '', Descripción: r['Descripción'] || '',
      Responsable: r.Responsable || [],
      'Fecha Limite': r['Fecha Limite'] || '',
      'Fecha de finalización': r['Fecha de finalización'] || '',
      Estado: r.Estado || 'Sin empezar',
      Prioridad: r.Prioridad || 'Media',
      Activa: r.Activa !== false,
    });
    setEditingId(r.id);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { recordId: editingId, ...form } : form;
      await fetch('/api/tareas', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      setModalOpen(false);
      setToast({ message: editingId ? 'Tarea actualizada' : 'Tarea creada', type: 'success' });
      fetchData();
    } catch (err) { setToast({ message: 'Error al guardar', type: 'error' }); }
    setSaving(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await fetch('/api/tareas', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ recordId: confirmDelete }) });
      setConfirmDelete(null);
      setToast({ message: 'Tarea eliminada', type: 'success' });
      fetchData();
    } catch (err) { setToast({ message: 'Error al eliminar', type: 'error' }); }
    setDeleting(false);
  };

  const toggleActive = async (record) => {
    try {
      await fetch('/api/tareas', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ recordId: record.id, Activa: !record.Activa }) });
      setToast({ message: record.Activa ? 'Tarea desactivada' : 'Tarea activada', type: 'success' });
      fetchData();
    } catch (err) { setToast({ message: 'Error', type: 'error' }); }
  };

  const u = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const toggleResponsable = (userId) => {
    setForm((f) => {
      const current = f.Responsable || [];
      return { ...f, Responsable: current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId] };
    });
  };

  const prioridadBadge = (p) => {
    const map = { Alta: 'badge-red', Media: 'badge-yellow', Baja: 'badge-gray' };
    return map[p] || 'badge-gray';
  };

  const isOverdue = (r) => {
    if (!r['Fecha Limite']) return false;
    if ((r.Estado || '').toLowerCase() === 'completada') return false;
    // Compare date strings only (YYYY-MM-DD) to avoid timezone issues
    const limiteStr = r['Fecha Limite'].split('T')[0];
    const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' }); // YYYY-MM-DD format
    return limiteStr < todayStr;
  };

  return (
    <>
      <Head><title>Tareas | NOVIQ Restaurant OS</title></Head>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Tareas</h1>
            <p className="text-sm text-gray-500 mt-1">{data.length} tareas</p>
          </div>
          <button className="btn-primary flex items-center gap-2" onClick={openCreate}>
            <Plus size={16} /> <span className="hidden sm:inline">Nueva tarea</span><span className="sm:hidden">Nueva</span>
          </button>
        </div>

        {/* Mobile Cards */}
        {loading ? (
          <p className="text-center py-12 text-gray-500 lg:hidden">Cargando...</p>
        ) : data.length === 0 ? (
          <p className="text-center py-12 text-gray-500 lg:hidden">No hay tareas</p>
        ) : (
          <MobileCardContainer>
            {data.map((r) => (
              <MobileCard key={r.id} dimmed={!r.Activa}>
                <MobileCardHeader
                  title={r.Tarea || '—'}
                  subtitle={r['Descripción']}
                  badge={<span className={prioridadBadge(r.Prioridad)}>{r.Prioridad || '—'}</span>}
                />
                <MobileCardGrid>
                  <MobileCardField label="Estado" value={<StatusBadge status={r.Estado} />} />
                  <MobileCardField label="Responsable" value={getDisplayName(r)} />
                  <MobileCardField label="Límite" value={
                    <span className={isOverdue(r) ? 'text-red-400 font-medium' : ''}>{r['Fecha Limite'] || '—'}</span>
                  } />
                </MobileCardGrid>
                <MobileCardActions>
                  <button onClick={() => toggleActive(r)} className={`flex items-center justify-center gap-1.5 flex-1 text-xs !py-1.5 rounded-lg border transition-all ${r.Activa ? 'border-dark-400 text-yellow-400 hover:border-yellow-400' : 'border-dark-400 text-green-400 hover:border-green-400'}`}>
                    {r.Activa ? <><PowerOff size={12} /> Desactivar</> : <><Power size={12} /> Activar</>}
                  </button>
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
                <th>Tarea</th><th>Descripción</th><th>Responsable</th><th>ID Telegram</th><th>Fecha Límite</th><th>Fecha Fin</th><th>Estado</th><th>Prioridad</th><th>Activa</th><th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="text-center py-12 text-gray-500">Cargando...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-12 text-gray-500">No hay tareas</td></tr>
              ) : (
                data.map((r) => (
                  <tr key={r.id} className={`${isOverdue(r) ? 'border-l-2 border-l-red-500' : ''} ${!r.Activa ? 'opacity-50' : ''}`}>
                    <td className="font-medium">{r.Tarea || '—'}</td>
                    <td className="text-gray-400 max-w-[200px] truncate">{r['Descripción'] || '—'}</td>
                    <td>{getDisplayName(r)}</td>
                    <td className="text-gray-500 font-mono text-xs">{r['ID Telegram (from Responsable)'] ? (Array.isArray(r['ID Telegram (from Responsable)']) ? r['ID Telegram (from Responsable)'].join(', ') : r['ID Telegram (from Responsable)']) : '—'}</td>
                    <td className={isOverdue(r) ? 'text-red-400 font-medium' : ''}>{r['Fecha Limite'] || '—'}</td>
                    <td className="text-gray-400">{r['Fecha de finalización'] || '—'}</td>
                    <td><StatusBadge status={r.Estado} /></td>
                    <td><span className={prioridadBadge(r.Prioridad)}>{r.Prioridad || '—'}</span></td>
                    <td>{r.Activa ? <span className="badge-green">Sí</span> : <span className="badge-gray">No</span>}</td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-dark-500 text-gray-400 hover:text-white transition-colors"><Pencil size={14} /></button>
                        <button onClick={() => toggleActive(r)} className="p-1.5 rounded-lg hover:bg-dark-500 text-gray-400 hover:text-yellow-400 transition-colors" title={r.Activa ? 'Desactivar' : 'Activar'}>{r.Activa ? <PowerOff size={14} /> : <Power size={14} />}</button>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar Tarea' : 'Nueva Tarea'}>
        <div className="space-y-4">
          <div><label className="text-xs text-gray-400 mb-1 block">Tarea</label><input className="input-field" value={form.Tarea} onChange={(e) => u('Tarea', e.target.value)} placeholder="Nombre de la tarea" /></div>
          <div><label className="text-xs text-gray-400 mb-1 block">Descripción</label><textarea className="input-field" rows={2} value={form['Descripción']} onChange={(e) => u('Descripción', e.target.value)} placeholder="Detalle..." /></div>
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Responsables</label>
            <div className="flex flex-wrap gap-2">
              {usuarios.map((usr) => (
                <button key={usr.id} type="button" onClick={() => toggleResponsable(usr.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${(form.Responsable || []).includes(usr.id) ? 'border-transparent text-dark-900' : 'border-dark-400 text-gray-400 hover:border-gray-500'}`}
                  style={(form.Responsable || []).includes(usr.id) ? { background: 'var(--gold)' } : {}}>
                  {usr.Nombre}
                </button>
              ))}
              {usuarios.length === 0 && <p className="text-xs text-gray-500">No hay usuarios</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs text-gray-400 mb-1 block">Fecha Límite</label><input type="date" className="input-field" value={form['Fecha Limite']} onChange={(e) => u('Fecha Limite', e.target.value)} /></div>
            <div><label className="text-xs text-gray-400 mb-1 block">Fecha finalización</label><input type="date" className="input-field" value={form['Fecha de finalización']} onChange={(e) => u('Fecha de finalización', e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="text-xs text-gray-400 mb-1 block">Estado</label>
              <select className="select-field" value={form.Estado} onChange={(e) => u('Estado', e.target.value)}>
                <option value="Sin empezar">Sin empezar</option><option value="En proceso">En proceso</option><option value="Completada">Completada</option>
              </select>
            </div>
            <div><label className="text-xs text-gray-400 mb-1 block">Prioridad</label>
              <select className="select-field" value={form.Prioridad} onChange={(e) => u('Prioridad', e.target.value)}>
                <option value="Alta">Alta</option><option value="Media">Media</option><option value="Baja">Baja</option>
              </select>
            </div>
            <div><label className="text-xs text-gray-400 mb-1 block">Activa</label>
              <select className="select-field" value={form.Activa ? 'true' : 'false'} onChange={(e) => u('Activa', e.target.value === 'true')}>
                <option value="true">Sí</option><option value="false">No</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={handleDelete} title="Eliminar tarea" message="¿Seguro que deseas eliminar esta tarea?" loading={deleting} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
