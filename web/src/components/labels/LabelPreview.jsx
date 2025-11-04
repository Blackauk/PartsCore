import QRCode from 'qrcode.react';

export default function LabelPreview({
  sku,
  name,
  location,
  supplier,
  showQR = true,
  showLogo = true,
  showSupplier = true,
  qrValue,
}) {
  const displayQR = showQR && qrValue;

  return (
    <div className="rounded-xl border border-zinc-700/50 p-4 bg-white w-[180px] shadow-lg">
      {/* Header with QR and Logo */}
      <div className="flex justify-between items-start mb-2">
        {displayQR && (
          <div className="flex-shrink-0">
            <QRCode
              value={qrValue}
              size={50}
              level="H"
              includeMargin={true}
            />
          </div>
        )}
        {showLogo && (
          <div className="flex-shrink-0 ml-auto text-right">
            <div className="text-xs font-bold text-zinc-900">CoreStock</div>
            <div className="text-[8px] text-zinc-600 opacity-80">by Blockwork-IT</div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-zinc-200 mb-2" />

      {/* Content */}
      <div className="space-y-1 text-xs">
        {sku && (
          <div>
            <strong className="text-zinc-900">SKU:</strong>{' '}
            <span className="font-mono text-zinc-700">{sku}</span>
          </div>
        )}
        {name && (
          <div className="font-medium text-zinc-900 truncate" title={name}>
            {name}
          </div>
        )}
        {location && (
          <div className="font-mono text-zinc-700 text-[10px]">
            Location: {location}
          </div>
        )}
        {showSupplier && supplier && (
          <div className="text-[10px] text-zinc-500 pt-1">
            Supplier: {supplier}
          </div>
        )}
        <div className="text-[9px] text-zinc-400 mt-1">
          Updated: {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

