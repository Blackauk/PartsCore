import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import { ArrowLeft, FileText, Download, Edit, Loader2 } from 'lucide-react';
import TableCard from '../../components/TableCard.jsx';
import DocTag from '../../components/DocTag.jsx';
import { getPoById } from '../../data/mockReceiving.js';
import { purchaseOrders } from '../../data/mockProcurement.js';
import { exportPOToPdf } from '../../lib/pdf.js';
import { useAuthStore } from '../../store/authStore.js';
import { toast } from '../../lib/toast.js';
import { formatCurrency } from '../../lib/currency.js';
import { useSettings } from '../../context/SettingsContext.jsx';

export default function PODetail() {
  const { poId } = useParams();
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const { settings } = useSettings();
  const [isExporting, setIsExporting] = useState(false);
  const [attachments, setAttachments] = useState([]);

  // Try both data sources
  const po = useMemo(() => {
    // First try receiving data (has detailed lines)
    let data = getPoById(poId);
    if (!data) {
      // Then try procurement data
      data = purchaseOrders.find(p => p.id === poId);
    }
    return data;
  }, [poId]);

  // Load attachments from localStorage
  useEffect(() => {
    if (!poId) return;
    const stored = localStorage.getItem(`po-attachments-${poId}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAttachments(parsed);
      } catch (e) {
        console.error('Failed to load attachments', e);
      }
    }
  }, [poId]);

  // Save attachments to localStorage
  useEffect(() => {
    if (!poId || attachments.length === 0) return;
    localStorage.setItem(`po-attachments-${poId}`, JSON.stringify(attachments));
  }, [attachments, poId]);

  const handleExportPdf = async () => {
    if (!po || isExporting) return;
    setIsExporting(true);
    try {
      const { blob, filename } = await exportPOToPdf(po.id);
      
      // Auto-attach the PDF to PO
      const newAttachment = {
        id: crypto.randomUUID(),
        name: filename,
        size: blob.size,
        type: 'application/pdf',
        uploadedBy: currentUser?.name || 'System',
        uploadedAt: new Date().toISOString(),
        source: 'Exported from PO',
      };
      
      setAttachments(prev => [...prev, newAttachment]);
      toast('PDF exported and attached to PO');
    } catch (error) {
      console.error('Failed to export PDF:', error);
      toast('Failed to export PDF', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const columns = [
    { key: 'lineNo', label: 'Line' },
    { key: 'sku', label: 'SKU/Part', render: (r) => r.sku || r.partNo },
    { key: 'description', label: 'Description', render: (r) => r.description || r.name },
    { key: 'qty', label: 'Qty Ordered' },
    { key: 'qtyReceived', label: 'Received', render: (r) => r.qtyReceived || 0 },
    { key: 'qtyRemaining', label: 'Outstanding', render: (r) => r.qtyRemaining || (r.qty - (r.qtyReceived || 0)) },
    { key: 'unitPrice', label: 'Unit Price', render: (r) => r.unitPrice ? formatCurrency(r.unitPrice, settings.currency) : '-' },
    { key: 'lineTotal', label: 'Total', render: (r) => r.lineTotal ? formatCurrency(r.lineTotal, settings.currency) : '-' },
  ];

  if (!po) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="btn-secondary">
            <ArrowLeft size={16} />
            Back
          </button>
        </div>
        <div className="card p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">PO Not Found</h2>
          <p className="text-secondary">The purchase order {poId} could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header - Outside print area */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="btn-secondary">
              <ArrowLeft size={16} />
              Back
            </button>
          </div>
          <div className="text-xs text-secondary mt-2">Purchase Order</div>
          <h1 className="text-xl font-semibold">{po.id}</h1>
          <div className="text-sm text-secondary">
            Supplier: {po.supplier} · Site: {po.site}
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            className="btn-secondary" 
            onClick={handleExportPdf}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download size={16} />
            )}
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </button>
          <button className="btn">
            <Edit size={16} />
            Edit PO
          </button>
        </div>
      </div>

      {/* Printable area - this gets exported to PDF */}
      <div id="po-print-area" className="space-y-4">
        {/* PO Header Info */}
        <div className="card p-4">
          <div className="mb-4">
            <h2 className="text-lg font-bold mb-2">Purchase Order {po.id}</h2>
            <div className="text-sm space-y-1">
              <div><span className="font-medium">Supplier:</span> {po.supplier}</div>
              <div><span className="font-medium">Site:</span> {po.site}</div>
            </div>
          </div>
          <div className="grid md:grid-cols-4 gap-4 pt-4 border-t border-base">
            <div>
              <div className="text-xs text-secondary mb-1">Order Date</div>
              <div className="font-medium">{po.orderDate}</div>
            </div>
            <div>
              <div className="text-xs text-secondary mb-1">Expected Date</div>
              <div className="font-medium">{po.expectedDate}</div>
            </div>
            <div>
              <div className="text-xs text-secondary mb-1">Status</div>
              <div className="font-medium">{po.status}</div>
            </div>
            <div>
              <div className="text-xs text-secondary mb-1">Total Value</div>
              <div className="font-medium">{formatCurrency(po.lines?.reduce((sum, l) => sum + (l.lineTotal || l.qty * (l.unitPrice || 0)), 0) || 0, settings.currency)}</div>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="card p-0 overflow-hidden">
          <div className="p-4 border-b border-base">
            <h3 className="text-sm font-semibold">Line Items</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-elevated">
                <tr>
                  {columns.filter(c => c.key !== 'lineNo').map((col) => (
                    <th key={col.key} className="px-4 py-2 text-left text-xs font-medium text-secondary border-b border-base">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {po.lines?.map((line, idx) => (
                  <tr key={idx} className="border-b border-base last:border-0">
                    {columns.filter(c => c.key !== 'lineNo').map((col) => (
                      <td key={col.key} className="px-4 py-2 text-sm">
                        {col.render ? col.render(line) : line[col.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Attachments list - Outside print area */}
      {attachments.length > 0 && (
        <div className="card p-4">
          <h3 className="text-sm font-medium mb-2">Attachments</h3>
          <div className="space-y-2">
            {attachments.map((att) => (
              <div key={att.id} className="flex items-center justify-between p-2 bg-elevated rounded border border-base">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-secondary" />
                  <div>
                    <div className="text-sm">{att.name}</div>
                    <div className="text-xs text-muted">
                      {(att.size / 1024).toFixed(1)} KB · {att.uploadedBy} · {new Date(att.uploadedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                {att.source && (
                  <span className="text-xs px-2 py-1 bg-blue-900/30 text-blue-400 rounded">
                    {att.source}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Original documents - Outside print area */}
      {po.docs && po.docs.length > 0 && (
        <div className="card p-4">
          <h3 className="text-sm font-medium mb-2">Documents</h3>
          <div className="flex flex-wrap gap-2">
            {po.docs.map((d) => (
              <DocTag key={d.id} tag={d.tag} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

