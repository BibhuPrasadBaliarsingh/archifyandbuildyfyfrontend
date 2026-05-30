import { useEffect, useState } from 'react';
import { PageHeader, DataTable, SearchBar, ConfirmDialog, StatusBadge } from '../../components/ui/index.jsx';
import { Trash2, Filter } from 'lucide-react';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AttendanceAdmin() {
  const [records, setRecords] = useState([]);
  const [search, setSearch]   = useState('');
  const [month, setMonth]     = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [busy, setBusy]       = useState(true);
  const [delTarget, setDelTarget] = useState(null);
  const [delBusy, setDelBusy]     = useState(false);

  const load = () => {
    setBusy(true);
    api.get(`/attendance?month=${month}`)
      .then(r => setRecords(r.data))
      .catch(() => toast.error('Failed to load attendance'))
      .finally(() => setBusy(false));
  };
  useEffect(load, [month]);

  const filtered = records.filter(r => {
    const name = `${r.employee?.first_name} ${r.employee?.last_name}`.toLowerCase();
    return name.includes(search.toLowerCase()) || r.employee?.username?.toLowerCase().includes(search.toLowerCase());
  });

  const handleDelete = async () => {
    setDelBusy(true);
    try { await api.delete(`/attendance/${delTarget._id}`); toast.success('Record deleted'); setDelTarget(null); load(); }
    catch { toast.error('Delete failed'); } finally { setDelBusy(false); }
  };

  const fmtTime = (dt) => dt ? format(new Date(dt), 'hh:mm a') : '—';
  const duration = (r) => {
    if (!r.check_in || !r.check_out) return '—';
    const mins = Math.round((new Date(r.check_out) - new Date(r.check_in)) / 60000);
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  // Summary counts
  const present  = filtered.filter(r => r.status === 'Present').length;
  const absent   = filtered.filter(r => r.status === 'Absent').length;
  const late     = filtered.filter(r => r.status === 'Late').length;

  const columns = [
    { key: '#',          label: '#',           render: r => filtered.indexOf(r) + 1 },
    { key: 'employee',   label: 'Employee',    render: r => <span className="font-medium">{r.employee?.first_name} {r.employee?.last_name}</span> },
    { key: 'username',   label: 'Username',    render: r => <code className="text-xs bg-gray-100 px-1.5 rounded">{r.employee?.username}</code> },
    { key: 'date',       label: 'Date',        render: r => r.date },
    { key: 'shift',      label: 'Shift' },
    { key: 'check_in',   label: 'Check In',    render: r => fmtTime(r.check_in) },
    { key: 'check_out',  label: 'Check Out',   render: r => fmtTime(r.check_out) },
    { key: 'duration',   label: 'Duration',    render: r => duration(r) },
    { key: 'location',   label: 'Location' },
    { key: 'status',     label: 'Status',      render: r => <StatusBadge status={r.status} /> },
    { key: 'work_report', label: 'Work Report', render: r => r.work_report
        ? <span className="text-xs text-gray-600 max-w-xs truncate block" title={r.work_report}>{r.work_report}</span>
        : '—'
    },
    { key: 'actions',    label: '',            render: r => (
        <button onClick={() => setDelTarget(r)} className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50">
          <Trash2 className="w-4 h-4" />
        </button>
      )
    },
  ];

  return (
    <div>
      <PageHeader title="Attendance & Work Reports" subtitle="Track employee check-ins and daily work reports" />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="card text-center py-3"><p className="text-xs text-gray-500">Present</p><p className="text-2xl font-bold text-green-600">{present}</p></div>
        <div className="card text-center py-3"><p className="text-xs text-gray-500">Late</p><p className="text-2xl font-bold text-yellow-500">{late}</p></div>
        <div className="card text-center py-3"><p className="text-xs text-gray-500">Absent</p><p className="text-2xl font-bold text-red-500">{absent}</p></div>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <SearchBar value={search} onChange={setSearch} placeholder="Search employee…" />
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <input type="month" value={month} onChange={e => setMonth(e.target.value)}
              className="input-field max-w-[160px]" />
          </div>
        </div>
        <DataTable columns={columns} data={filtered} loading={busy} emptyText="No attendance records for this period." />
      </div>

      <ConfirmDialog open={!!delTarget} onClose={() => setDelTarget(null)} onConfirm={handleDelete} busy={delBusy}
        title="Delete Attendance Record" message="Delete this attendance record permanently?" />
    </div>
  );
}
