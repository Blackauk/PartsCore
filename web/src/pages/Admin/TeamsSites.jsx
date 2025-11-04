// Root cause: TabbedLayout didn't render <Outlet/>, so child pages never mounted. Data was also not safely defaulted.
// Fix: Added <Outlet/> to TabbedLayout. Added safe array defaults.

import TableCard from '../../components/TableCard.jsx';
import { teams } from '../../data/mockAdmin.js';

export default function TeamsSites() {
  // Safe defaults
  const teamsData = Array.isArray(teams) ? teams : [];

  const columns = [
    { key: 'siteCode', label: 'Site Code' },
    { key: 'siteName', label: 'Site Name' },
    { key: 'teamCount', label: 'Teams' },
    { key: 'managers', label: 'Managers' },
    { key: 'status', label: 'Status' },
  ];
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Teams & Sites</h1>
      <TableCard title="Sites" columns={columns} rows={teamsData} />
    </div>
  );
}




