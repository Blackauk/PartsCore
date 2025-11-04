export default function RecentFeed({ items = [] }) {
  return (
    <ul className="space-y-2 text-sm">
      {items.slice(0,10).map((i,idx) => (
        <li key={idx} className="flex items-start gap-2">
          <span className="inline-block w-10 text-xs text-zinc-500">{i.ts}</span>
          <span>{i.text}</span>
        </li>
      ))}
    </ul>
  );
}


