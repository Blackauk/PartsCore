import { lazy, Suspense } from 'react';
import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom';
import SparePartsLayout from '../components/SparePartsLayout.jsx';

// Dashboard
const DashboardHome = lazy(() => import('../pages/Dashboard/DashboardHome.jsx'));

// Catalogue
const AllParts = lazy(() => import('../pages/Catalogue/AllParts.jsx'));
const NewPart = lazy(() => import('../pages/Catalogue/NewPart.jsx'));

// Stock
const LiveView = lazy(() => import('../pages/Stock/LiveView.jsx'));
const LowStock = lazy(() => import('../pages/Stock/LowStock.jsx'));

// Transactions
const BookIn = lazy(() => import('../pages/Transactions/BookIn.jsx'));
const BookOut = lazy(() => import('../pages/Transactions/BookOut.jsx'));
const History = lazy(() => import('../pages/Transactions/History.jsx'));
const Scanning = lazy(() => import('../pages/Transactions/Scanning.jsx'));

// Orders
const Requisitions = lazy(() => import('../pages/Orders/Requisitions.jsx'));
const PurchaseOrders = lazy(() => import('../pages/Orders/PurchaseOrders.jsx'));

// Suppliers
const SupplierList = lazy(() => import('../pages/Suppliers/SupplierList.jsx'));

// Analytics
const UsageByAsset = lazy(() => import('../pages/Analytics/UsageByAsset.jsx'));
const UsageBySite = lazy(() => import('../pages/Analytics/UsageBySite.jsx'));

// Admin
const UsersRoles = lazy(() => import('../pages/Admin/UsersRoles.jsx'));
const SitesLocations = lazy(() => import('../pages/Admin/SitesLocations.jsx'));
const ReasonCodes = lazy(() => import('../pages/Admin/ReasonCodes.jsx'));
const ImportExport = lazy(() => import('../pages/Admin/ImportExport.jsx'));

export default function AppRouter() {
  // Router toggle: HashRouter for production (GitHub Pages), BrowserRouter for dev
  // Set VITE_USE_HASH=1 in production build, VITE_USE_HASH=0 for development
  const useHash = import.meta.env.VITE_USE_HASH === '1';
  const RouterImpl = useHash ? HashRouter : BrowserRouter;
  
  // Only use basename with BrowserRouter (HashRouter doesn't need it)
  const basename = !useHash ? (import.meta.env.BASE_URL || '/PartsCore/') : undefined;
  
  return (
    <RouterImpl {...(basename ? { basename } : {})}>
      <SparePartsLayout>
        <Suspense fallback={<div className="p-6">Loading...</div>}>
          <Routes>
            <Route path="/" element={<DashboardHome />} />

            <Route path="/catalogue/all-parts" element={<AllParts />} />
            <Route path="/catalogue/new-part" element={<NewPart />} />

            <Route path="/stock/live" element={<LiveView />} />
            <Route path="/stock/low" element={<LowStock />} />

            <Route path="/tx/book-in" element={<BookIn />} />
            <Route path="/tx/book-out" element={<BookOut />} />
            <Route path="/tx/history" element={<History />} />
            <Route path="/tx/scanning" element={<Scanning />} />

            <Route path="/orders/requisitions" element={<Requisitions />} />
            <Route path="/orders/purchase-orders" element={<PurchaseOrders />} />

            <Route path="/suppliers" element={<SupplierList />} />

            <Route path="/analytics/usage-by-asset" element={<UsageByAsset />} />
            <Route path="/analytics/usage-by-site" element={<UsageBySite />} />

            <Route path="/admin/users-roles" element={<UsersRoles />} />
            <Route path="/admin/sites-locations" element={<SitesLocations />} />
            <Route path="/admin/reason-codes" element={<ReasonCodes />} />
            <Route path="/admin/import-export" element={<ImportExport />} />
          </Routes>
        </Suspense>
      </SparePartsLayout>
    </BrowserRouter>
  );
}


