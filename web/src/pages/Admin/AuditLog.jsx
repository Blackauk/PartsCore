// Root cause: TabbedLayout didn't render <Outlet/>, so child pages never mounted. Data was also not safely defaulted.
// Fix: Added <Outlet/> to TabbedLayout. Added safe array defaults.

import TableCard from '../../components/TableCard.jsx';
import { auditLog } from '../../data/mockAdmin.js';
import { exportToCSV } from '../../utils/csvUtils.js';

export default function AuditLog() {
  // Safe defaults
  const log = Array.isArray(auditLog) ? auditLog : [];

  const columns = [
    { key: 'time', label: 'Time' },
    { key: 'user', label: 'User' },
    { key: 'action', label: 'Action' },
    { key: 'target', label: 'Target' },
    { key: 'details', label: 'Details' },
    { key: 'ip', label: 'IP' },
  ];
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold">Audit Log</h1>
        <button className="btn ml-auto" onClick={() => exportToCSV('audit_log.csv', columns.map(c=>c.key), log)}>Export CSV</button>
      </div>
      <TableCard title="Recent Events" columns={columns} rows={log} />
    </div>
  );
}




