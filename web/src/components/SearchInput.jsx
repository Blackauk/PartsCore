import { Search } from 'lucide-react';

export default function SearchInput({ placeholder = 'Search...' }) {
  return (
    <div className="flex-1 max-w-xl">
      <label className="sr-only">Search</label>
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4 pointer-events-none" />
        <input
          type="text"
          placeholder={placeholder}
          className="w-full pl-10 pr-3 py-1.5 text-sm rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
    </div>
  );
}


