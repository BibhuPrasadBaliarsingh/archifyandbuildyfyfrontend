import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader, FormField } from '../../components/ui/index.jsx';
import { Plus, Trash2 } from 'lucide-react';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';

const emptyLine = () => ({ description: '', quantity: 1, rate: 0, amount: 0 });

const DEFAULTS = {
  type: 'Invoice', clientName: '', clientAddress: '', clientContact: '',
  date: new Date().toISOString().split('T')[0], dueDate: '',
  lineItems: [emptyLine()], tax: 0, amountPaid: 0, notes: '',
  status: 'Unpaid',
};

const fmt = v => Number(v) || 0;
const rupee = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n || 0);

export default function InvoiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm]     = useState(DEFAULTS);
  const [busy, setBusy]     = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/invoices/${id}`)
      .then(r => {
        const d = r.data;
        setForm({
          ...DEFAULTS, ...d,
          date:    d.date    ? d.date.split('T')[0]    : DEFAULTS.date,
          dueDate: d.dueDate ? d.dueDate.split('T')[0] : '',
        });
      })
      .catch(() => toast.error('Failed to load invoice'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const setLine = (i, k, v) => {
    setForm(f => {
      const items = [...f.lineItems];
      items[i] = { ...items[i], [k]: v };
      if (k === 'quantity' || k === 'rate') {
        items[i].amount = fmt(items[i].quantity) * fmt(items[i].rate);
      }
      return { ...f, lineItems: items };
    });
  };

  const addLine    = ()  => setForm(f => ({ ...f, lineItems: [...f.lineItems, emptyLine()] }));
  const removeLine = (i) => setForm(f => ({ ...f, lineItems: f.lineItems.filter((_, idx) => idx !== i) }));

  const subTotal = form.lineItems.reduce((s, l) => s + fmt(l.amount), 0);
  const total    = subTotal + fmt(form.tax);
  const balance  = total - fmt(form.amountPaid);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = { ...form, subTotal, total, balance };
      if (isEdit) { await api.put(`/invoices/${id}`, payload); toast.success('Invoice updated'); }
      else        { await api.post('/invoices', payload);       toast.success('Invoice created'); }
      navigate('/admin/invoices');
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setBusy(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;

  return (
    <div className="max-w-3xl">
      <PageHeader title={isEdit ? 'Edit Invoice' : 'Create Invoice / Quotation'} />
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Document Type">
              <select className="input-field" value={form.type} onChange={e => set('type', e.target.value)}>
                <option>Invoice</option><option>Quotation</option><option>Receipt</option>
              </select>
            </FormField>
            <FormField label="Invoice / Quotation Date">
              <input className="input-field" type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
            </FormField>
            <FormField label="Client Name" required>
              <input className="input-field" value={form.clientName} onChange={e => set('clientName', e.target.value)} required />
            </FormField>
            <FormField label="Client Contact">
              <input className="input-field" value={form.clientContact} onChange={e => set('clientContact', e.target.value)} />
            </FormField>
            <FormField label="Client Address">
              <input className="input-field" value={form.clientAddress} onChange={e => set('clientAddress', e.target.value)} />
            </FormField>
            <FormField label="Due Date">
              <input className="input-field" type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
            </FormField>
          </div>
        </div>

        {/* Line Items */}
        <div className="card">
          <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide mb-4">Line Items</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500">Description</th>
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500 w-20">Qty</th>
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500 w-28">Rate (₹)</th>
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500 w-28">Amount (₹)</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {form.lineItems.map((line, i) => (
                  <tr key={i}>
                    <td className="py-2 px-2">
                      <input className="input-field" value={line.description} onChange={e => setLine(i, 'description', e.target.value)} placeholder="Service or item description" />
                    </td>
                    <td className="py-2 px-2">
                      <input className="input-field" type="number" min="1" value={line.quantity} onChange={e => setLine(i, 'quantity', e.target.value)} />
                    </td>
                    <td className="py-2 px-2">
                      <input className="input-field" type="number" min="0" value={line.rate} onChange={e => setLine(i, 'rate', e.target.value)} />
                    </td>
                    <td className="py-2 px-2">
                      <input className="input-field bg-gray-50" readOnly value={fmt(line.amount).toFixed(2)} />
                    </td>
                    <td className="py-2 px-1">
                      {form.lineItems.length > 1 && (
                        <button type="button" onClick={() => removeLine(i)} className="text-red-400 hover:text-red-600 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" onClick={addLine} className="mt-3 text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add Line
          </button>

          {/* Totals */}
          <div className="mt-5 ml-auto max-w-xs space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Sub Total</span>
              <span className="font-medium">{rupee(subTotal)}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-gray-500">Tax / Extra (₹)</span>
              <input className="input-field w-28 text-right py-1" type="number" min="0" value={form.tax} onChange={e => set('tax', e.target.value)} />
            </div>
            <div className="flex justify-between font-semibold text-base border-t border-gray-200 pt-2">
              <span>Total</span><span>{rupee(total)}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-gray-500">Amount Paid (₹)</span>
              <input className="input-field w-28 text-right py-1" type="number" min="0" value={form.amountPaid} onChange={e => set('amountPaid', e.target.value)} />
            </div>
            <div className="flex justify-between font-bold text-red-500 border-t border-gray-200 pt-2">
              <span>Balance Due</span><span>{rupee(balance)}</span>
            </div>
          </div>
        </div>

        <div className="card space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Payment Status">
              <select className="input-field" value={form.status} onChange={e => set('status', e.target.value)}>
                <option>Unpaid</option><option>Partial</option><option>Paid</option>
              </select>
            </FormField>
          </div>
          <FormField label="Notes / Terms & Conditions">
            <textarea className="input-field" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Payment terms, notes…" />
          </FormField>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={busy} className="btn-primary">{busy ? 'Saving…' : isEdit ? 'Update' : 'Create Invoice'}</button>
          <button type="button" onClick={() => navigate('/admin/invoices')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
