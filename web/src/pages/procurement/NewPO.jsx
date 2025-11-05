export default function NewPO() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>New Purchase Order</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
        Create a new purchase order. Select a supplier and add line items to create your PO.
      </p>
      {/* Form or component content goes here */}
      <div className="card p-6">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Purchase order creation form will be implemented here.
        </p>
      </div>
    </div>
  );
}

