import { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import KpiCard from '../../components/KpiCard.jsx';
import Card from '../../components/Card.jsx';
import TableMini from '../../components/TableMini.jsx';
import TasksList from '../../components/TasksList.jsx';
import RecentFeed from '../../components/RecentFeed.jsx';
import TopUsedChart from '../../components/TopUsedChart.jsx';
import QuickButtons from '../../components/QuickButtons.jsx';
import * as data from '../../data/mockDashboard.js';
import { formatTime } from '../../lib/date.js';
import CreatePoQuick from '../../components/modals/CreatePoQuick.jsx';
import { getPoById } from '../../data/mockReceiving.js';
import { buildChaseMailto } from '../../lib/email.js';
import { useAuthStore } from '../../store/authStore.js';

export default function CommandCenter() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [poModal, setPoModal] = useState({ open: false, part: null, site: null, triggerRef: null });
  const [chaseDisabled, setChaseDisabled] = useState(new Set());

  function refresh() {
    setLoading(true);
    setTimeout(() => { setLastUpdated(new Date()); setLoading(false); }, 600);
  }

  const kpis = data.kpis;

  // Enrich upcoming/overdue deliveries with full PO data
  const enrichedUpcoming = useMemo(() => {
    return data.upcomingDeliveries.map(row => {
      const poData = getPoById(row.poId);
      return {
        ...row,
        poData, // Include full PO data for access to supplier email and lines
      };
    });
  }, []);

  const enrichedOverdue = useMemo(() => {
    return data.overdueDeliveries.map(row => {
      const poData = getPoById(row.poId);
      return {
        ...row,
        poData, // Include full PO data for access to supplier email and lines
      };
    });
  }, []);

  const handleChase = (row) => {
    if (!row.poId || chaseDisabled.has(row.poId)) return;
    
    const poData = getPoById(row.poId) || {};
    
    // Get overdue line items (lines that haven't been fully received)
    const overdueItems = (poData.lines || []).filter(line => {
      const qtyRemaining = line.qtyRemaining || (line.qty - (line.qtyReceived || 0));
      return qtyRemaining > 0;
    }).map(line => ({
      partNumber: line.partNo || line.sku,
      description: line.description,
      qty: line.qtyRemaining || line.qty,
      dueDate: poData.expectedDate,
    }));

    const mailto = buildChaseMailto({
      to: poData.supplierEmail,
      poNumber: row.poId,
      supplierName: poData.supplier || row.supplier,
      items: overdueItems.length > 0 ? overdueItems : [{ 
        partNumber: 'Multiple items',
        qty: 0,
      }],
      userName: currentUser?.name,
    });

    // Disable button temporarily to prevent double-clicks
    setChaseDisabled(prev => new Set(prev).add(row.poId));
    setTimeout(() => {
      setChaseDisabled(prev => {
        const next = new Set(prev);
        next.delete(row.poId);
        return next;
      });
    }, 500);

    // Open email client
    window.location.href = mailto;
  };

  const handleViewPO = (poId) => {
    if (!poId) return;
    navigate(`/procurement/purchase-orders/${poId}`);
  };

  const upcomingCols = [
    { key: 'poId', label: 'PO' },
    { key: 'supplier', label: 'Supplier' },
    { key: 'expectedDate', label: 'Expected Date' },
    { key: 'act', label: '', render: (r) => (
      <button 
        className="btn-secondary btn-xs"
        onClick={() => handleViewPO(r.poId)}
        disabled={!r.poId}
        aria-label={`View PO ${r.poId}`}
      >
        View PO
      </button>
    ) },
  ];
  const overdueCols = [
    { key: 'poId', label: 'PO' },
    { key: 'supplier', label: 'Supplier' },
    { key: 'daysOverdue', label: 'Days Overdue' },
    { key: 'act', label: '', render: (r) => (
      <button 
        className="btn btn-xs"
        onClick={() => handleChase(r)}
        disabled={!r.poId || chaseDisabled.has(r.poId)}
        aria-label={`Chase PO ${r.poId}`}
      >
        {chaseDisabled.has(r.poId) ? 'Opening...' : 'Chase'}
      </button>
    ) },
  ];

  const alertsCols = [
    { key: 'part', label: 'Part' },
    { key: 'site', label: 'Site' },
    { key: 'onHand', label: 'Qty on Hand' },
    { key: 'minStock', label: 'Min Stock' },
    { key: 'act', label: '', render: (r) => (
      <button 
        className="btn btn-xs" 
        onClick={()=>setPoModal({ open: true, part: r.part, site: r.site, triggerRef: null })}
      >
        Create PO
      </button>
    ) },
  ];

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-10 bg-zinc-950/60 backdrop-blur border-b border-zinc-800 -mx-4 px-4 py-3 flex items-center justify-between">
        <div>
          <div className="text-xs text-zinc-400">Store Manager</div>
          <h1 className="text-xl font-semibold">Command Center</h1>
        </div>
        <div className="text-sm text-zinc-400 flex items-center gap-3">
          <span>Last updated: {formatTime(lastUpdated)}</span>
          <button className="btn" onClick={refresh} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh'}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard title="Items Below Min. Stock" value={kpis.lowStockCount} delta={kpis.deltas.lowStockCount} to="/inventory/low-stock" />
        <KpiCard title="Pending Deliveries" value={kpis.pendingDeliveries} delta={kpis.deltas.pendingDeliveries} to="/procurement/deliveries/pending" />
        <KpiCard title="Overdue Deliveries" value={kpis.overdueDeliveries} delta={kpis.deltas.overdueDeliveries} to="/procurement/deliveries/pending" />
        <KpiCard title="Deliveries to Inspect" value={kpis.grnsToInspect} delta={kpis.deltas.grnsToInspect} to="/procurement/deliveries" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Card 
          title="My Tasks" 
          collapsible 
          storageKey="dashboard-panel-my-tasks"
        >
          <TasksList tasks={data.tasks} />
        </Card>
        <Card 
          title="Stock Alerts (Below ROP)" 
          collapsible 
          storageKey="dashboard-panel-stock-alerts"
        >
          <TableMini columns={alertsCols} rows={data.stockAlerts} />
        </Card>
        <Card title="Quick Access">
          <QuickButtons onOpenCreatePO={(triggerRef) => setPoModal({ open: true, part: null, site: null, triggerRef })} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card 
          title="Upcoming Deliveries (7d)" 
          collapsible 
          storageKey="dashboard-panel-pending-deliveries"
        >
          <TableMini columns={upcomingCols} rows={enrichedUpcoming} />
        </Card>
        <Card 
          title="Overdue Deliveries" 
          collapsible 
          storageKey="dashboard-panel-overdue-deliveries"
        >
          <TableMini columns={overdueCols} rows={enrichedOverdue} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card 
          title="Recent Stock Movements" 
          action={<Link className="link" to="/reports/transactions">View all</Link>}
          collapsible 
          storageKey="dashboard-panel-recent-movements"
        >
          <RecentFeed items={data.recentMovements} />
        </Card>
        <Card 
          title="Top 10 Used Parts (30d)" 
          collapsible 
          storageKey="dashboard-panel-top-used-parts"
        >
          <TopUsedChart data={data.topUsedParts30d} />
        </Card>
      </div>

      <CreatePoQuick 
        open={poModal.open} 
        part={poModal.part} 
        site={poModal.site} 
        triggerRef={poModal.triggerRef}
        onClose={()=>setPoModal({ open:false, part:null, site:null, triggerRef:null })} 
      />
    </div>
  );
}


