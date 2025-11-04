import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Package, MapPin, FileText, History } from 'lucide-react';
import { paths } from '../../lib/paths.js';

export default function ItemDetail() {
  const { sku } = useParams();
  const navigate = useNavigate();

  // TODO: Fetch item data from API/store
  const item = {
    sku: sku || 'N/A',
    articleNumber: 'ART-001',
    articleName: 'Sample Part',
    quantity: 42,
    equipment: 'Digger',
    category: 'Hydraulics',
    supplier: 'Atlas Parts Ltd',
    site: 'Atlas Road',
    zone: 'A1',
    landmark: 'Main Warehouse',
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate(-1)} 
              className="btn-secondary"
              aria-label="Back"
            >
              <ArrowLeft size={16} />
              Back
            </button>
          </div>
          <div className="text-xs text-zinc-400 mt-2">Item Details</div>
          <h1 className="text-xl font-semibold">{item.sku}</h1>
          <div className="text-sm text-zinc-400">
            {item.articleName}
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            className="btn"
            onClick={() => navigate(paths.itemEdit(sku))}
          >
            <Edit size={16} />
            Edit
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Info */}
        <div className="card p-4">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Package size={18} />
            Basic Information
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-400">SKU:</span>
              <span className="font-mono">{item.sku}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Article Number:</span>
              <span>{item.articleNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Article Name:</span>
              <span>{item.articleName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Quantity:</span>
              <span className="font-semibold text-zinc-200">{item.quantity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Equipment:</span>
              <span>{item.equipment}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Category:</span>
              <span>{item.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Supplier:</span>
              <span>{item.supplier}</span>
            </div>
          </div>
        </div>

        {/* Location Info */}
        <div className="card p-4">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <MapPin size={18} />
            Location
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-400">Site:</span>
              <span>{item.site}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Zone:</span>
              <span>{item.zone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Landmark:</span>
              <span>{item.landmark}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-4 md:col-span-2">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <FileText size={18} />
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              className="btn-secondary"
              onClick={() => navigate(paths.historyForSku(sku))}
            >
              <History size={16} />
              View History
            </button>
            <button
              className="btn-secondary"
              onClick={() => navigate(paths.labelsForSku(sku))}
            >
              Print QR
            </button>
          </div>
        </div>
      </div>

      {/* Placeholder note */}
      <div className="card p-4 bg-blue-900/20 border-blue-800/30">
        <p className="text-sm text-blue-300">
          📋 <strong>Placeholder page.</strong> This page will show part info, photos, stock by site, movements, related POs, and attachments.
        </p>
      </div>
    </div>
  );
}

