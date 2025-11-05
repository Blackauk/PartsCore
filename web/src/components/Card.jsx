import { ChevronDown, ChevronRight } from 'lucide-react';
import { useCollapsiblePanel } from '../hooks/useCollapsiblePanel.js';

export default function Card({ title, action, children, collapsible, storageKey }) {
  const [isExpanded, toggle] = useCollapsiblePanel(
    collapsible && storageKey ? storageKey : null,
    true
  );

  const showContent = !collapsible || isExpanded;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 shadow-sm">
      <div 
        className={`p-3 border-b border-zinc-800 flex items-center justify-between ${
          collapsible ? 'cursor-pointer hover:bg-zinc-900/50 transition-colors' : ''
        }`}
        onClick={collapsible ? toggle : undefined}
      >
        <div className="flex items-center gap-2">
          {collapsible && (
            <span className="text-zinc-400">
              {isExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </span>
          )}
          <div className="text-sm font-medium">{title}</div>
        </div>
        {action}
      </div>
      {showContent && <div className="p-3">{children}</div>}
    </div>
  );
}


