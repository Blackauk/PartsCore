import TabbedLayout from '../../components/TabbedLayout.jsx';

export default function Deliveries() {
  const tabs = [
    { label: 'Pending Deliveries', to: '/procurement/deliveries/pending' },
    { label: 'GRN History', to: '/procurement/deliveries' },
  ];
  return <TabbedLayout tabs={tabs} />;
}

