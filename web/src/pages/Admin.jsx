import { Outlet } from 'react-router-dom';
import TabbedLayout from '../components/TabbedLayout.jsx';

const tabs = [
  { label: 'Users & Roles', to: '/admin' },
  { label: 'Teams & Sites', to: '/admin/teams' },
  { label: 'Permissions', to: '/admin/permissions' },
  { label: 'Settings', to: '/admin/settings' },
  { label: 'Integrations', to: '/admin/integrations' },
  { label: 'Audit Log', to: '/admin/audit' },
];

export default function Admin() {
  return <TabbedLayout tabs={tabs} />;
}

