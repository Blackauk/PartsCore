export default function Integrations() {
  const cards = [
    { name: 'Email', status: 'Configured' },
    { name: 'S3/Blob', status: 'Not configured' },
    { name: 'Power BI', status: 'Not configured' },
    { name: 'Webhooks', status: 'Configured' },
  ];
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Integrations</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {cards.map((c) => (
          <div key={c.name} className="card p-4">
            <div className="flex items-center justify-between">
              <div className="font-medium">{c.name}</div>
              <span className="text-xs text-zinc-400">{c.status}</span>
            </div>
            <div className="mt-3">
              <button className="btn">Configure</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}




