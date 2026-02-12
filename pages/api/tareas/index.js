import { fetchRecords, createRecord, updateRecord, deleteRecord, TABLES } from '../../../lib/airtable';

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET': {
        const records = await fetchRecords(TABLES.TAREAS, {
          sort: [{ field: 'Fecha Limite', direction: 'asc' }],
        });
        return res.status(200).json(records);
      }

      case 'POST': {
        const body = req.body;
        const fields = {};
        if (body.Tarea) fields.Tarea = body.Tarea;
        if (body['Descripción']) fields['Descripción'] = body['Descripción'];
        if (body.Responsable) fields.Responsable = body.Responsable; // Array of record IDs
        if (body['Fecha Limite']) fields['Fecha Limite'] = body['Fecha Limite'];
        if (body['Fecha de finalización']) fields['Fecha de finalización'] = body['Fecha de finalización'];
        if (body.Estado) fields.Estado = body.Estado;
        if (body.Prioridad) fields.Prioridad = body.Prioridad;
        if (body.Activa !== undefined) fields.Activa = body.Activa;

        const record = await createRecord(TABLES.TAREAS, fields);
        return res.status(201).json(record);
      }

      case 'PUT': {
        const { recordId, ...updateFields } = req.body;
        if (!recordId) return res.status(400).json({ error: 'recordId is required' });

        const fields = {};
        if (updateFields.Tarea) fields.Tarea = updateFields.Tarea;
        if (updateFields['Descripción'] !== undefined) fields['Descripción'] = updateFields['Descripción'];
        if (updateFields.Responsable) fields.Responsable = updateFields.Responsable;
        if (updateFields['Fecha Limite']) fields['Fecha Limite'] = updateFields['Fecha Limite'];
        if (updateFields['Fecha de finalización']) fields['Fecha de finalización'] = updateFields['Fecha de finalización'];
        if (updateFields.Estado) fields.Estado = updateFields.Estado;
        if (updateFields.Prioridad) fields.Prioridad = updateFields.Prioridad;
        if (updateFields.Activa !== undefined) fields.Activa = updateFields.Activa;

        const record = await updateRecord(TABLES.TAREAS, recordId, fields);
        return res.status(200).json(record);
      }

      case 'DELETE': {
        const { recordId } = req.body;
        if (!recordId) return res.status(400).json({ error: 'recordId is required' });
        const result = await deleteRecord(TABLES.TAREAS, recordId);
        return res.status(200).json(result);
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Tareas API error:', error);
    res.status(500).json({ error: error.message });
  }
}
