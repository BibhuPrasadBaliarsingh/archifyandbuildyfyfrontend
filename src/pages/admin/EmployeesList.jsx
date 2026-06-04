import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, DownloadCloud } from 'lucide-react';
import { PageHeader, DataTable, SearchBar, ConfirmDialog, StatusBadge } from '../../components/ui/index.jsx';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';

export default function EmployeesList() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch]   = useState('');
  const [busy, setBusy]       = useState(true);
  const [exporting, setExporting] = useState(false);
  const [delTarget, setDelTarget] = useState(null);
  const [delBusy, setDelBusy]     = useState(false);
  const navigate = useNavigate();

  const downloadExport = async () => {
    setExporting(true);
    try {
      const response = await api.get('/employees/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'employees.xls';
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

  const load = () => { setBusy(true); api.get('/employees').then(r => setEmployees(r.data)).catch(() => toast.error('Failed to load')).finally(() => setBusy(false)); };
  useEffect(load, []);

  const filtered = employees.filter(e =>
    `${e.first_name} ${e.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    e.username?.toLowerCase().includes(search.toLowerCase()) ||
    e.designation?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    setDelBusy(true);
    try { await api.delete(`/employees/${delTarget._id}`); toast.success('Employee deleted'); setDelTarget(null); load(); }
    catch { toast.error('Delete failed'); } finally { setDelBusy(false); }
  };

  const columns = [
    { key: '#',         label: '#',          render: r => filtered.indexOf(r) + 1 },
    { key: 'name',      label: 'Name',       render: r => <span className="font-medium">{r.first_name} {r.last_name}</span> },
    { key: 'username',  label: 'Username',   render: r => <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{r.username}</code> },
    { key: 'email',     label: 'Email' },
    { key: 'department', label: 'Department', render: r => r.department?.name || '—' },
    { key: 'shift',     label: 'Shift',      render: r => r.shift?.shift || '—' },
    { key: 'designation', label: 'Designation' },
    { key: 'gender',    label: 'Gender' },
    { key: 'phone',     label: 'Phone' },
    { key: 'status',    label: 'Status',     render: r => <StatusBadge status={r.status} /> },
    { key: 'actions',   label: 'Actions',    render: r => (
        <div className="flex gap-2">
          <button onClick={() => navigate(`/admin/employees/edit/${r._id}`)} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => setDelTarget(r)} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
        </div>
      )
    },
  ];

  return (
    <div>
      <PageHeader title="Employees" subtitle={`${filtered.length} employee${filtered.length !== 1 ? 's' : ''}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <button onClick={downloadExport} disabled={exporting} className="btn-secondary flex items-center gap-2 text-sm">
              <DownloadCloud className="w-4 h-4" />
              {exporting ? 'Exporting…' : 'Export Employees'}
            </button>
            <button onClick={() => navigate('/admin/employees/new')} className="btn-primary flex items-center gap-2 text-sm"><Plus className="w-4 h-4" /> Add Employee</button>
          </div>
        }
      />
      <div className="card">
        <div className="mb-4"><SearchBar value={search} onChange={setSearch} placeholder="Search employees…" /></div>
        <DataTable columns={columns} data={filtered} loading={busy} emptyText="No employees found." />
      </div>
      <ConfirmDialog open={!!delTarget} onClose={() => setDelTarget(null)} onConfirm={handleDelete} busy={delBusy}
        title="Delete Employee" message={`Delete employee "${delTarget?.first_name} ${delTarget?.last_name}"?`} />
    </div>
  );
}
