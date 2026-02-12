import Modal from './Modal';

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title || '¿Estás seguro?'}>
      <p className="text-sm text-gray-400 mb-6">{message || 'Esta acción no se puede deshacer.'}</p>
      <div className="flex items-center justify-end gap-3">
        <button className="btn-secondary" onClick={onClose} disabled={loading}>
          Cancelar
        </button>
        <button className="btn-danger" onClick={onConfirm} disabled={loading}>
          {loading ? 'Eliminando...' : 'Eliminar'}
        </button>
      </div>
    </Modal>
  );
}
