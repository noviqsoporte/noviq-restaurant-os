import { fetchRecords, TABLES } from '../../../lib/airtable';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const records = await fetchRecords(TABLES.USUARIOS);
    return res.status(200).json(records);
  } catch (error) {
    console.error('Usuarios API error:', error);
    res.status(500).json({ error: error.message });
  }
}
