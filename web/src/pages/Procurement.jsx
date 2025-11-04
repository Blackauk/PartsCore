import { Outlet } from 'react-router-dom';
import TabbedLayout from '../components/TabbedLayout.jsx';

const tabs = [
  { label: 'Purchase Orders', to: '/procurement' },
  { label: 'Deliveries / GRNs', to: '/procurement/deliveries' },
  { label: 'Returns / RMAs', to: '/procurement/returns' },
  { label: 'Suppliers', to: '/procurement/suppliers' },
];

export default function Procurement() {
  return <TabbedLayout tabs={tabs} />;
}

