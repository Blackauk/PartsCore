import { useMemo, useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import EditModal from '../../../components/EditModal.jsx';
import Dropzone from '../../../components/Dropzone.jsx';
import { grnDetails, grnHistory } from '../../../data/mockDeliveries.js';
import { toast } from '../../../lib/toast.js';
import { Paperclip } from 'lucide-react';

export default function GrnDetail() {
  const { grnId } = useParams();
  const [searchParams] = useSearchParams();
  const isNew = grnId === 'new';
  const poId = searchParams.get('poId');

  const base = useMemo(() => {
    if (!isNew) return { ...(grnDetails[grnId] || {}) };
    // Creating new GRN prefilled from a PO id
    const ref = grnHistory[0] || {};
    return {
      id: `GRN-${Math.floor(3000 + Math.random()*1000)}`,
      poId: poId || ref.poId || 'PO-NEW',
      supplier: ref.supplier || 'Unknown Supplier',
      site: ref.site || 'Atlas Road',
      date: new Date().toISOString().slice(0,10),
      receivedBy: 'M. Jones',
      status: 'Pending Inspection',
      docs: [],
      lines: ref.lines || [
        { part: 'PART-100', description: 'Hydraulic Filter', qtyOrdered: 10, qtyReceived: 10, qtyRejected: 0, notes: '' },
      ],
      overallNotes: '',
    };
  }, [grnId, isNew, poId]);

  const [grn, setGrn] = useState(base);
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);

  // Load attachments from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(`grn-attachments-${grn.id}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Note: Object URLs don't persist, so we'll need to recreate them or use a different approach
        // For now, we'll just store metadata and let user re-upload if needed
        setAttachments(parsed.map(a => ({ ...a, url: null })));
      } catch (e) {
        console.error('Failed to load attachments', e);
      }
    }
  }, [grn.id]);

  // Save attachments to localStorage when they change
  useEffect(() => {
    const metadata = attachments.map(({ id, name, size, type, progress }) => ({
      id,
      name,
      size,
      type,
      progress,
    }));
    localStorage.setItem(`grn-attachments-${grn.id}`, JSON.stringify(metadata));
  }, [attachments, grn.id]);

  function setLine(index, patch) {
    setGrn((g) => {
      const next = { ...g, lines: g.lines.map((ln, i) => (i === index ? { ...ln, ...patch } : ln)) };
      return next;
    });
  }

  function saveDraft() {
    toast('GRN saved as draft');
  }
  function submit() {
    setGrn((g) => ({ ...g, status: 'Completed' }));
    toast('GRN submitted');
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-xs text-zinc-400">Goods Receipt Note</div>
          <h1 className="text-xl font-semibold">{isNew ? 'New GRN' : grn.id}</h1>
          <div className="text-sm text-zinc-400">PO: <Link to="#" className="link">{grn.poId}</Link> · Supplier: {grn.supplier} · Site: {grn.site}</div>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary">Raise Query</button>
          <button className="btn" onClick={() => setGrn((g) => ({ ...g, status: 'Accepted' }))}>Mark as Accepted</button>
        </div>
      </div>

      {/* Attach Delivery Note CTA */}
      {attachments.length === 0 && (
        <div className="flex items-center gap-2 p-3 bg-zinc-800 rounded border border-zinc-700">
          <Paperclip className="w-4 h-4 text-zinc-400" />
          <span className="text-sm text-zinc-300">No delivery notes attached</span>
          <button
            className="ml-auto btn btn-xs"
            onClick={() => {
              fileInputRef.current?.click();
            }}
          >
            Attach Delivery Note
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-3">
          <div className="text-xs text-zinc-400 mb-1">Key Dates</div>
          <div className="space-y-1 text-sm">
            <div>Expected: <span className="text-zinc-400">{/* from PO */}—</span></div>
            <div>Received: <input className="input text-sm w-40" type="date" value={grn.date} onChange={(e) => setGrn((g)=>({ ...g, date: e.target.value }))} /></div>
            <div>Received By: <input className="input text-sm w-48" value={grn.receivedBy} onChange={(e)=>setGrn((g)=>({ ...g, receivedBy: e.target.value }))} /></div>
          </div>
        </div>
        <div className="card p-3 md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-zinc-400">Delivery Note Attachments</div>
            {attachments.length > 0 && (
              <button
                className="btn btn-xs"
                onClick={() => {
                  fileInputRef.current?.click();
                }}
              >
                <Paperclip className="w-3 h-3 mr-1" />
                Add More
              </button>
            )}
          </div>
          <Dropzone
            files={attachments}
            onFilesChange={setAttachments}
            maxFiles={10}
            accept="image/*,application/pdf"
            inputRef={fileInputRef}
          />
        </div>
      </div>

      <div className="card p-3">
        <div className="text-sm font-medium mb-2">Line Items</div>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-zinc-400">
                <th className="py-2 pr-3">Part Number</th>
                <th className="py-2 pr-3">Description</th>
                <th className="py-2 pr-3">Qty Ordered</th>
                <th className="py-2 pr-3">Qty Received</th>
                <th className="py-2 pr-3">Qty Rejected</th>
                <th className="py-2 pr-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              {grn.lines.map((ln, i) => (
                <tr key={i} className="border-t border-zinc-800">
                  <td className="py-2 pr-3">{ln.part}</td>
                  <td className="py-2 pr-3">{ln.description}</td>
                  <td className="py-2 pr-3">{ln.qtyOrdered}</td>
                  <td className="py-2 pr-3"><input className="input w-24" type="number" value={ln.qtyReceived} onChange={(e)=>setLine(i,{ qtyReceived: Number(e.target.value) })} disabled={!isNew} /></td>
                  <td className="py-2 pr-3"><input className="input w-24" type="number" value={ln.qtyRejected} onChange={(e)=>setLine(i,{ qtyRejected: Number(e.target.value) })} disabled={!isNew} /></td>
                  <td className="py-2 pr-3"><input className="input w-64" value={ln.notes} onChange={(e)=>setLine(i,{ notes: e.target.value })} disabled={!isNew} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-3 space-y-2">
        <div className="text-sm">Overall Notes</div>
        <textarea className="input w-full h-24" value={grn.overallNotes} onChange={(e)=>setGrn((g)=>({ ...g, overallNotes: e.target.value }))} />
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={saveDraft}>Save as Draft</button>
          <button className="btn" onClick={submit}>Submit GRN</button>
        </div>
      </div>
    </div>
  );
}


