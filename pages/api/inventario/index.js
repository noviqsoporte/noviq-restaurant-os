import { fetchRecords, createRecord, updateRecord, TABLES } from '../../../lib/airtable';

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET': {
        const records = await fetchRecords(TABLES.ITEMS, {
          sort: [{ field: 'nombre', direction: 'asc' }],
        });
        return res.status(200).json(records);
      }

      case 'POST': {
        const body = req.body;
        const fields = {};
        if (body.nombre) fields.nombre = body.nombre;
        if (body.unidad_base) fields.unidad_base = body.unidad_base;
        if (body.min_level !== undefined) fields.min_level = Number(body.min_level);
        if (body.stock_ideal !== undefined) fields.stock_ideal = Number(body.stock_ideal);
        if (body.limite_cocina !== undefined) fields.limite_cocina = Number(body.limite_cocina);
        if (body.categoria) fields.categoria = body.categoria;
        if (body.subcategoria) fields.subcategoria = body.subcategoria;
        if (body.proveedor) fields.proveedor = body.proveedor;
        if (body.activo !== undefined) fields.activo = body.activo;

        const record = await createRecord(TABLES.ITEMS, fields);
        return res.status(201).json(record);
      }

      case 'PUT': {
        const { recordId, ...updateFields } = req.body;
        if (!recordId) return res.status(400).json({ error: 'recordId is required' });

        const fields = {};
        if (updateFields.nombre) fields.nombre = updateFields.nombre;
        if (updateFields.unidad_base) fields.unidad_base = updateFields.unidad_base;
        if (updateFields.min_level !== undefined) fields.min_level = Number(updateFields.min_level);
        if (updateFields.stock_ideal !== undefined) fields.stock_ideal = Number(updateFields.stock_ideal);
        if (updateFields.limite_cocina !== undefined) fields.limite_cocina = Number(updateFields.limite_cocina);
        if (updateFields.categoria) fields.categoria = updateFields.categoria;
        if (updateFields.subcategoria) fields.subcategoria = updateFields.subcategoria;
        if (updateFields.proveedor) fields.proveedor = updateFields.proveedor;

        const record = await updateRecord(TABLES.ITEMS, recordId, fields);
        return res.status(200).json(record);
      }

      case 'PATCH': {
        // Toggle activo/desactivar
        const { recordId, activo } = req.body;
        if (!recordId) return res.status(400).json({ error: 'recordId is required' });

        const record = await updateRecord(TABLES.ITEMS, recordId, { activo: !!activo });
        return res.status(200).json(record);
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Inventario API error:', error);
    res.status(500).json({ error: error.message });
  }
}
