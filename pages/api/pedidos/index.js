import { fetchRecords, createRecord, updateRecord, deleteRecord, TABLES } from '../../../lib/airtable';

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET': {
        const records = await fetchRecords(TABLES.PEDIDOS, {
          sort: [{ field: 'Fecha', direction: 'desc' }],
        });
        return res.status(200).json(records);
      }

      case 'POST': {
        const body = req.body;
        const fields = {};
        if (body['Pedido ID']) fields['Pedido ID'] = Number(body['Pedido ID']);
        if (body.Nombre) fields.Nombre = body.Nombre;
        if (body.Telefono) fields.Telefono = String(body.Telefono);
        if (body.Fecha) fields.Fecha = body.Fecha;
        if (body.Ubicación) fields['Ubicación'] = body['Ubicación'];
        if (body['Monto Total'] !== undefined) fields['Monto Total'] = Number(body['Monto Total']);
        if (body.Alimentos) fields.Alimentos = body.Alimentos;
        if (body['Metodo de Pago']) fields['Metodo de Pago'] = body['Metodo de Pago'];
        if (body.Estado) fields.Estado = body.Estado;

        const record = await createRecord(TABLES.PEDIDOS, fields);
        return res.status(201).json(record);
      }

      case 'PUT': {
        const { recordId, ...updateFields } = req.body;
        if (!recordId) return res.status(400).json({ error: 'recordId is required' });

        const fields = {};
        if (updateFields['Pedido ID'] !== undefined) fields['Pedido ID'] = Number(updateFields['Pedido ID']);
        if (updateFields.Nombre) fields.Nombre = updateFields.Nombre;
        if (updateFields.Telefono) fields.Telefono = String(updateFields.Telefono);
        if (updateFields.Fecha) fields.Fecha = updateFields.Fecha;
        if (updateFields['Ubicación']) fields['Ubicación'] = updateFields['Ubicación'];
        if (updateFields['Monto Total'] !== undefined) fields['Monto Total'] = Number(updateFields['Monto Total']);
        if (updateFields.Alimentos) fields.Alimentos = updateFields.Alimentos;
        if (updateFields['Metodo de Pago']) fields['Metodo de Pago'] = updateFields['Metodo de Pago'];
        if (updateFields.Estado) fields.Estado = updateFields.Estado;

        const record = await updateRecord(TABLES.PEDIDOS, recordId, fields);
        return res.status(200).json(record);
      }

      case 'DELETE': {
        const { recordId } = req.body;
        if (!recordId) return res.status(400).json({ error: 'recordId is required' });
        const result = await deleteRecord(TABLES.PEDIDOS, recordId);
        return res.status(200).json(result);
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Pedidos API error:', error);
    res.status(500).json({ error: error.message });
  }
}
