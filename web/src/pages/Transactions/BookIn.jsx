import { useState } from 'react';
import FormField from '../../components/FormField.jsx';
import { createTransaction } from '../../api/txApi.js';
import { useApp } from '../../context/AppContext.jsx';

export default function BookIn() {
  const { user, activeSite, toast } = useApp();
  const [form, setForm] = useState({ partId: 'p1', qty: 1, uom: 'EA', site: activeSite, bin: 'A1-01', note: '' });
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createTransaction({ type: 'BOOK_IN', ...form, user: user.name });
      toast('Booked in successfully');
    } catch (e) {
      toast('Error booking in');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="card p-4 space-y-3" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">Book In</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <FormField label="Part ID">
          <input className="input w-full" value={form.partId} onChange={(e) => setForm({ ...form, partId: e.target.value })} />
        </FormField>
        <FormField label="Qty">
          <input type="number" className="input w-full" value={form.qty} onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })} />
        </FormField>
        <FormField label="UoM">
          <input className="input w-full" value={form.uom} onChange={(e) => setForm({ ...form, uom: e.target.value })} />
        </FormField>
        <FormField label="Site">
          <input className="input w-full" value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })} />
        </FormField>
        <FormField label="Bin">
          <input className="input w-full" value={form.bin} onChange={(e) => setForm({ ...form, bin: e.target.value })} />
        </FormField>
        <FormField label="Note">
          <input className="input w-full" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        </FormField>
      </div>
      <div className="pt-2">
        <button className="btn" type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Book In'}</button>
      </div>
    </form>
  );
}


