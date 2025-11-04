import { Outlet } from 'react-router-dom';
import TabbedLayout from '../components/TabbedLayout.jsx';

const tabs = [
  { label: 'Analytics', to: '/reports' },
  { label: 'Transactions', to: '/reports/transactions' },
  { label: 'Exports', to: '/reports/exports' },
];

export default function Reports() {
  return <TabbedLayout tabs={tabs} />;
}
