import { useState, useRef, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, FileText, QrCode, Download, Settings, Package, ShoppingCart, MapPin, History } from 'lucide-react';
import LabelPreview from '../../components/labels/LabelPreview.jsx';
import LabelSettingsDrawer from '../../components/labels/LabelSettingsDrawer.jsx';
import { generateSingleLabel, generateLabelSheet } from '../../lib/labelGenerator.js';
import { masterItems, suppliersList, categoriesList } from '../../data/mockInventory.js';
import { purchaseOrders } from '../../data/mockProcurement.js';
import { sites } from '../../data/mockLocations.js';
import { toast } from '../../lib/toast.js';

export default function LabelsQR() {
  const [searchParams] = useSearchParams();
  const skuFromQuery = searchParams.get('sku');
  
  // Tab state
  const [activeTab, setActiveTab] = useState('parts'); // 'parts', 'po', 'location'
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedSite, setSelectedSite] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Selection state
  const [selectedItems, setSelectedItems] = useState([]); // Array for batch export
  const [selectedPO, setSelectedPO] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  
  // Preview state
  const [previewItem, setPreviewItem] = useState(null);
  
  // Settings
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState(() => {
    const stored = localStorage.getItem('labelSettings');
    return stored ? JSON.parse(stored) : {
      paperSize: 'a4',
      columns: 3,
      rows: 7,
      includeLogo: true,
      includeSupplier: true,
      border: true,
      fontSize: 9,
    };
  });
  
  // Recent exports
  const [recentExports, setRecentExports] = useState(() => {
    const stored = localStorage.getItem('corestock.labels');
    return stored ? JSON.parse(stored) : [];
  });
  
  // Auto-select part if sku query param exists
  useEffect(() => {
    if (skuFromQuery && !previewItem) {
      const found = masterItems.find(m => m.sku === skuFromQuery);
      if (found) {
        setPreviewItem({
          sku: found.sku,
          name: found.articleName,
          location: `${found.site}-${found.zone}-${found.landmark}`,
          supplier: found.supplier,
          qrValue: `PART:${found.sku}|LOC:${found.site}-${found.zone}`,
        });
        setSearchQuery(skuFromQuery);
        setActiveTab('parts');
      }
    }
  }, [skuFromQuery, previewItem]);
  
  // Filter data based on active tab
  const filteredParts = useMemo(() => {
    let items = masterItems;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item =>
        item.sku?.toLowerCase().includes(query) ||
        item.articleNumber?.toLowerCase().includes(query) ||
        item.articleName?.toLowerCase().includes(query)
      );
    }
    
    if (selectedSupplier) {
      items = items.filter(item => item.supplier === selectedSupplier);
    }
    
    if (selectedSite) {
      items = items.filter(item => item.site === selectedSite);
    }
    
    if (selectedCategory) {
      items = items.filter(item => item.category === selectedCategory);
    }
    
    return items;
  }, [searchQuery, selectedSupplier, selectedSite, selectedCategory]);
  
  const filteredPOs = useMemo(() => {
    let pos = purchaseOrders;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      pos = pos.filter(po =>
        po.id?.toLowerCase().includes(query) ||
        po.supplier?.toLowerCase().includes(query)
      );
    }
    
    if (selectedSupplier) {
      pos = pos.filter(po => po.supplier === selectedSupplier);
    }
    
    if (selectedSite) {
      pos = pos.filter(po => po.site === selectedSite);
    }
    
    return pos;
  }, [searchQuery, selectedSupplier, selectedSite]);
  
  const filteredLocations = useMemo(() => {
    const locationList = [];
    masterItems.forEach(item => {
      const loc = `${item.site}-${item.zone}-${item.landmark}`;
      if (!locationList.find(l => l.code === loc)) {
        locationList.push({
          code: loc,
          site: item.site,
          zone: item.zone,
          landmark: item.landmark,
          name: `${item.site} → ${item.zone} → ${item.landmark}`,
        });
      }
    });
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return locationList.filter(loc =>
        loc.code.toLowerCase().includes(query) ||
        loc.name.toLowerCase().includes(query)
      );
    }
    
    return locationList;
  }, [searchQuery]);
  
  const handleSelectItem = (item) => {
    setPreviewItem({
      sku: item.sku,
      name: item.articleName,
      location: `${item.site}-${item.zone}-${item.landmark}`,
      supplier: item.supplier,
      qrValue: `PART:${item.sku}|LOC:${item.site}-${item.zone}`,
    });
  };
  
  const handleToggleSelection = (item) => {
    setSelectedItems(prev => {
      const exists = prev.find(i => i.sku === item.sku);
      if (exists) {
        return prev.filter(i => i.sku !== item.sku);
      }
      return [...prev, {
        sku: item.sku,
        name: item.articleName,
        location: `${item.site}-${item.zone}-${item.landmark}`,
        supplier: item.supplier,
        qrValue: `PART:${item.sku}|LOC:${item.site}-${item.zone}`,
      }];
    });
  };
  
  const handleGenerateSheet = async () => {
    let itemsToExport = [];
    
    if (selectedItems.length > 0) {
      itemsToExport = selectedItems;
    } else if (previewItem) {
      itemsToExport = [previewItem];
    } else {
      toast('Please select at least one item', 'error');
      return;
    }
    
    // Ensure all items have qrValue
    itemsToExport = itemsToExport.map(item => ({
      ...item,
      qrValue: item.qrValue || `PART:${item.sku}`,
    }));
    
    try {
      const pdf = await generateLabelSheet(itemsToExport, settings);
      const filename = `labels_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);
      
      // Track export
      const exportRecord = {
        id: `EXP-${Date.now()}`,
        date: Date.now(),
        type: activeTab === 'parts' ? 'Parts' : activeTab === 'po' ? 'PO' : 'Location',
        count: itemsToExport.length,
        format: 'A4 Sheet',
        filename,
        items: itemsToExport.map(item => ({
          sku: item.sku,
          name: item.name,
          location: item.location,
          supplier: item.supplier,
          qrValue: item.qrValue || `PART:${item.sku}`,
        })),
        settings: settings,
      };
      
      const updated = [exportRecord, ...recentExports].slice(0, 10);
      setRecentExports(updated);
      localStorage.setItem('corestock.labels', JSON.stringify(updated));
      
      toast(`Generated ${itemsToExport.length} label(s)`, 'success');
    } catch (error) {
      console.error('Failed to generate label sheet:', error);
      toast('Failed to generate label sheet', 'error');
    }
  };
  
  const handleGenerateSingle = async () => {
    if (!previewItem) {
      toast('Please select an item first', 'error');
      return;
    }
    
    try {
      const pdf = await generateSingleLabel({
        sku: previewItem.sku,
        name: previewItem.name,
        location: previewItem.location,
        supplier: previewItem.supplier,
        qrValue: previewItem.qrValue,
        settings,
      });
      
      const filename = `label_${previewItem.sku}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);
      
      // Track export
      const exportRecord = {
        id: `EXP-${Date.now()}`,
        date: Date.now(),
        type: activeTab === 'parts' ? 'Parts' : activeTab === 'po' ? 'PO' : 'Location',
        count: 1,
        format: 'Single',
        filename,
        items: [{
          sku: previewItem.sku,
          name: previewItem.name,
          location: previewItem.location,
          supplier: previewItem.supplier,
          qrValue: previewItem.qrValue,
        }],
        settings: settings,
      };
      
      const updated = [exportRecord, ...recentExports].slice(0, 10);
      setRecentExports(updated);
      localStorage.setItem('corestock.labels', JSON.stringify(updated));
      
      toast('Label generated', 'success');
    } catch (error) {
      console.error('Failed to generate label:', error);
      toast('Failed to generate label', 'error');
    }
  };
  
  const qrValue = previewItem?.qrValue || '';
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-2 flex items-center gap-2">
            <QrCode className="text-[#F7931E]" size={28} />
            Labels & QR
          </h1>
          <p className="text-sm text-zinc-400">
            Generate, preview, and export QR-coded labels for parts, purchase orders, and storage locations.
          </p>
        </div>
        <button
          onClick={() => setSettingsOpen(true)}
          className="btn-secondary"
        >
          <Settings size={16} />
          Settings
        </button>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-zinc-800">
        <button
          onClick={() => {
            setActiveTab('parts');
            setPreviewItem(null);
            setSelectedItems([]);
          }}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'parts'
              ? 'border-[#F7931E] text-white'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Package size={16} className="inline mr-2" />
          Parts / Catalog
        </button>
        <button
          onClick={() => {
            setActiveTab('po');
            setPreviewItem(null);
            setSelectedItems([]);
          }}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'po'
              ? 'border-[#F7931E] text-white'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <ShoppingCart size={16} className="inline mr-2" />
          Purchase Orders
        </button>
        <button
          onClick={() => {
            setActiveTab('location');
            setPreviewItem(null);
            setSelectedItems([]);
          }}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'location'
              ? 'border-[#F7931E] text-white'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <MapPin size={16} className="inline mr-2" />
          Locations
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Search & Selection */}
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4 pointer-events-none" />
            <input
              type="text"
              placeholder={`Search ${activeTab === 'parts' ? 'SKU / Article' : activeTab === 'po' ? 'PO Number' : 'Location'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border border-zinc-800 bg-zinc-900 focus:ring-2 focus:ring-[#F7931E]/50 focus:outline-none"
            />
          </div>
          
          {/* Filters */}
          <div className="grid grid-cols-2 gap-2">
            {activeTab === 'parts' && (
              <>
                <select
                  className="input text-sm"
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                >
                  <option value="">All Suppliers</option>
                  {suppliersList.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <select
                  className="input text-sm"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categoriesList.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </>
            )}
            <select
              className="input text-sm"
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
            >
              <option value="">All Sites</option>
              {sites.map(s => (
                <option key={s.code} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
          
          {/* Results List */}
          <div className="card p-3 max-h-[400px] overflow-y-auto space-y-2">
            {activeTab === 'parts' && filteredParts.length > 0 && (
              <>
                {selectedItems.length > 0 && (
                  <div className="text-xs text-zinc-400 mb-2">
                    {selectedItems.length} selected
                  </div>
                )}
                {filteredParts.map((item) => {
                  const isSelected = selectedItems.find(i => i.sku === item.sku);
                  return (
                    <button
                      key={item.sku}
                      onClick={() => handleSelectItem(item)}
                      onDoubleClick={() => handleToggleSelection(item)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        previewItem?.sku === item.sku
                          ? 'bg-[#F7931E]/20 border-[#F7931E]/30'
                          : isSelected
                          ? 'bg-blue-900/20 border-blue-700/30'
                          : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.sku}</div>
                          <div className="text-xs text-zinc-400">{item.articleName}</div>
                          <div className="text-xs text-zinc-500">{item.site} • {item.zone}</div>
                        </div>
                        {isSelected && (
                          <div className="text-[#F7931E]">✓</div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </>
            )}
            {activeTab === 'po' && filteredPOs.length > 0 && (
              filteredPOs.map((po) => (
                <button
                  key={po.id}
                  onClick={() => {
                    setSelectedPO(po);
                    setPreviewItem({
                      sku: po.id,
                      name: `PO ${po.id}`,
                      location: po.site,
                      supplier: po.supplier,
                      qrValue: `PO:${po.id}`,
                    });
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedPO?.id === po.id
                      ? 'bg-[#F7931E]/20 border-[#F7931E]/30'
                      : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="font-medium text-sm">{po.id}</div>
                  <div className="text-xs text-zinc-400">{po.supplier}</div>
                  <div className="text-xs text-zinc-500">{po.site} • {po.lines.length} line(s)</div>
                </button>
              ))
            )}
            {activeTab === 'location' && filteredLocations.length > 0 && (
              filteredLocations.map((loc) => (
                <button
                  key={loc.code}
                  onClick={() => {
                    setSelectedLocation(loc);
                    setPreviewItem({
                      sku: loc.code,
                      name: loc.name,
                      location: loc.code,
                      supplier: '',
                      qrValue: `LOC:${loc.code}`,
                    });
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedLocation?.code === loc.code
                      ? 'bg-[#F7931E]/20 border-[#F7931E]/30'
                      : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="font-medium text-sm">{loc.code}</div>
                  <div className="text-xs text-zinc-400">{loc.site}</div>
                  <div className="text-xs text-zinc-500">{loc.zone} • {loc.landmark}</div>
                </button>
              ))
            )}
            {((activeTab === 'parts' && filteredParts.length === 0) ||
              (activeTab === 'po' && filteredPOs.length === 0) ||
              (activeTab === 'location' && filteredLocations.length === 0)) && (
              <div className="text-center text-zinc-500 py-8 text-sm">
                No results found
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleGenerateSheet}
              disabled={!previewItem && selectedItems.length === 0}
              className="btn flex-1 bg-[#F7931E]/20 hover:bg-[#F7931E]/30 border-[#F7931E]/30 text-[#F7931E] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText size={16} />
              Generate Sheet
            </button>
            <button
              onClick={handleGenerateSingle}
              disabled={!previewItem}
              className="btn flex-1 bg-[#F7931E]/20 hover:bg-[#F7931E]/30 border-[#F7931E]/30 text-[#F7931E] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <QrCode size={16} />
              Generate Single
            </button>
          </div>
        </div>
        
        {/* Right Column - Preview & Recent Exports */}
        <div className="space-y-4">
          {/* Preview */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Preview</h3>
            {previewItem ? (
              <div className="flex justify-center">
                <LabelPreview
                  sku={previewItem.sku}
                  name={previewItem.name}
                  location={previewItem.location}
                  supplier={previewItem.supplier}
                  showQR={true}
                  showLogo={settings.includeLogo}
                  showSupplier={settings.includeSupplier}
                  qrValue={qrValue}
                />
              </div>
            ) : (
              <div className="card p-8 text-center text-zinc-500 text-sm">
                Select an item to preview
              </div>
            )}
          </div>
          
          {/* Recent Exports */}
          {recentExports.length > 0 && (
            <div className="card p-4">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <History size={16} />
                Recent Exports
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="text-left border-b border-zinc-800">
                    <tr>
                      <th className="pb-2 text-zinc-400 font-medium">Date</th>
                      <th className="pb-2 text-zinc-400 font-medium">Type</th>
                      <th className="pb-2 text-zinc-400 font-medium">Items</th>
                      <th className="pb-2 text-zinc-400 font-medium">Format</th>
                      <th className="pb-2 text-zinc-400 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentExports.slice(0, 5).map((exp) => (
                      <tr key={exp.id} className="border-b border-zinc-800/50">
                        <td className="py-2 text-zinc-300">
                          {new Date(exp.date).toLocaleDateString()}
                        </td>
                        <td className="py-2">
                          <span className="px-2 py-0.5 bg-zinc-800 rounded text-[10px]">
                            {exp.type}
                          </span>
                        </td>
                        <td className="py-2 text-zinc-300">{exp.count}</td>
                        <td className="py-2 text-zinc-400">{exp.format}</td>
                        <td className="py-2">
                          <button
                            onClick={async () => {
                              // Re-generate the label
                              try {
                                if (exp.items && Array.isArray(exp.items)) {
                                  const pdf = await generateLabelSheet(exp.items, exp.settings || settings);
                                  pdf.save(exp.filename);
                                  toast('Label re-generated', 'success');
                                } else {
                                  toast('Export data not available for re-generation', 'error');
                                }
                              } catch (error) {
                                console.error('Failed to re-generate:', error);
                                toast('Failed to re-generate label', 'error');
                              }
                            }}
                            className="text-[#F7931E] hover:text-[#F7931E]/80 text-[10px] underline"
                          >
                            Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Settings Drawer */}
      <LabelSettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSave={(newSettings) => {
          setSettings(newSettings);
          toast('Settings saved', 'success');
        }}
      />
    </div>
  );
}
