// Updated: Use PageControlsContext to get controls from child pages
import { Outlet } from 'react-router-dom';
import TabbedLayout from '../components/TabbedLayout.jsx';
import { PageControlsProvider, usePageControls } from '../contexts/PageControlsContext.jsx';

const tabs = [
  { label: 'Sites', to: '/locations' },
  { label: 'Zones', to: '/locations/zones' },
  { label: 'Bins', to: '/locations/bins' },
];

function LocationsContent() {
  const { controls } = usePageControls();
  return <TabbedLayout tabs={tabs} rightControls={controls} />;
}

export default function Locations() {
  return (
    <PageControlsProvider>
      <LocationsContent />
    </PageControlsProvider>
  );
}
