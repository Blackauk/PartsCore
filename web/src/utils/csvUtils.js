export function exportToCSV(filename, headers, rows) {
  const safe = (v) => {
    if (v == null) return '';
    const s = String(v);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };
  const csv = [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => safe(r[h])).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseCSV(file, onComplete) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target.result;
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length === 0) return onComplete({ headers: [], rows: [] });
    const headers = lines[0].split(',').map((h) => h.trim());
    const rows = lines.slice(1).map((line) => {
      const values = line.match(/\"([^\"]*(?:\"\"[^\"]*)*)\"|[^,]+/g) || [];
      const normalized = values.map((v) => v?.replace(/^\"|\"$/g, '').replace(/\"\"/g, '"') ?? '');
      const obj = {};
      headers.forEach((h, i) => (obj[h] = (normalized[i] ?? '').trim()));
      return obj;
    });
    onComplete({ headers, rows });
  };
  reader.readAsText(file);
}


