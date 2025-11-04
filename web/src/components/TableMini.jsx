// Updated: Center-aligned headers and cells to match app-wide table styling
export default function TableMini({ columns = [], rows = [] }) {
  return (
    <div className="overflow-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-center text-zinc-400">
            {columns.map((c) => <th key={c.key || c.label} className="py-2 pr-3">{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-zinc-800">
              {columns.map((c) => (
                <td key={c.key || c.label} className="py-2 pr-3 text-center">{c.render ? c.render(r) : r[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


