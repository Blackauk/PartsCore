// Updated: Use PageControlsContext to get controls from child pages
import { Outlet } from 'react-router-dom';
import TabbedLayout from '../components/TabbedLayout.jsx';
import { PageControlsProvider, usePageControls } from '../contexts/PageControlsContext.jsx';
import { INVENTORY_TABS } from '../constants/inventoryTabs.js';

// Use INVENTORY_TABS as single source of truth, excluding Movements (it's a separate section)
// Movements is included in sidebar but not in tabs row
const tabs = INVENTORY_TABS
  .filter(tab => tab.key !== 'movements') // Movements is separate section, not in tab row
  .map(tab => ({ label: tab.label, to: tab.path }));

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
