import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader, FormField } from '../../components/ui/index.jsx';
import { Plus, Trash2 } from 'lucide-react';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';

const emptyLine = () => ({ description: '', quantity: 1, rate: 0, amount: 0 });

const DEFAULTS = {
  type: 'Invoice', invoiceNumber: '', address: '', clientName: '', clientAddress: '', clientContact: '',
  date: new Date().toISOString().split('T')[0], dueDate: '', quotationDate: '', validDate: '',
  requestedBy: '', presentAddress: '', projectLocation: '', projectType: '', contactNumber: '', preparedBy: '', planType: '',
  area: 0, ground: 0, first: 0, second: 0, third: 0, fourth: 0, fifth: 0, totalArea: 0, unitPrice: 0,
  discount: 0, description: '', notes: '', tax: 0, amountPaid: 0,
  status: 'Unpaid', lineItems: [emptyLine()],
};

const fmt = v => Number(v) || 0;
const rupee = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n || 0);

const QUOTATION_OPTIONS = [
  '',
  '2D (Two Dimensional) plan',
  '3D (Three Dimensional) Elevation',
  'Interior Design',
  'Landscaping',
  'Building Plan Approval',
];

export default function InvoiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(DEFAULTS);
  const [generatedNumber, setGeneratedNumber] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/invoices/${id}`)
      .then(r => {
        const d = r.data;
        setForm({
          ...DEFAULTS,
          ...d,
          invoiceNumber: d.invoiceNumber || d.invoice_number || '',
          date: d.date ? d.date.split('T')[0] : DEFAULTS.date,
          dueDate: d.dueDate ? d.dueDate.split('T')[0] : '',
          quotationDate: d.quotationDate ? d.quotationDate.split('T')[0] : '',
          validDate: d.validDate ? d.validDate.split('T')[0] : '',
        });
      })
      .catch(() => toast.error('Failed to load invoice'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  useEffect(() => {
    if (isEdit) return;
    api.get(`/invoices/next-number?type=${encodeURIComponent(form.type)}`)
      .then(r => setGeneratedNumber(r.data.invoiceNumber || ''))
      .catch(() => setGeneratedNumber(''));
  }, [form.type, isEdit]);

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const setLine = (index, key, value) => {
    setForm(prev => {
      const items = [...prev.lineItems];
      items[index] = { ...items[index], [key]: value };
      if (key === 'quantity' || key === 'rate') {
        items[index].amount = fmt(items[index].quantity) * fmt(items[index].rate);
      }
      return { ...prev, lineItems: items };
    });
  };

  const addLine = () => setForm(prev => ({ ...prev, lineItems: [...prev.lineItems, emptyLine()] }));
  const removeLine = (index) => setForm(prev => ({ ...prev, lineItems: prev.lineItems.filter((_, idx) => idx !== index) }));

  const hasLineItems = form.type !== 'Quotation' && form.lineItems.some(line => fmt(line.amount) > 0);
  const lineSubTotal = form.lineItems.reduce((sum, line) => sum + fmt(line.amount), 0);
  const lineTotal = lineSubTotal + fmt(form.tax);

  const legacyInvoiceBase = fmt(form.area) * fmt(form.unitPrice);
  const legacyInvoiceDiscount = legacyInvoiceBase * fmt(form.discount) / 100;
  const legacyInvoiceSubTotal = Math.max(0, legacyInvoiceBase - legacyInvoiceDiscount);
  const legacyInvoiceTax = legacyInvoiceSubTotal * fmt(form.tax) / 100;
  const legacyInvoiceTotal = legacyInvoiceSubTotal + legacyInvoiceTax;

  const quotationTotalArea = fmt(form.ground) + fmt(form.first) + fmt(form.second) + fmt(form.third) + fmt(form.fourth) + fmt(form.fifth);
  const quotationGrandTotal = quotationTotalArea * fmt(form.unitPrice);

  const displaySubTotal = hasLineItems ? lineSubTotal : form.type === 'Quotation' ? quotationGrandTotal : legacyInvoiceSubTotal;
  const displayTotal = hasLineItems ? lineTotal : form.type === 'Quotation' ? quotationGrandTotal : legacyInvoiceTotal;
  const displayBalance = displayTotal - fmt(form.amountPaid);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        ...form,
        invoiceNumber: form.invoiceNumber || generatedNumber,
        subTotal: displaySubTotal,
        total: displayTotal,
        balance: displayBalance,
        lineItems: form.type === 'Quotation' ? [] : form.lineItems,
      };

      if (form.type === 'Quotation') {
        payload.totalArea = quotationTotalArea;
        payload.date = undefined;
        payload.dueDate = undefined;
      } else {
        payload.quotationDate = undefined;
        payload.validDate = undefined;
      }

      if (isEdit) {
        await api.put(`/invoices/${id}`, payload);
        toast.success('Invoice updated');
      } else {
        await api.post('/invoices', payload);
        toast.success('Invoice created');
      }
      navigate('/admin/invoices');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;

  return (
    <div className="w-full">
      <PageHeader title={isEdit ? `Edit ${form.type}` : `Create ${form.type}`} />
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Document Type">
              <select className="input-field" value={form.type} onChange={e => set('type', e.target.value)}>
                <option>Invoice</option>
                <option>Quotation</option>
                <option>Receipt</option>
              </select>
            </FormField>
            <FormField label="Document Number">
              <input className="input-field" value={form.invoiceNumber || generatedNumber} onChange={e => set('invoiceNumber', e.target.value)} placeholder="Auto-generated" />
            </FormField>
            <FormField label={form.type === 'Quotation' ? 'Quotation Date' : 'Invoice Date'}>
              <input
                className="input-field"
                type="date"
                value={form.type === 'Quotation' ? form.quotationDate : form.date}
                onChange={e => set(form.type === 'Quotation' ? 'quotationDate' : 'date', e.target.value)}
                required
              />
            </FormField>
            <FormField label={form.type === 'Quotation' ? 'Valid Date' : 'Due Date'}>
              <input
                className="input-field"
                type="date"
                value={form.type === 'Quotation' ? form.validDate : form.dueDate}
                onChange={e => set(form.type === 'Quotation' ? 'validDate' : 'dueDate', e.target.value)}
              />
            </FormField>
            <FormField label="Address">
              {form.type === 'Quotation' ? (
                <select className="input-field" value={form.address} onChange={e => set('address', e.target.value)}>
                  <option value="">Select address</option>
                  <option value="Raj Nivas,G.A. 432,B1,Second floor,near DAV School,Kalinga Nagar,Bhubaneswar,Odisha 751003">Raj Nivas,G.A. 432,B1,Second floor,near DAV School,Kalinga Nagar,Bhubaneswar,Odisha 751003</option>
                  <option value="Mission Chowk, Jyoti Nagar, Sundargarh, Odisha, 770001">Mission Chowk, Jyoti Nagar, Sundargarh, Odisha, 770001</option>
                </select>
              ) : (
                <input className="input-field" value={form.address} onChange={e => set('address', e.target.value)} />
              )}
            </FormField>
            {form.type === 'Quotation' ? (
              <>
                <FormField label="Requested By" required>
                  <input className="input-field" value={form.requestedBy} onChange={e => set('requestedBy', e.target.value)} required />
                </FormField>
                <FormField label="Present Address">
                  <input className="input-field" value={form.presentAddress} onChange={e => set('presentAddress', e.target.value)} />
                </FormField>
                <FormField label="Project Location">
                  <input className="input-field" value={form.projectLocation} onChange={e => set('projectLocation', e.target.value)} />
                </FormField>
                <FormField label="Project Type">
                  <select className="input-field" value={form.projectType} onChange={e => set('projectType', e.target.value)}>
                    <option value="">Select</option>
                    {QUOTATION_OPTIONS.slice(1).map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Contact Number">
                  <input className="input-field" value={form.contactNumber} onChange={e => set('contactNumber', e.target.value)} />
                </FormField>
                <FormField label="Prepared By">
                  <input className="input-field" value={form.preparedBy} onChange={e => set('preparedBy', e.target.value)} />
                </FormField>
              </>
            ) : (
              <>
                <FormField label="Client Name" required>
                  <input className="input-field" value={form.clientName} onChange={e => set('clientName', e.target.value)} required />
                </FormField>
                <FormField label="Client Contact">
                  <input className="input-field" value={form.clientContact} onChange={e => set('clientContact', e.target.value)} />
                </FormField>
                <FormField label="Client Address">
                  <input className="input-field" value={form.clientAddress} onChange={e => set('clientAddress', e.target.value)} />
                </FormField>
              </>
            )}
          </div>
        </div>

        {form.type === 'Quotation' ? (
          <div className="card space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField label="Description">
                <select className="input-field" value={form.description} onChange={e => set('description', e.target.value)}>
                  <option value="">Select</option>
                  {QUOTATION_OPTIONS.slice(1).map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Plan Type">
                <input className="input-field" value={form.planType} onChange={e => set('planType', e.target.value)} />
              </FormField>
              <FormField label="Ground">
                <input className="input-field" type="number" min="0" value={form.ground} onChange={e => set('ground', e.target.value)} />
              </FormField>
              <FormField label="First">
                <input className="input-field" type="number" min="0" value={form.first} onChange={e => set('first', e.target.value)} />
              </FormField>
              <FormField label="Second">
                <input className="input-field" type="number" min="0" value={form.second} onChange={e => set('second', e.target.value)} />
              </FormField>
              <FormField label="Third">
                <input className="input-field" type="number" min="0" value={form.third} onChange={e => set('third', e.target.value)} />
              </FormField>
              <FormField label="Fourth">
                <input className="input-field" type="number" min="0" value={form.fourth} onChange={e => set('fourth', e.target.value)} />
              </FormField>
              <FormField label="Fifth">
                <input className="input-field" type="number" min="0" value={form.fifth} onChange={e => set('fifth', e.target.value)} />
              </FormField>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <FormField label="Total Area">
                <input className="input-field bg-gray-50" readOnly value={quotationTotalArea} />
              </FormField>
              <FormField label="Unit Price (₹)">
                <input className="input-field" type="number" min="0" value={form.unitPrice} onChange={e => set('unitPrice', e.target.value)} />
              </FormField>
              <FormField label="Grand Total (₹)">
                <input className="input-field bg-gray-50" readOnly value={rupee(quotationGrandTotal)} />
              </FormField>
            </div>
          </div>
        ) : (
          <div className="card space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField label="Description">
                <textarea className="input-field" rows={3} value={form.description} onChange={e => set('description', e.target.value)} />
              </FormField>
              <FormField label="Area">
                <input className="input-field" type="number" min="0" value={form.area || ''} onChange={e => set('area', e.target.value)} />
              </FormField>
              <FormField label="Unit Price (₹)">
                <input className="input-field" type="number" min="0" value={form.unitPrice} onChange={e => set('unitPrice', e.target.value)} />
              </FormField>
              <FormField label="Discount (%)">
                <input className="input-field" type="number" min="0" value={form.discount} onChange={e => set('discount', e.target.value)} />
              </FormField>
              <FormField label="GST (%)">
                <input className="input-field" type="number" min="0" value={form.tax} onChange={e => set('tax', e.target.value)} />
              </FormField>
              <FormField label="Grand Total (₹)">
                <input className="input-field bg-gray-50" readOnly value={rupee(legacyInvoiceTotal)} />
              </FormField>
            </div>
          </div>
        )}

        {form.type !== 'Quotation' && (
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

            <div className="mt-5 ml-auto max-w-xs space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Sub Total</span>
                <span className="font-medium">{rupee(lineSubTotal)}</span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="text-gray-500">Tax / Extra (₹)</span>
                <input className="input-field w-28 text-right py-1" type="number" min="0" value={form.tax} onChange={e => set('tax', e.target.value)} />
              </div>
              <div className="flex justify-between font-semibold text-base border-t border-gray-200 pt-2">
                <span>Total</span><span>{rupee(lineTotal)}</span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="text-gray-500">Amount Paid (₹)</span>
                <input className="input-field w-28 text-right py-1" type="number" min="0" value={form.amountPaid} onChange={e => set('amountPaid', e.target.value)} />
              </div>
              <div className="flex justify-between font-bold text-red-500 border-t border-gray-200 pt-2">
                <span>Balance Due</span><span>{rupee(lineTotal - fmt(form.amountPaid))}</span>
              </div>
            </div>
          </div>
        )}

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
          <button type="submit" disabled={busy} className="btn-primary">{busy ? 'Saving…' : isEdit ? 'Update' : `Create ${form.type}`}</button>
          <button type="button" onClick={() => navigate('/admin/invoices')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
