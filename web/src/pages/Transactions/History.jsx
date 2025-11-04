import { useEffect, useState } from 'react';
import DataTable from '../../components/DataTable.jsx';
import { listTransactions } from '../../api/txApi.js';

export default function History() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    (async () => setRows(await listTransactions()))();
  }, []);

  const cols = [
    { key: 'ts', label: 'Date' },
    { key: 'type', label: 'Type' },
    { key: 'partId', label: 'Part' },
    { key: 'qty', label: 'Qty' },
    { key: 'site', label: 'Site' },
    { key: 'bin', label: 'Bin' },
    { key: 'user', label: 'User' },
  ];

  function toCsv() {
    const header = cols.map((c) => c.label).join(',');
    const lines = rows.map((r) => cols.map((c) => JSON.stringify(r[c.key] ?? '')).join(','));
    const csv = [header, ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'transactions.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Transaction History</h1>
        <button className="btn" onClick={toCsv}>Export CSV</button>
      </div>
      <DataTable columns={cols} rows={rows} />
    </div>
  );
}


