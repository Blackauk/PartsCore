import { useState, useEffect } from 'react';
import { X, Settings, Save } from 'lucide-react';

export default function LabelSettingsDrawer({ open, onClose, settings, onSave }) {
  const [localSettings, setLocalSettings] = useState(settings || {
    paperSize: 'a4',
    columns: 3,
    rows: 7,
    includeLogo: true,
    includeSupplier: true,
    border: true,
    fontSize: 9,
  });

  useEffect(() => {
    if (open && settings) {
      setLocalSettings(settings);
    }
  }, [open, settings]);

  const handleSave = () => {
    localStorage.setItem('labelSettings', JSON.stringify(localSettings));
    onSave?.(localSettings);
    onClose();
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[80] bg-black/50" onClick={onClose} />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-zinc-900 border-l border-zinc-800 shadow-2xl z-[90] flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Settings size={20} />
            Label Settings
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Paper Size */}
          <div>
            <label className="text-sm font-medium mb-2 block">Paper Size</label>
            <select
              className="input w-full"
              value={localSettings.paperSize}
              onChange={(e) => setLocalSettings({ ...localSettings, paperSize: e.target.value })}
            >
              <option value="a4">A4 (210 x 297 mm)</option>
              <option value="100x50">100 x 50 mm</option>
            </select>
          </div>

          {/* Grid Layout */}
          {localSettings.paperSize === 'a4' && (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Columns per Sheet
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  className="input w-full"
                  value={localSettings.columns}
                  onChange={(e) => setLocalSettings({ ...localSettings, columns: parseInt(e.target.value) || 3 })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Rows per Sheet
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="input w-full"
                  value={localSettings.rows}
                  onChange={(e) => setLocalSettings({ ...localSettings, rows: parseInt(e.target.value) || 7 })}
                />
              </div>
            </>
          )}

          {/* Display Options */}
          <div className="space-y-3">
            <label className="text-sm font-medium block">Display Options</label>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.includeLogo}
                onChange={(e) => setLocalSettings({ ...localSettings, includeLogo: e.target.checked })}
                className="rounded border-zinc-700"
              />
              <span className="text-sm">Include CoreStock logo</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.includeSupplier}
                onChange={(e) => setLocalSettings({ ...localSettings, includeSupplier: e.target.checked })}
                className="rounded border-zinc-700"
              />
              <span className="text-sm">Include supplier information</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.border}
                onChange={(e) => setLocalSettings({ ...localSettings, border: e.target.checked })}
                className="rounded border-zinc-700"
              />
              <span className="text-sm">Show label border</span>
            </label>
          </div>

          {/* Font Size */}
          <div>
            <label className="text-sm font-medium mb-2 block">Font Size</label>
            <input
              type="range"
              min="6"
              max="12"
              className="w-full"
              value={localSettings.fontSize}
              onChange={(e) => setLocalSettings({ ...localSettings, fontSize: parseInt(e.target.value) })}
            />
            <div className="text-xs text-zinc-400 mt-1">
              {localSettings.fontSize}pt
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-zinc-800 p-4 bg-zinc-900 flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            className="btn flex-1"
            style={{
              backgroundColor: 'rgba(247, 147, 30, 0.2)',
              borderColor: 'rgba(247, 147, 30, 0.3)',
              color: 'var(--brand-orange)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(247, 147, 30, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(247, 147, 30, 0.2)';
            }}
          >
            <Save size={16} />
            Save Preferences
          </button>
        </div>
      </div>
    </>
  );
}

