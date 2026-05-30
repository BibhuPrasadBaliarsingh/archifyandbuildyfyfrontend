import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { PageHeader, DataTable, SearchBar, ConfirmDialog, StatusBadge } from '../../components/ui/index.jsx';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';

export default function StaffsList() {
  const [staffs, setStaffs]       = useState([]);
  const [search, setSearch]       = useState('');
  const [busy, setBusy]           = useState(true);
  const [delTarget, setDelTarget] = useState(null);
  const [delBusy, setDelBusy]     = useState(false);
  const navigate = useNavigate();

  const load = () => { setBusy(true); api.get('/staffs').then(r => setStaffs(r.data)).catch(() => toast.error('Failed to load')).finally(() => setBusy(false)); };
  useEffect(load, []);

  const filtered = staffs.filter(s =>
    s.fullname?.toLowerCase().includes(search.toLowerCase()) ||
    s.username?.toLowerCase().includes(search.toLowerCase()) ||
    s.designation?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    setDelBusy(true);
    try { await api.delete(`/staffs/${delTarget._id}`); toast.success('Staff deleted'); setDelTarget(null); load(); }
    catch { toast.error('Delete failed'); } finally { setDelBusy(false); }
  };

  const columns = [
    { key: '#',          label: '#',            render: r => filtered.indexOf(r) + 1 },
    { key: 'fullname',   label: 'Full Name',    render: r => <span className="font-medium text-gray-900">{r.fullname}</span> },
    { key: 'username',   label: 'Username',     render: r => <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{r.username}</code> },
    { key: 'email',      label: 'Email' },
    { key: 'designation', label: 'Designation' },
    { key: 'gender',     label: 'Gender' },
    { key: 'contact',    label: 'Contact' },
    { key: 'status',     label: 'Status',       render: r => <StatusBadge status={r.status} /> },
    { key: 'actions',    label: 'Actions',      render: r => (
        <div className="flex gap-2">
          <button onClick={() => navigate(`/admin/staffs/edit/${r._id}`)} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => setDelTarget(r)} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
        </div>
      )
    },
  ];

  return (
    <div>
      <PageHeader title="Staff / Architects" subtitle={`${filtered.length} staff member${filtered.length !== 1 ? 's' : ''}`}
        actions={<button onClick={() => navigate('/admin/staffs/new')} className="btn-primary flex items-center gap-2 text-sm"><Plus className="w-4 h-4" /> Add Staff</button>}
      />
      <div className="card">
        <div className="mb-4"><SearchBar value={search} onChange={setSearch} placeholder="Search by name, username…" /></div>
        <DataTable columns={columns} data={filtered} loading={busy} emptyText="No staff found." />
      </div>
      <ConfirmDialog open={!!delTarget} onClose={() => setDelTarget(null)} onConfirm={handleDelete} busy={delBusy}
        title="Delete Staff" message={`Delete staff member "${delTarget?.fullname}"?`} />
    </div>
  );
}
