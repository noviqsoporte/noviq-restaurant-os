import { fetchRecords, createRecord, updateRecord, deleteRecord, TABLES } from '../../../lib/airtable';

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET': {
        const records = await fetchRecords(TABLES.RESERVAS, {
          sort: [{ field: 'fecha', direction: 'desc' }],
        });
        return res.status(200).json(records);
      }

      case 'POST': {
        const { ID, fecha, hora, nombre, personas, telefono, ocasion_especial, observaciones, anticipo_pagado, estado } = req.body;
        const fields = {};
        if (ID) fields.ID = String(ID);
        if (fecha) fields.fecha = fecha;
        if (hora) fields.hora = hora;
        if (nombre) fields.nombre = nombre;
        if (personas !== undefined) fields.personas = Number(personas);
        if (telefono) fields.telefono = String(telefono);
        if (ocasion_especial) fields.ocasion_especial = ocasion_especial;
        if (observaciones) fields['observaciones (Discapacidades)'] = observaciones;
        if (anticipo_pagado !== undefined) fields.anticipo_pagado = anticipo_pagado;
        if (estado) fields.estado = estado;

        const record = await createRecord(TABLES.RESERVAS, fields);
        return res.status(201).json(record);
      }

      case 'PUT': {
        const { recordId, ...updateFields } = req.body;
        if (!recordId) return res.status(400).json({ error: 'recordId is required' });

        const fields = {};
        if (updateFields.ID !== undefined) fields.ID = String(updateFields.ID);
        if (updateFields.fecha) fields.fecha = updateFields.fecha;
        if (updateFields.hora) fields.hora = updateFields.hora;
        if (updateFields.nombre) fields.nombre = updateFields.nombre;
        if (updateFields.personas !== undefined) fields.personas = Number(updateFields.personas);
        if (updateFields.telefono) fields.telefono = String(updateFields.telefono);
        if (updateFields.ocasion_especial !== undefined) fields.ocasion_especial = updateFields.ocasion_especial;
        if (updateFields.observaciones !== undefined) fields['observaciones (Discapacidades)'] = updateFields.observaciones;
        if (updateFields.anticipo_pagado !== undefined) fields.anticipo_pagado = updateFields.anticipo_pagado;
        if (updateFields.estado) fields.estado = updateFields.estado;

        const record = await updateRecord(TABLES.RESERVAS, recordId, fields);
        return res.status(200).json(record);
      }

      case 'DELETE': {
        const { recordId } = req.body;
        if (!recordId) return res.status(400).json({ error: 'recordId is required' });
        const result = await deleteRecord(TABLES.RESERVAS, recordId);
        return res.status(200).json(result);
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Reservas API error:', error);
    res.status(500).json({ error: error.message });
  }
}
