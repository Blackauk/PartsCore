import EditModal from './EditModal.jsx';
import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

export default function LabelModal({ open = true, onClose, item, size = '50mm' }) {
  if (!open || !item) return null;
  const base = typeof window !== 'undefined' ? window.location.origin : 'https://app.example.com';
  const value = `${base}/inventory/master/${item?.id || ''}?sku=${encodeURIComponent(item?.sku || '')}`;
  const canvasRef = useRef(null);

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `label_${item.sku}_${size}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
  function print() {
    const preview = document.getElementById('label-preview');
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;padding:16px;font-family:system-ui} .card{width:300px}</style></head><body><div class="card">${preview?.innerHTML || ''}</div><script>window.print(); setTimeout(()=>window.close(), 200);<\/script></body></html>`;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(html);
    w.document.close();
  }
  return (
    <EditModal title="Print label" onClose={onClose} onSave={onClose}>
      <div className="space-y-3">
        <div id="label-preview" className="p-3 rounded border border-zinc-800 inline-block">
          <div className="flex items-center gap-3">
            <QRCodeCanvas value={value} size={128} includeMargin ref={canvasRef} />
            <div className="text-sm">
              <div className="font-medium">{item.articleNumber} — {item.articleName}</div>
              <div>SKU: {item.sku}</div>
              <div>{item.site} / {item.zone} / {item.landmark}</div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={print}>Print label</button>
          <button className="btn" onClick={download}>Download PNG</button>
        </div>
        <div className="text-xs text-zinc-400">Scanning QR opens the item in the app.</div>
      </div>
    </EditModal>
  );
}


