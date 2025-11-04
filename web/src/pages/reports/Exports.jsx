import { useMemo, useState } from 'react';
import { exportToCSV } from '../../utils/csvUtils.js';
import { stockByCategory, stockBySite, topIssued, usageTrend, transactions } from '../../data/mockReports.js';

function Card({ title, rows, headers }) {
  const preview = useMemo(() => rows.slice(0,5), [rows]);
  const [open, setOpen] = useState(false);
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="font-medium">{title}</h3>
        <div className="ml-auto flex gap-2">
          <button className="btn" onClick={()=> exportToCSV(`${title.replace(/\s+/g,'_').toLowerCase()}.csv`, headers, rows)}>Export CSV</button>
          <button className="btn" onClick={()=> setOpen(true)}>Schedule Export</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-zinc-400">
            <tr>{headers.map(h=> <th key={h} className="px-2 py-1 text-left">{h}</th>)}</tr>
          </thead>
          <tbody>
            {preview.map((r,i)=> (
              <tr key={i} className="border-t border-zinc-800">
                {headers.map(h=> <td key={h} className="px-2 py-1 whitespace-nowrap">{r[h]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70">
          <div className="card p-6 w-full max-w-md">
            <h4 className="text-lg font-semibold mb-3">Schedule Export (mock)</h4>
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-zinc-400 mb-1">Dataset</label>
                <input className="input w-full" value={title} readOnly />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Frequency</label>
                <select className="input w-full"><option>Weekly</option><option>Monthly</option></select>
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Recipients</label>
                <input className="input w-full" placeholder="a@x.com, b@y.com" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button className="btn" onClick={()=> setOpen(false)}>Cancel</button>
                <button className="btn" onClick={()=> { alert('Scheduled (mock)'); setOpen(false); }}>Schedule</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Exports() {
  const cards = [
    { title: 'Stock Snapshot (by Category)', rows: stockByCategory, headers: ['category','qty','value'] },
    { title: 'Stock by Site', rows: stockBySite, headers: ['site','qty','value'] },
    { title: 'Top Issued (30d)', rows: topIssued, headers: ['sku','name','qty'] },
    { title: 'Usage Trend (90d)', rows: usageTrend, headers: ['date','issues','receipts'] },
    { title: 'Transactions Log', rows: transactions, headers: ['date','type','ref','sku','item','qty','site','user'] },
  ];
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Exports</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map(c=> <Card key={c.title} {...c} />)}
      </div>
    </div>
  );
}

