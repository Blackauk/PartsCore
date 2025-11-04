// Step 4: Labels - Print/download QR labels for received items

import { useState, useRef } from 'react';
import { Printer, Download, CheckSquare } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { buildLabelPayload } from '../../lib/qr.js';

export default function StepLabels({ lines, grnId }) {
  const [labelSize, setLabelSize] = useState('50x50');
  const [selectedLines, setSelectedLines] = useState(
    lines.filter((l) => l.printLabel && Number(l.qtyReceived || 0) > 0)
  );

  function toggleLine(line) {
    if (selectedLines.find((l) => l.id === line.id)) {
      setSelectedLines(selectedLines.filter((l) => l.id !== line.id));
    } else {
      setSelectedLines([...selectedLines, line]);
    }
  }

  function selectAll() {
    const printable = lines.filter((l) => Number(l.qtyReceived || 0) > 0);
    setSelectedLines(printable);
  }

  function downloadPng(item, qty) {
    // This would need canvas ref or generate via qrcode library
    // Simplified: open in new window and user can right-click save
    const payload = buildLabelPayload({
      id: item.id || item.partNo,
      sku: item.sku || item.partNo,
      articleNumber: item.partNo,
    });
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <html>
        <head><title>QR Label - ${item.partNo}</title></head>
        <body style="margin:0; padding:20px; display:flex; justify-content:center; align-items:center; height:100vh;">
          <div style="text-align:center;">
            <div style="margin-bottom:20px;">
              <canvas id="qrcode"></canvas>
            </div>
            <div style="font-family:sans-serif;">
              <div style="font-weight:bold; font-size:18px;">${item.partNo}</div>
              <div style="font-size:14px; color:#666;">${item.description || item.name}</div>
              <div style="font-size:12px; color:#999;">${item.location?.site || ''} ${item.location?.zone || ''}</div>
            </div>
          </div>
          <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
          <script>
            QRCode.toCanvas(document.getElementById('qrcode'), '${payload}', {
              width: 300,
              margin: 2
            });
          </script>
        </body>
      </html>
    `);
  }

  function printAll() {
    const printHtml = selectedLines
      .map((line) => {
        const payload = buildLabelPayload({
          id: line.id || line.partNo,
          sku: line.sku || line.partNo,
          articleNumber: line.partNo,
        });
        const qty = Number(line.qtyToLabel || line.qtyReceived || 1);
        return Array.from({ length: qty }, () => `
          <div class="label" style="
            width: ${labelSize === '50x50' ? '50' : labelSize === '35x35' ? '35' : '25'}mm;
            height: auto;
            padding: 2mm;
            border: 1px solid #000;
            display: inline-block;
            margin: 2mm;
            text-align: center;
            page-break-inside: avoid;
          ">
            <div style="margin-bottom:5px;">
              <canvas id="qr-${line.id || line.partNo}"></canvas>
            </div>
            <div style="font-family:sans-serif; font-size:10px;">
              <div style="font-weight:bold;">${line.partNo || line.sku}</div>
              <div style="font-size:8px; color:#666;">${(line.description || line.name || '').slice(0, 30)}</div>
              <div style="font-size:7px; color:#999;">${line.location?.site || ''} ${line.location?.zone || ''}</div>
            </div>
          </div>
        `).join('');
      })
      .join('');

    const w = window.open('', '_blank');
    if (!w) {
      alert('Please allow popups to print labels');
      return;
    }
    w.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Print Labels</title>
          <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
          <style>
            @page { size: A4; margin: 10mm; }
            body { margin: 0; padding: 10mm; font-family: sans-serif; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="padding:20px; text-align:center;">
            <button onclick="window.print()" style="padding:10px 20px; font-size:16px;">Print All Labels</button>
          </div>
          ${printHtml}
          <script>
            ${selectedLines.map((line) => {
              const payload = buildLabelPayload({
                id: line.id || line.partNo,
                sku: line.sku || line.partNo,
              });
              return `
                QRCode.toCanvas(
                  document.getElementById('qr-${line.id || line.partNo}'),
                  '${payload}',
                  { width: 150, margin: 1 }
                );
              `;
            }).join('')}
            setTimeout(() => {
              window.print();
              setTimeout(() => window.close(), 500);
            }, 500);
          </script>
        </body>
      </html>
    `);
    w.document.close();
  }

  const printableLines = lines.filter((l) => Number(l.qtyReceived || 0) > 0);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-4 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
        <div className="flex-1">
          <label className="block text-sm text-zinc-400 mb-1">Label Size</label>
          <select
            className="input"
            value={labelSize}
            onChange={(e) => setLabelSize(e.target.value)}
          >
            <option value="50x50">50mm × 50mm</option>
            <option value="35x35">35mm × 35mm</option>
            <option value="25x25">25mm × 25mm</option>
          </select>
        </div>
        <div>
          <button className="btn" onClick={selectAll}>
            <CheckSquare size={16} />
            Select All
          </button>
        </div>
        <div>
          <button className="btn" onClick={printAll} disabled={selectedLines.length === 0}>
            <Printer size={16} />
            Generate & Print All
          </button>
        </div>
      </div>

      {/* Lines List */}
      <div className="space-y-3">
        {printableLines.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            No items received. Nothing to label.
          </div>
        ) : (
          printableLines.map((line, idx) => {
            const isSelected = selectedLines.find((l) => l.id === line.id || l.partNo === line.partNo);
            const payload = buildLabelPayload({
              id: line.id || line.partNo,
              sku: line.sku || line.partNo,
              articleNumber: line.partNo,
            });

            return (
              <div
                key={idx}
                className={`p-4 border rounded-lg ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-zinc-800 bg-zinc-900/50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!isSelected}
                      onChange={() => toggleLine(line)}
                      className="rounded"
                    />
                  </label>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-medium">{line.partNo || line.sku}</div>
                        <div className="text-sm text-zinc-400">{line.description || line.name}</div>
                      </div>
                      <div className="text-sm text-zinc-300">
                        Qty Received: <span className="font-medium">{line.qtyReceived || 0}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1">Qty to Label</label>
                        <input
                          type="number"
                          min="1"
                          max={line.qtyReceived || 1}
                          className="input text-sm w-24"
                          value={line.qtyToLabel || line.qtyReceived || 1}
                          onChange={(e) => {
                            // Update local state
                            const updated = selectedLines.map((l) =>
                              (l.id === line.id || l.partNo === line.partNo)
                                ? { ...l, qtyToLabel: Number(e.target.value) }
                                : l
                            );
                            setSelectedLines(updated);
                          }}
                        />
                      </div>
                      <div className="flex-1 flex items-center justify-center">
                        <div className="bg-white p-2 rounded">
                          <QRCodeCanvas
                            value={payload}
                            size={120}
                            level="M"
                            includeMargin
                          />
                        </div>
                      </div>
                      <div>
                        <button
                          className="btn btn-xs"
                          onClick={() => downloadPng(line, line.qtyToLabel || line.qtyReceived)}
                        >
                          <Download size={14} />
                          Download PNG
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}




