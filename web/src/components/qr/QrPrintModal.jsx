// QR Print Modal with live preview and print/download functionality
// Replaces legacy LabelModal with enhanced QR label printing workflow

import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeCanvas } from 'qrcode.react';

const APP_BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://app.example.com';

export default function QrPrintModal({ open, onClose, item }) {
  const [sizePreset, setSizePreset] = useState(() => {
    const prefs = localStorage.getItem('qrPrintPrefs');
    return prefs ? JSON.parse(prefs).sizePreset || '50x50' : '50x50';
  });
  const [customSizeMm, setCustomSizeMm] = useState(50);
  const [paper, setPaper] = useState('A4');
  const [copies, setCopies] = useState(1);
  const [includeName, setIncludeName] = useState(true);
  const [includeLocation, setIncludeLocation] = useState(true);
  const [includeLogo, setIncludeLogo] = useState(false);
  const [includeStatus, setIncludeStatus] = useState(false);
  const [includeDateCode, setIncludeDateCode] = useState(false);
  const [ecLevel, setEcLevel] = useState('M');
  const [showHumanReadable, setShowHumanReadable] = useState(true);
  const [invert, setInvert] = useState(false);

  const previewRef = useRef(null);

  // Load preferences from localStorage
  useEffect(() => {
    const prefs = localStorage.getItem('qrPrintPrefs');
    if (prefs) {
      try {
        const saved = JSON.parse(prefs);
        if (saved.sizePreset) setSizePreset(saved.sizePreset);
        if (saved.customSizeMm) setCustomSizeMm(saved.customSizeMm);
        if (saved.paper) setPaper(saved.paper);
        if (saved.copies) setCopies(saved.copies);
        if (saved.includeName !== undefined) setIncludeName(saved.includeName);
        if (saved.includeLocation !== undefined) setIncludeLocation(saved.includeLocation);
        if (saved.includeLogo !== undefined) setIncludeLogo(saved.includeLogo);
        if (saved.ecLevel) setEcLevel(saved.ecLevel);
        if (saved.showHumanReadable !== undefined) setShowHumanReadable(saved.showHumanReadable);
      } catch (e) {
        console.warn('Failed to load QR print preferences', e);
      }
    }
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    const prefs = {
      sizePreset,
      customSizeMm,
      paper,
      copies,
      includeName,
      includeLocation,
      includeLogo,
      ecLevel,
      showHumanReadable,
    };
    localStorage.setItem('qrPrintPrefs', JSON.stringify(prefs));
  }, [sizePreset, customSizeMm, paper, copies, includeName, includeLocation, includeLogo, ecLevel, showHumanReadable]);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !item) return null;

  // Calculate label size
  const labelSizeMm = useMemo(() => {
    if (sizePreset === 'custom') return customSizeMm;
    return parseInt(sizePreset.split('x')[0]);
  }, [sizePreset, customSizeMm]);

  // Convert mm to px for preview (96 dpi: 1mm ≈ 3.78px)
  const labelSizePx = Math.round(labelSizeMm * 3.78);

  // Generate QR content
  const contentToEncode = useMemo(() => {
    if (item.id) {
      return `${APP_BASE_URL}/items/${item.id}`;
    }
    return `ART:${item.articleNumber || item.sku || ''}`;
  }, [item]);

  // Generate date code if enabled
  const dateCode = useMemo(() => {
    if (!includeDateCode) return '';
    const now = new Date();
    return now.toISOString().slice(0, 10).replace(/-/g, '');
  }, [includeDateCode]);

  function downloadPng() {
    // Get the canvas from the QRCodeCanvas component
    const qrElement = previewRef.current?.querySelector('canvas');
    if (!qrElement) {
      console.warn('Could not find QR canvas for download');
      return;
    }
    const link = document.createElement('a');
    link.download = `qr_label_${item.sku || item.articleNumber || 'item'}_${sizePreset}.png`;
    link.href = qrElement.toDataURL('image/png');
    link.click();
  }

  function handlePrint() {
    const preview = previewRef.current;
    if (!preview) return;

    // Clone the preview and extract its HTML content
    const labelHtml = preview.outerHTML.replace('label-preview', 'qr-label');
    
    // Calculate how many labels fit per row based on paper size
    // A4: 210mm wide, Letter: 216mm wide (minus margins ~20mm each side = 170mm usable)
    const paperWidth = paper === 'A4' ? 210 : 216;
    const usableWidth = paperWidth - 20; // 10mm margin each side
    const labelsPerRow = Math.floor(usableWidth / (labelSizeMm + 5)); // +5mm for gap
    
    // Create repeated labels in a grid
    const repeatedLabels = Array.from({ length: copies }, (_, i) => 
      `<div class="qr-label-wrapper">${labelHtml}</div>`
    ).join('');
    
    const printHtml = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page {
      size: ${paper};
      margin: 10mm;
    }
    * {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: system-ui, sans-serif;
      display: grid;
      grid-template-columns: repeat(${labelsPerRow}, ${labelSizeMm}mm);
      gap: 5mm;
      justify-content: start;
    }
    .qr-label-wrapper {
      width: ${labelSizeMm}mm;
      height: auto;
    }
    .qr-label {
      width: ${labelSizeMm}mm;
      height: auto;
      padding: 2mm;
      border: 1px solid #000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    @media print {
      body {
        margin: 0;
        padding: 10mm;
      }
    }
  </style>
</head>
<body>
  ${repeatedLabels}
  <script>
    window.onload = () => {
      setTimeout(() => {
        window.print();
        setTimeout(() => window.close(), 500);
      }, 100);
    };
  </script>
</body>
</html>`;

    const w = window.open('', '_blank');
    if (!w) {
      alert('Please allow popups to print labels');
      return;
    }
    w.document.write(printHtml);
    w.document.close();
  }

  const qrSize = Math.max(128, Math.min(300, labelSizePx * 0.6));

  return createPortal(
    <div 
      className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full max-w-4xl bg-neutral-900 text-white rounded-2xl border border-white/10 shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold">Print QR Label</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">✕</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5">
          {/* Left: Preview */}
          <div className="flex flex-col items-center">
            <div 
              ref={previewRef}
              className={`label-preview bg-white text-black p-3 rounded-lg relative ${invert ? 'bg-black text-white' : ''}`}
              style={{ width: `${labelSizeMm}mm`, minWidth: '200px', maxWidth: '100%' }}
            >
              <div className="flex justify-center">
              <QRCodeCanvas 
                value={contentToEncode}
                level={ecLevel}
                includeMargin={true}
                size={qrSize}
                bgColor={invert ? '#000000' : '#ffffff'}
                fgColor={invert ? '#ffffff' : '#000000'}
              />
              </div>
              {showHumanReadable && (
                <div className="mt-2 text-center" style={{ fontSize: '0.7rem' }}>
                  <div className="font-semibold">{item.sku || item.articleNumber}</div>
                  {includeName && item.articleName && (
                    <div className="opacity-80 text-xs mt-1">{item.articleName}</div>
                  )}
                  {includeLocation && (item.site || item.zone || item.landmark) && (
                    <div className="opacity-80 text-xs mt-1">
                      {[item.site, item.zone, item.landmark].filter(Boolean).join(' • ')}
                    </div>
                  )}
                  {includeStatus && item.status && (
                    <div className="opacity-80 text-xs mt-1">{item.status}</div>
                  )}
                  {includeDateCode && dateCode && (
                    <div className="opacity-80 text-xs mt-1">{dateCode}</div>
                  )}
                </div>
              )}
              {includeLogo && (
                <div className="absolute top-1 right-1 opacity-50" style={{ fontSize: '8px' }}>
                  {/* Placeholder for logo - would need actual logo asset */}
                  <div className="w-8 h-8 border border-gray-400 flex items-center justify-center text-xs">LOGO</div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Options */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Size</label>
              <select 
                className="w-full input text-sm"
                value={sizePreset}
                onChange={(e) => setSizePreset(e.target.value)}
              >
                <option value="50x50">50x50mm</option>
                <option value="38x38">38x38mm</option>
                <option value="25x25">25x25mm</option>
                <option value="custom">Custom</option>
              </select>
              {sizePreset === 'custom' && (
                <input
                  type="number"
                  className="input text-sm mt-2"
                  value={customSizeMm}
                  onChange={(e) => setCustomSizeMm(parseInt(e.target.value) || 50)}
                  min="20"
                  max="100"
                  placeholder="Size in mm"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Paper</label>
              <select 
                className="w-full input text-sm"
                value={paper}
                onChange={(e) => setPaper(e.target.value)}
              >
                <option value="A4">A4</option>
                <option value="Letter">Letter</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Copies per page</label>
              <input
                type="number"
                className="input text-sm w-full"
                value={copies}
                onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max="20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Error Correction</label>
              <select 
                className="w-full input text-sm"
                value={ecLevel}
                onChange={(e) => setEcLevel(e.target.value)}
              >
                <option value="L">L (Low ~7%)</option>
                <option value="M">M (Medium ~15%)</option>
                <option value="Q">Q (Quartile ~25%)</option>
                <option value="H">H (High ~30%)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2">Include</label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeName}
                  onChange={(e) => setIncludeName(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Item name</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeLocation}
                  onChange={(e) => setIncludeLocation(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Location (Site/Zone/Landmark)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeStatus}
                  onChange={(e) => setIncludeStatus(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Status</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeDateCode}
                  onChange={(e) => setIncludeDateCode(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Date code</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showHumanReadable}
                  onChange={(e) => setShowHumanReadable(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Show human-readable code</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={invert}
                  onChange={(e) => setInvert(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Invert colors</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeLogo}
                  onChange={(e) => setIncludeLogo(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Include logo</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 pb-5 border-t border-white/10 pt-4">
          <button 
            className="rounded-lg border border-white/15 px-4 py-2 text-sm hover:bg-white/5 transition-colors" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="rounded-lg bg-neutral-800 border border-white/10 px-4 py-2 text-sm hover:bg-neutral-700 transition-colors" 
            onClick={downloadPng}
          >
            Download PNG
          </button>
          <button 
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm hover:bg-emerald-700 transition-colors" 
            onClick={handlePrint}
          >
            Print
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

