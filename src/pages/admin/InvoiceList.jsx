import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Printer } from 'lucide-react';
import { PageHeader, DataTable, SearchBar, ConfirmDialog, StatusBadge } from '../../components/ui/index.jsx';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const TYPES = ['All', 'Invoice', 'Quotation', 'Receipt'];

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

export default function InvoiceList() {
  const [invoices, setInvoices]   = useState([]);
  const [search, setSearch]       = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [busy, setBusy]           = useState(true);
  const [exporting, setExporting] = useState(false);
  const [delTarget, setDelTarget] = useState(null);
  const [delBusy, setDelBusy]     = useState(false);
  const navigate = useNavigate();

  const load = () => {
    setBusy(true);
    api.get('/invoices').then(r => setInvoices(r.data)).catch(() => toast.error('Failed to load')).finally(() => setBusy(false));
  };
  useEffect(load, []);

  const getInvoiceField = (invoice, ...keys) =>
    keys.map(key => invoice[key]).find(value => value !== undefined && value !== null && value !== '') || '';

  const filtered = invoices.filter(inv => {
    const matchType = typeFilter === 'All' || inv.type === typeFilter;
    const clientName = getInvoiceField(inv, 'clientName', 'client_name', 'requestedBy', 'requested_by');
    const invoiceDate = getInvoiceField(inv, 'date', 'invoice_date', 'quotationDate', 'quotation_date', 'receipt_date');
    const matchSearch = getInvoiceField(inv, 'invoiceNumber', 'invoice_number').toLowerCase().includes(search.toLowerCase()) ||
                        clientName.toLowerCase().includes(search.toLowerCase()) ||
                        invoiceDate.toString().toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const downloadExport = async () => {
    setExporting(true);
    try {
      const response = await api.get('/invoices/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'invoices.xls';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Invoice export ready');
    } catch (err) {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    setDelBusy(true);
    try { await api.delete(`/invoices/${delTarget._id}`); toast.success('Invoice deleted'); setDelTarget(null); load(); }
    catch { toast.error('Delete failed'); } finally { setDelBusy(false); }
  };


  const columns = [
    { key: '#',             label: '#',            render: r => filtered.indexOf(r) + 1 },
    { key: 'invoiceNumber', label: 'Invoice #',    render: r => <span className="font-mono text-xs font-semibold text-blue-700">{getInvoiceField(r, 'invoiceNumber', 'invoice_number')}</span> },
    { key: 'type',          label: 'Type',         render: r => <span className="badge-info text-[10px]">{r.type}</span> },
    { key: 'clientName',    label: 'Client',       render: r => <span className="font-medium">{getInvoiceField(r, 'clientName', 'client_name', 'requestedBy', 'requested_by') || '—'}</span> },
    { key: 'date',          label: 'Date',         render: r => {
        const invoiceDate = getInvoiceField(r, 'date', 'invoice_date', 'quotationDate', 'quotation_date', 'receipt_date');
        return invoiceDate ? format(new Date(invoiceDate), 'dd MMM yyyy') : '—';
      }
    },
    { key: 'total',         label: 'Total',        render: r => <span className="font-semibold">{fmt(r.total)}</span> },
    { key: 'amountPaid',    label: 'Paid',         render: r => <span className="text-green-600 font-medium">{fmt(r.amountPaid)}</span> },
    { key: 'balance',       label: 'Balance',      render: r => <span className={r.balance > 0 ? 'text-red-500 font-medium' : 'text-gray-500'}>{fmt(r.balance)}</span> },
    { key: 'status',        label: 'Status',       render: r => <StatusBadge status={r.status} /> },
    { key: 'actions',       label: 'Actions',      render: r => (
        <div className="flex gap-2">
          <button onClick={() => window.open(`/admin/invoices/print/${r._id}`, '_blank')} title="Print Invoice" className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100"><Printer className="w-4 h-4" /></button>
          <button onClick={() => navigate(`/admin/invoices/edit/${r._id}`)} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => setDelTarget(r)} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
        </div>
      )
    },
  ];

  // Summary totals
  const totalRev  = filtered.reduce((s, i) => s + (i.total || 0), 0);
  const totalPaid = filtered.reduce((s, i) => s + (i.amountPaid || 0), 0);
  const totalBal  = filtered.reduce((s, i) => s + (i.balance || 0), 0);

  return (
    <div>
      <PageHeader title="Invoices & Payments" subtitle={`${filtered.length} record${filtered.length !== 1 ? 's' : ''}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <button onClick={downloadExport} disabled={exporting} className="btn-secondary flex items-center gap-2 text-sm">
              {exporting ? 'Exporting…' : 'Export Invoices'}
            </button>
            <button onClick={() => navigate('/admin/invoices/new')} className="btn-primary flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> New Invoice
            </button>
          </div>
        }
      />

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="card text-center py-3"><p className="text-xs text-gray-500">Total</p><p className="text-lg font-bold text-gray-800">{fmt(totalRev)}</p></div>
        <div className="card text-center py-3"><p className="text-xs text-gray-500">Collected</p><p className="text-lg font-bold text-green-600">{fmt(totalPaid)}</p></div>
        <div className="card text-center py-3"><p className="text-xs text-gray-500">Outstanding</p><p className="text-lg font-bold text-red-500">{fmt(totalBal)}</p></div>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search invoice # or client…" />
          <div className="flex gap-1">
            {TYPES.map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${typeFilter === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <DataTable columns={columns} data={filtered} loading={busy} emptyText="No invoices found." />
      </div>

      <ConfirmDialog open={!!delTarget} onClose={() => setDelTarget(null)} onConfirm={handleDelete} busy={delBusy}
        title="Delete Invoice" message={`Delete invoice "${delTarget?.invoiceNumber}"?`} />
    </div>
  );
}
