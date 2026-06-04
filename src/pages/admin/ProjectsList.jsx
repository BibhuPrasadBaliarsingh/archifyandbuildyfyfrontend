import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { PageHeader, DataTable, SearchBar, ConfirmDialog, StatusBadge } from '../../components/ui/index.jsx';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const TASKS = ['twoDPlan','threeDElevation','interiorDesign','planApproved','structureDetailing','threeDElevationDetailing','landscapeDesigning','constructionDrawing'];
const TASK_LABELS = { twoDPlan:'2D', threeDElevation:'3D', interiorDesign:'Int', planApproved:'Plan', structureDetailing:'Struct', threeDElevationDetailing:'3D Det', landscapeDesigning:'Land', constructionDrawing:'Const' };

const statusColor = { Completed: 'bg-green-500', 'In Progress': 'bg-blue-500', Pending: 'bg-yellow-400', 'N/A': 'bg-gray-300' };

export default function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch]     = useState('');
  const [busy, setBusy]         = useState(true);
  const [exporting, setExporting] = useState(false);
  const [delTarget, setDelTarget] = useState(null);
  const [delBusy, setDelBusy]   = useState(false);
  const navigate = useNavigate();

  const downloadExport = async () => {
    setExporting(true);
    try {
      const response = await api.get('/projects/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'projects.xls';
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

  const load = () => { setBusy(true); api.get('/projects').then(r => setProjects(r.data)).catch(() => toast.error('Failed to load')).finally(() => setBusy(false)); };
  useEffect(load, []);

  const filtered = projects.filter(p =>
    p.clientName?.toLowerCase().includes(search.toLowerCase()) ||
    p.contactNumber?.includes(search) ||
    p.projectLocation?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    setDelBusy(true);
    try { await api.delete(`/projects/${delTarget._id}`); toast.success('Project deleted'); setDelTarget(null); load(); }
    catch { toast.error('Delete failed'); } finally { setDelBusy(false); }
  };

  const columns = [
    { key: '#',             label: '#',              render: r => filtered.indexOf(r) + 1 },
    { key: 'date',          label: 'Date',           render: r => r.date ? format(new Date(r.date), 'dd MMM yy') : '—' },
    { key: 'clientName',    label: 'Client',         render: r => <span className="font-medium">{r.clientName}</span> },
    { key: 'contactNumber', label: 'Contact' },
    { key: 'projectType',   label: 'Type' },
    { key: 'projectLocation', label: 'Location' },
    { key: 'tasks',         label: 'Tasks',          render: r => (
        <div className="flex gap-0.5 flex-wrap">
          {TASKS.map(t => (
            <span key={t} title={`${TASK_LABELS[t]}: ${r[t]?.status || 'N/A'}`}
              className={`w-5 h-5 rounded text-[8px] font-bold text-white flex items-center justify-center ${statusColor[r[t]?.status] || 'bg-gray-200'}`}>
              {TASK_LABELS[t][0]}
            </span>
          ))}
        </div>
      )
    },
    { key: 'overallStatus', label: 'Status',         render: r => <StatusBadge status={r.overallStatus ?? 'N/A'} /> },
    { key: 'actions',       label: 'Actions',        render: r => (
        <div className="flex gap-2">
          <button onClick={() => navigate(`/admin/projects/edit/${r._id}`)} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => setDelTarget(r)} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
        </div>
      )
    },
  ];

  return (
    <div>
      <PageHeader title="Work Delegation / Projects" subtitle={`${filtered.length} project${filtered.length !== 1 ? 's' : ''}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <button onClick={downloadExport} disabled={exporting} className="btn-secondary flex items-center gap-2 text-sm">
              {exporting ? 'Exporting…' : 'Export Projects'}
            </button>
            <button onClick={() => navigate('/admin/projects/new')} className="btn-primary flex items-center gap-2 text-sm"><Plus className="w-4 h-4" /> Add Project</button>
          </div>
        }
      />
      {/* Task legend */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs text-gray-500">
        {Object.entries(statusColor).map(([s, c]) => (
          <span key={s} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded ${c}`} />{s}
          </span>
        ))}
      </div>
      <div className="card">
        <div className="mb-4"><SearchBar value={search} onChange={setSearch} placeholder="Search projects…" /></div>
        <DataTable columns={columns} data={filtered} loading={busy} emptyText="No projects found." />
      </div>
      <ConfirmDialog open={!!delTarget} onClose={() => setDelTarget(null)} onConfirm={handleDelete} busy={delBusy}
        title="Delete Project" message={`Delete project for "${delTarget?.clientName}"?`} />
    </div>
  );
}
