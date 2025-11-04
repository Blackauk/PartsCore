import { useState, useMemo } from 'react';
import { Search, BookOpen, Package, ShoppingCart, HelpCircle, ChevronDown, ChevronRight, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const helpSections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: BookOpen,
    items: [
      { q: 'How to book in parts?', a: 'Navigate to Movements → Receive. Enter the GRN number, select parts, and confirm quantities. You can attach delivery notes using drag-and-drop or file picker.' },
      { q: 'How to create a PO?', a: 'Go to Procurement → Purchase Orders and click "New PO". Fill in supplier, site, expected delivery date, and add line items. Save as draft or submit for approval.' },
      { q: 'How to attach delivery notes?', a: 'When receiving a delivery or viewing a GRN, use the "Attach Delivery Note" button. Supports drag-and-drop, click to browse, or paste from clipboard. Accepted formats: PDF, images.' },
    ],
  },
  {
    id: 'inventory',
    title: 'Inventory Management',
    icon: Package,
    items: [
      { q: 'How to receive stock?', a: 'Go to Movements → Receive, select the pending delivery (PO), and enter received quantities. You can also reject items and add notes. The system will update stock levels automatically.' },
      { q: 'How to transfer between sites?', a: 'Use Movements → Transfer. Select source and destination sites/zones, pick parts, and confirm quantities. Transfers update inventory at both locations immediately.' },
      { q: 'How to adjust stock?', a: 'Navigate to Movements → Adjust. Select site/zone/bin, part number, and enter the adjustment (positive or negative). Add a reason code and notes for audit purposes.' },
    ],
  },
  {
    id: 'purchase-orders',
    title: 'Purchase Orders',
    icon: ShoppingCart,
    items: [
      { q: 'Creating and closing POs', a: 'Create POs from Procurement → Purchase Orders. To close a PO, ensure all line items are fully received. Partially received POs remain open until complete.' },
      { q: 'Chasing overdue deliveries', a: 'On the Dashboard, find the "Overdue Deliveries" card. Click "Chase" to open a prefilled email to the supplier. The email includes PO number, overdue items, and quantities.' },
      { q: 'Viewing PO details', a: 'Click "View PO" from any PO list or dashboard. The detail page shows supplier info, line items, status, and attachments. Export to PDF using the "Export PDF" button.' },
    ],
  },
  {
    id: 'tips',
    title: 'Tips & Shortcuts',
    icon: HelpCircle,
    items: [
      { q: 'Keyboard shortcuts', a: 'Press "/" to focus search. Use Tab/Shift+Tab to navigate between fields. Escape closes modals.' },
      { q: 'Custom filters', a: 'Most tables support filtering. Use the filter bar to narrow results by site, supplier, status, or date range.' },
      { q: 'Export data', a: 'Use the CSV export button on most table views. Purchase Orders can be exported as PDFs with full formatting.' },
    ],
  },
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openSections, setOpenSections] = useState(new Set(['getting-started']));

  const toggleSection = (id) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Filter FAQs based on search
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return helpSections;

    const query = searchQuery.toLowerCase();
    return helpSections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            item.q.toLowerCase().includes(query) ||
            item.a.toLowerCase().includes(query)
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [searchQuery]);

  // Auto-expand sections with search matches
  useMemo(() => {
    if (searchQuery.trim()) {
      const matchingIds = filteredSections.map((s) => s.id);
      setOpenSections(new Set(matchingIds));
    }
  }, [searchQuery, filteredSections]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold mb-2 flex items-center gap-2">
          <HelpCircle size={28} style={{ color: 'var(--brand-orange)' }} />
          Help Centre
        </h1>
        <p className="text-sm text-zinc-400">
          Quick guides, FAQs, and troubleshooting
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4 pointer-events-none" />
        <input
          type="text"
          placeholder="Search help topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border input"
              style={{
                borderColor: 'var(--border-color)',
                backgroundColor: 'var(--bg-panel)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 2px var(--brand-orange)';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(247, 147, 30, 0.5)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = '';
              }}
        />
      </div>

      {/* FAQ Sections */}
      <div className="space-y-3">
        {filteredSections.map((section) => {
          const Icon = section.icon;
          const isOpen = openSections.has(section.id);
          
          return (
            <div key={section.id} className="card p-4">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} style={{ color: 'var(--brand-orange)' }} />
                  <h2 className="font-semibold text-base">{section.title}</h2>
                  <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
                    {section.items.length}
                  </span>
                </div>
                {isOpen ? (
                  <ChevronDown className="text-zinc-400" size={18} />
                ) : (
                  <ChevronRight className="text-zinc-400" size={18} />
                )}
              </button>

              {isOpen && (
                <div className="mt-4 space-y-4 pt-4 border-t border-zinc-800">
                  {section.items.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <h3 className="font-medium text-sm text-zinc-200">{item.q}</h3>
                      <p className="text-sm text-zinc-400 leading-relaxed">{item.a}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Contact Section */}
      <div className="card p-6" style={{ backgroundColor: 'rgba(247, 147, 30, 0.1)', borderColor: 'rgba(247, 147, 30, 0.2)' }}>
        <div className="flex items-start gap-3">
          <Mail className="flex-shrink-0 mt-1" size={20} style={{ color: 'var(--brand-orange)' }} />
          <div>
            <h3 className="font-semibold mb-1">Still need help?</h3>
            <p className="text-sm text-zinc-400 mb-3">
              Can't find what you're looking for? Contact our support team.
            </p>
            <div className="flex gap-2">
              <a
                href="mailto:support@blockwork-it.co.uk"
                className="btn"
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
                <Mail size={16} />
                Email Support
              </a>
              <Link
                to="/feedback"
                className="btn-secondary"
              >
                Submit a Request
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

