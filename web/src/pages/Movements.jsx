import { Outlet } from 'react-router-dom';
import TabbedLayout from '../components/TabbedLayout.jsx';

const tabs = [
  { label: 'Receive', to: '/movements' },
  { label: 'Issue', to: '/movements/issue' },
  { label: 'Transfer', to: '/movements/transfer' },
  { label: 'Adjust', to: '/movements/adjust' },
];

export default function Movements() {
  return <TabbedLayout tabs={tabs} />;
}

