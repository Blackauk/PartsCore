import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useState } from 'react';
import { toast } from '../../lib/toast.js';
import { paths } from '../../lib/paths.js';

export default function ItemEdit() {
  const { sku } = useParams();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  // TODO: Load item data from API
  const [formData, setFormData] = useState({
    sku: sku || '',
    articleNumber: 'ART-001',
    articleName: 'Sample Part',
    quantity: 42,
    equipment: 'Digger',
    category: 'Hydraulics',
    supplier: 'Atlas Parts Ltd',
    site: 'Atlas Road',
    zone: 'A1',
    landmark: 'Main Warehouse',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Mock save
    setTimeout(() => {
      setSaving(false);
      toast('Item updated successfully', 'success');
      navigate(paths.item(sku));
    }, 500);
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
            >
              <ArrowLeft size={16} />
              Back
            </button>
          </div>
          <div className="text-xs text-zinc-400 mt-2">Edit Item</div>
          <h1 className="text-xl font-semibold">{sku}</h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">SKU</label>
            <input
              type="text"
              className="input w-full"
              value={formData.sku}
              disabled
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Article Number</label>
            <input
              type="text"
              className="input w-full"
              value={formData.articleNumber}
              onChange={(e) => setFormData({ ...formData, articleNumber: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium mb-2 block">Article Name</label>
            <input
              type="text"
              className="input w-full"
              value={formData.articleName}
              onChange={(e) => setFormData({ ...formData, articleName: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Category</label>
            <input
              type="text"
              className="input w-full"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Equipment</label>
            <input
              type="text"
              className="input w-full"
              value={formData.equipment}
              onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn bg-[#F7931E]/20 hover:bg-[#F7931E]/30 border-[#F7931E]/30 text-[#F7931E]"
            disabled={saving}
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

