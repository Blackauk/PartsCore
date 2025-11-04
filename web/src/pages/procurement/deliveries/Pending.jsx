import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TableCard from '../../../components/TableCard.jsx';
import ReceiveDeliveryWizard from '../../../components/receiving/ReceiveDeliveryWizard.jsx';
import { pendingDeliveries, daysOverdue } from '../../../data/mockDeliveries.js';
import { getPoById } from '../../../data/mockReceiving.js';
import { buildChaseMailto } from '../../../lib/email.js';
import { useAuthStore } from '../../../store/authStore.js';

export default function PendingDeliveries() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedPoId, setSelectedPoId] = useState(null);
  const [chaseDisabled, setChaseDisabled] = useState(new Set());

  const handleChase = (row) => {
    if (!row.poId || chaseDisabled.has(row.poId)) return;
    
    const poData = getPoById(row.poId) || {};
    const daysOver = daysOverdue(row.expectedDate);
    
    // Only allow chase if overdue
    if (daysOver <= 0) return;
    
    // Get overdue line items (lines that haven't been fully received)
    const overdueItems = (poData.lines || []).filter(line => {
      const qtyRemaining = line.qtyRemaining || (line.qty - (line.qtyReceived || 0));
      return qtyRemaining > 0;
    }).map(line => ({
      partNumber: line.partNo || line.sku,
      description: line.description,
      qty: line.qtyRemaining || line.qty,
      dueDate: row.expectedDate,
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

  const filtered = useMemo(() => pendingDeliveries.filter((r) => {
    const matchesSearch = search === '' || r.poId.toLowerCase().includes(search.toLowerCase()) || r.supplier.toLowerCase().includes(search.toLowerCase()) || r.site.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !status || r.status === status;
    return matchesSearch && matchesStatus;
  }), [search, status]);

  const columns = [
    { key: 'poId', label: 'PO' },
    { key: 'supplier', label: 'Supplier' },
    { key: 'site', label: 'Site' },
    { key: 'expectedDate', label: 'Expected Delivery Date' },
    { key: 'status', label: 'Status' },
    { key: 'overdue', label: 'Days Overdue', render: (r) => {
      const d = daysOverdue(r.expectedDate);
      return d > 0 ? <span className="text-red-400">{d}</span> : '-';
    }},
    { key: 'actions', label: '', render: (r) => {
      const isOverdue = daysOverdue(r.expectedDate) > 0;
      return (
        <div className="flex gap-2 justify-end">
          <button
            className="btn-secondary btn-sm"
            onClick={() => navigate(`/procurement/purchase-orders/${r.poId}`)}
            disabled={!r.poId}
            aria-label={`View PO ${r.poId}`}
          >
            View PO
          </button>
          {isOverdue && (
            <button
              className="btn btn-sm"
              onClick={() => handleChase(r)}
              disabled={!r.poId || chaseDisabled.has(r.poId)}
              aria-label={`Chase PO ${r.poId}`}
            >
              {chaseDisabled.has(r.poId) ? 'Opening...' : 'Chase'}
            </button>
          )}
          <button
            className="btn btn-sm"
            onClick={() => {
              setSelectedPoId(r.poId);
              setWizardOpen(true);
            }}
          >
            Receive Delivery
          </button>
        </div>
      );
    }},
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 w-full sm:w-auto items-stretch">
        <select className="hidden sm:block input text-sm px-2" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>
          {['Ordered','Shipped','Delayed','Arrived'].map((s) => (<option key={s} value={s}>{s}</option>))}
        </select>
        <div className="relative flex-1 sm:flex-initial">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
          <input className="w-full sm:w-64 pl-9 pr-3 py-1.5 text-sm rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <TableCard title="Pending Deliveries" columns={columns} rows={filtered} />

      <ReceiveDeliveryWizard
        open={wizardOpen}
        onClose={() => {
          setWizardOpen(false);
          setSelectedPoId(null);
        }}
        poId={selectedPoId}
        onSubmitted={(grnId) => {
          navigate(`/procurement/deliveries/${grnId}`);
        }}
      />
    </div>
  );
}


