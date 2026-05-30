import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, FileText } from 'lucide-react';
import { PageHeader, DataTable, SearchBar, ConfirmDialog, StatusBadge } from '../../components/ui/index.jsx';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function ClientsList() {
  const [clients, setClients] = useState([]);
  const [search, setSearch]   = useState('');
  const [busy, setBusy]       = useState(true);
  const [delTarget, setDelTarget] = useState(null);
  const [delBusy, setDelBusy]     = useState(false);
  const navigate = useNavigate();

  const load = () => {
    setBusy(true);
    api.get('/clients').then(r => setClients(r.data)).catch(() => toast.error('Failed to load clients')).finally(() => setBusy(false));
  };
  useEffect(load, []);

  const filtered = clients.filter(c =>
    c.fullname?.toLowerCase().includes(search.toLowerCase()) ||
    c.contact_number?.includes(search) ||
    c.services?.join(' ').toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    setDelBusy(true);
    try {
      await api.delete(`/clients/${delTarget._id}`);
      toast.success('Client deleted');
      setDelTarget(null);
      load();
    } catch { toast.error('Delete failed'); }
    finally { setDelBusy(false); }
  };

  const columns = [
    { key: '#',       label: '#',               render: (_, i) => i + 1 },
    { key: 'fullname', label: 'Full Name',       render: r => <span className="font-medium text-gray-900">{r.fullname}</span> },
    { key: 'gender',   label: 'Gender' },
    { key: 'contact_number', label: 'Contact' },
    { key: 'whatsapp_number', label: 'WhatsApp' },
    { key: 'dor',      label: 'D.O.R',           render: r => r.dor ? format(new Date(r.dor), 'dd MMM yyyy') : '—' },
    { key: 'services', label: 'Services',         render: r => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {(r.services || []).slice(0, 2).map(s => <span key={s} className="badge-info text-[10px]">{s}</span>)}
          {r.services?.length > 2 && <span className="badge-gray text-[10px]">+{r.services.length - 2}</span>}
        </div>
      )
    },
    { key: 'quotation', label: 'Quotation',       render: r => r.quotation
        ? <a href={`/uploads/quotations/${r.quotation}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-xs"><FileText className="w-3 h-3" /> View</a>
        : '—'
    },
    { key: 'actions', label: 'Actions',           render: r => (
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(`/admin/clients/edit/${r._id}`)} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={() => setDelTarget(r)} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    },
  ];

  // Fix render signature for DataTable
  const fixedCols = columns.map(col => ({
    ...col,
    render: col.render
      ? (row) => col.render(row)
      : undefined,
  }));
  // '#' column special
  fixedCols[0].render = (row) => filtered.indexOf(row) + 1;

  return (
    <div>
      <PageHeader
        title="Clients List"
        subtitle={`${filtered.length} client${filtered.length !== 1 ? 's' : ''}`}
        actions={
          <button onClick={() => navigate('/admin/clients/new')} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Add Client
          </button>
        }
      />
      <div className="card">
        <div className="mb-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name, contact, service…" />
        </div>
        <DataTable columns={fixedCols} data={filtered} loading={busy} emptyText="No clients found. Add your first client!" />
      </div>

      <ConfirmDialog
        open={!!delTarget}
        onClose={() => setDelTarget(null)}
        onConfirm={handleDelete}
        busy={delBusy}
        title="Delete Client"
        message={`Are you sure you want to delete "${delTarget?.fullname}"? This action cannot be undone.`}
      />
    </div>
  );
}
