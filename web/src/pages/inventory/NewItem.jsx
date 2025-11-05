export default function NewItem() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>New Item</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
        Create a new inventory item. Fill in the details below to add an item to your stock.
      </p>
      {/* Form or component content goes here */}
      <div className="card p-6">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Item creation form will be implemented here.
        </p>
      </div>
    </div>
  );
}

