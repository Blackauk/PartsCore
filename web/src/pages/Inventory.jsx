// Updated: Use PageControlsContext to get controls from child pages
import { Outlet } from 'react-router-dom';
import TabbedLayout from '../components/TabbedLayout.jsx';
import { PageControlsProvider, usePageControls } from '../contexts/PageControlsContext.jsx';

const tabs = [
  { label: 'Master List', to: '/inventory' },
  { label: 'Items', to: '/inventory/items' },
  { label: 'Catalog', to: '/inventory/catalog' },
  { label: 'Low-Stock', to: '/inventory/low-stock' },
  { label: 'Fast-Movers', to: '/inventory/fast-movers' },
];

function InventoryContent() {
  const { controls } = usePageControls();
  return <TabbedLayout tabs={tabs} rightControls={controls} />;
}

export default function Inventory() {
  return (
    <PageControlsProvider>
      <InventoryContent />
    </PageControlsProvider>
  );
}
