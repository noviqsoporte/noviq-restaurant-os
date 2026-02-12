import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_PAT }).base(process.env.AIRTABLE_BASE_ID);

// Table names in Airtable
export const TABLES = {
  ITEMS: 'Items',
  MOVIMIENTOS: 'Movimientos',
  VENTAS: 'Ventas',
  RESERVAS: 'Reservas',
  PEDIDOS: 'Pedidos',
  TAREAS: 'Tareas',
  USUARIOS: 'Usuarios',
};

// Generic fetch all records from a table
export async function fetchRecords(tableName, options = {}) {
  const records = [];
  const queryOptions = {};

  if (options.filterByFormula) queryOptions.filterByFormula = options.filterByFormula;
  if (options.sort) queryOptions.sort = options.sort;
  if (options.maxRecords) queryOptions.maxRecords = options.maxRecords;
  if (options.fields) queryOptions.fields = options.fields;

  await base(tableName)
    .select(queryOptions)
    .eachPage((pageRecords, fetchNextPage) => {
      pageRecords.forEach((record) => {
        records.push({
          id: record.id,
          ...record.fields,
        });
      });
      fetchNextPage();
    });

  return records;
}

// Create a record
export async function createRecord(tableName, fields) {
  const record = await base(tableName).create([{ fields }]);
  return {
    id: record[0].id,
    ...record[0].fields,
  };
}

// Update a record
export async function updateRecord(tableName, recordId, fields) {
  const record = await base(tableName).update([
    { id: recordId, fields },
  ]);
  return {
    id: record[0].id,
    ...record[0].fields,
  };
}

// Delete a record
export async function deleteRecord(tableName, recordId) {
  const record = await base(tableName).destroy([recordId]);
  return { id: record[0].id, deleted: true };
}

export default base;
