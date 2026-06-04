import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { PageHeader, DataTable, SearchBar, ConfirmDialog, StatusBadge } from '../../components/ui/index.jsx';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function LeadsList() {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [delTarget, setDelTarget] = useState(null);
  const [delBusy, setDelBusy] = useState(false);
  const navigate = useNavigate();

  const downloadExport = async () => {
    setExporting(true);
    try {
      const response = await api.get('/leads/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'leads.xls';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const load = () => { setBusy(true); api.get('/leads').then(r => setLeads(r.data)).catch(() => toast.error('Failed to load')).finally(() => setBusy(false)); };
  useEffect(load, []);

  const filtered = leads.filter(l =>
    l.lead_name?.toLowerCase().includes(search.toLowerCase()) ||
    l.contact_number?.includes(search) ||
    l.project_type?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    setDelBusy(true);
    try { await api.delete(`/leads/${delTarget._id}`); toast.success('Lead deleted'); setDelTarget(null); load(); }
    catch { toast.error('Delete failed'); } finally { setDelBusy(false); }
  };

  const columns = [
    { key: '#',              label: '#',              render: (r) => filtered.indexOf(r) + 1 },
    { key: 'lead_name',      label: 'Lead Name',      render: r => <span className="font-medium">{r.lead_name}</span> },
    { key: 'contact_number', label: 'Contact' },
    { key: 'email_address',  label: 'Email' },
    { key: 'lead_source',    label: 'Source' },
    { key: 'project_type',   label: 'Project Type' },
    { key: 'project_budget', label: 'Budget' },
    { key: 'lead_status',    label: 'Status',         render: r => <StatusBadge status={r.lead_status} /> },
    { key: 'lead_priority',  label: 'Priority',       render: r => <StatusBadge status={r.lead_priority} /> },
    { key: 'createdAt',      label: 'Added',          render: r => format(new Date(r.createdAt), 'dd MMM yy') },
    { key: 'actions', label: 'Actions', render: r => (
        <div className="flex gap-2">
          <button onClick={() => navigate(`/admin/leads/edit/${r._id}`)} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => setDelTarget(r)} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
        </div>
      )
    },
  ];

  return (
    <div>
      <PageHeader title="Leads Management" subtitle={`${filtered.length} lead${filtered.length !== 1 ? 's' : ''}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <button onClick={downloadExport} disabled={exporting} className="btn-secondary flex items-center gap-2 text-sm">
              {exporting ? 'Exporting…' : 'Export Leads'}
            </button>
            <button onClick={() => navigate('/admin/leads/new')} className="btn-primary flex items-center gap-2 text-sm"><Plus className="w-4 h-4" /> Add Lead</button>
          </div>
        }
      />
      <div className="card">
        <div className="mb-4"><SearchBar value={search} onChange={setSearch} placeholder="Search leads…" /></div>
        <DataTable columns={columns} data={filtered} loading={busy} emptyText="No leads found." />
      </div>
      <ConfirmDialog open={!!delTarget} onClose={() => setDelTarget(null)} onConfirm={handleDelete} busy={delBusy}
        title="Delete Lead" message={`Delete lead "${delTarget?.lead_name}"?`} />
    </div>
  );
}
