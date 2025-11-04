import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/AppShell.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Dashboard from './pages/dashboard/index.jsx';

// Auth pages
import LoginPage from './pages/auth/LoginPage.jsx';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/auth/ResetPasswordPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';

// Section layouts
import Movements from './pages/Movements.jsx';
import Inventory from './pages/Inventory.jsx';
import Locations from './pages/Locations.jsx';
import Procurement from './pages/Procurement.jsx';
import Reports from './pages/Reports.jsx';
import Admin from './pages/Admin.jsx';

// Movements sub-pages
import Receive from './pages/movements/Receive.jsx';
import Issue from './pages/movements/Issue.jsx';
import Transfer from './pages/movements/Transfer.jsx';
import Adjust from './pages/movements/Adjust.jsx';

// Inventory sub-pages
import Items from './pages/inventory/Items.jsx';
import Catalog from './pages/inventory/Catalog.jsx';
import LowStock from './pages/inventory/LowStock.jsx';
import FastMovers from './pages/inventory/FastMovers.jsx';
import MasterList from './pages/inventory/MasterList.jsx';

// Locations sub-pages
import SitesPage from './pages/locations/Sites.jsx';
import ZonesPage from './pages/locations/Zones.jsx';
import BinsPage from './pages/locations/Bins.jsx';

// Procurement sub-pages
import PurchaseOrders from './pages/procurement/PurchaseOrders.jsx';
import PODetail from './pages/procurement/PODetail.jsx';
import Deliveries from './pages/procurement/Deliveries.jsx';
import PendingDeliveries from './pages/procurement/deliveries/Pending.jsx';
import GrnHistory from './pages/procurement/deliveries/GrnHistory.jsx';
import GrnDetail from './pages/procurement/deliveries/GrnDetail.jsx';
import Returns from './pages/procurement/Returns.jsx';
import Suppliers from './pages/procurement/Suppliers.jsx';

// Reports sub-pages
import Analytics from './pages/reports/Analytics.jsx';
import Transactions from './pages/reports/Transactions.jsx';
import Exports from './pages/reports/Exports.jsx';

// Admin sub-pages
import UsersRoles from './pages/admin/UsersRoles.jsx';
import TeamsSites from './pages/admin/TeamsSites.jsx';
import PermissionsMatrix from './pages/admin/PermissionsMatrix.jsx';
import Integrations from './pages/admin/Integrations.jsx';
import AuditLog from './pages/admin/AuditLog.jsx';
import LabelsQR from './pages/admin/LabelsQR.jsx';
import Settings from './pages/Settings.jsx';
import HelpCenter from './pages/HelpCenter.jsx';
import Feedback from './pages/Feedback.jsx';
import ItemDetail from './pages/catalog/ItemDetail.jsx';
import ItemEdit from './pages/catalog/ItemEdit.jsx';
import History from './pages/inventory/History.jsx';

export default function AppRoutes() {
  // Router is now mounted at top level in main.jsx
  // This component only returns Routes (no Router wrapper)
  return (
    <Routes>
        {/* Public auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected app routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppShell>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />

                  <Route path="/movements" element={<Movements />}>
                    <Route index element={<Receive />} />
                    <Route path="issue" element={<Issue />} />
                    <Route path="transfer" element={<Transfer />} />
                    <Route path="adjust" element={<Adjust />} />
                  </Route>

                  <Route path="/inventory" element={<Inventory />}>
                    <Route index element={<Navigate to="/inventory/master-list" replace />} />
                    <Route path="master-list" element={<MasterList key="master-list" />} />
                    <Route path="master" element={<Navigate to="/inventory/master-list" replace />} />
                    <Route path="items" element={<Items key="items" />} />
                    <Route path="catalog" element={<Catalog key="catalog" />} />
                    <Route path="low-stock" element={<LowStock key="low-stock" />} />
                    <Route path="fast-movers" element={<FastMovers key="fast-movers" />} />
                    <Route path="movements" element={<Navigate to="/movements" replace />} />
                    <Route path="history" element={<History key="history" />} />
                  </Route>
                  
                  <Route path="/catalog/items/:sku" element={<ItemDetail />} />
                  <Route path="/catalog/items/:sku/edit" element={<ItemEdit />} />

                  <Route path="/locations" element={<Locations />}>
                    <Route index element={<SitesPage />} />
                    <Route path="zones" element={<ZonesPage />} />
                    <Route path="bins" element={<BinsPage />} />
                  </Route>

                  <Route path="/procurement" element={<Procurement />}>
                    <Route index element={<PurchaseOrders />} />
                    <Route path="purchase-orders/:poId" element={<PODetail />} />
                    <Route path="deliveries" element={<Deliveries />} >
                      <Route index element={<GrnHistory />} />
                      <Route path="pending" element={<PendingDeliveries />} />
                      <Route path=":grnId" element={<GrnDetail />} />
                      <Route path="new" element={<GrnDetail />} />
                    </Route>
                    <Route path="returns" element={<Returns />} />
                    <Route path="suppliers" element={<Suppliers />} />
                  </Route>

                  <Route path="/reports" element={<Reports />}>
                    <Route index element={<Analytics />} />
                    <Route path="transactions" element={<Transactions />} />
                    <Route path="exports" element={<Exports />} />
                  </Route>

                  <Route path="/admin" element={<Admin />}>
                    <Route index element={<UsersRoles />} />
                    <Route path="teams" element={<TeamsSites />} />
                    <Route path="permissions" element={<PermissionsMatrix />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="labels" element={<LabelsQR />} />
                    <Route path="integrations" element={<Integrations />} />
                    <Route path="audit" element={<AuditLog />} />
                  </Route>

                  <Route path="/help" element={<HelpCenter />} />
                  <Route path="/help-centre" element={<HelpCenter />} />
                  <Route path="/feedback" element={<Feedback />} />
                  
                  {/* Redirect /manage to /admin for backward compatibility */}
                  <Route path="/manage" element={<Navigate to="/admin" replace />} />
                  <Route path="/manage/*" element={<Navigate to="/admin" replace />} />
                  
                  {/* Redirect /labels-qr to /admin/labels */}
                  <Route path="/labels-qr" element={<Navigate to="/admin/labels" replace />} />
                  
                  {/* Legacy route redirects */}
                  <Route path="/grns" element={<Navigate to="/procurement/deliveries" replace />} />
                  <Route path="/labels" element={<Navigate to="/labels-qr" replace />} />
                </Routes>
              </AppShell>
            </ProtectedRoute>
          }
        />
    </Routes>
  );
}
