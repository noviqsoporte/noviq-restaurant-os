import { fetchRecords, TABLES } from '../../../lib/airtable';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const records = await fetchRecords(TABLES.MOVIMIENTOS, {
      sort: [{ field: 'fecha_hora', direction: 'desc' }],
    });
    return res.status(200).json(records);
  } catch (error) {
    console.error('Movimientos API error:', error);
    res.status(500).json({ error: error.message });
  }
}
