import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import { Users, TrendingUp, FolderKanban, IndianRupee, CalendarCheck, UserCog } from 'lucide-react';
import { StatCard, PageHeader } from '../../components/ui/index.jsx';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#ec4899','#6366f1','#84cc16'];

export default function AdminDashboard() {
  const [data, setData]   = useState(null);
  const [busy, setBusy]   = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard/summary')
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setBusy(false));
  }, []);

  if (busy) return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3" /> Loading dashboard…
    </div>
  );

  const { counts = {}, finance = {}, charts = {} } = data || {};

  const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Welcome back! Here's your business overview." />

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={Users}        label="Total Clients"    value={counts.totalClients   ?? 0} color="blue"   />
        <StatCard icon={TrendingUp}   label="Total Leads"      value={counts.totalLeads     ?? 0} color="yellow" />
        <StatCard icon={FolderKanban} label="Projects"         value={counts.totalProjects  ?? 0} color="purple" />
        <StatCard icon={UserCog}      label="Staff / Employees" value={(counts.totalStaff ?? 0) + (counts.totalEmployees ?? 0)} color="indigo" />
        <StatCard icon={CalendarCheck} label="Present Today"   value={counts.todayAttendance ?? 0} color="green"  />
        <StatCard icon={IndianRupee}  label="Outstanding"      value={fmt(finance.totalOutstanding)} color="red" sub="Unpaid invoices" />
      </div>

      {/* Finance row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-xs text-gray-500 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">{fmt(finance.totalRevenue)}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-500 mb-1">Amount Collected</p>
          <p className="text-2xl font-bold text-blue-600">{fmt(finance.totalPaid)}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-500 mb-1">Outstanding</p>
          <p className="text-2xl font-bold text-red-500">{fmt(finance.totalOutstanding)}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clients by Service */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Clients by Service</h3>
          {charts.clientsByService?.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={charts.clientsByService.map(d => ({ name: d._id, value: d.count }))}
                  dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50}
                  paddingAngle={3}>
                  {charts.clientsByService.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-gray-400 py-16 text-sm">No data yet</p>}
        </div>

        {/* Clients by Gender */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Clients by Gender</h3>
          {charts.clientsByGender?.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={charts.clientsByGender.map(d => ({ name: d._id || 'Unknown', value: d.count }))}
                  dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50}
                  paddingAngle={3}>
                  {charts.clientsByGender.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-gray-400 py-16 text-sm">No data yet</p>}
        </div>

        {/* Leads by Status */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Leads by Status</h3>
          {charts.leadsByStatus?.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={charts.leadsByStatus.map(d => ({ name: d._id, count: d.count }))} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-gray-400 py-12 text-sm">No data yet</p>}
        </div>

        {/* Projects by Status */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Projects by Status</h3>
          {charts.projectsByStatus?.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={charts.projectsByStatus.map(d => ({ name: d._id, count: d.count }))} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-gray-400 py-12 text-sm">No data yet</p>}
        </div>
      </div>

      {/* Quick links */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Add Client',    path: '/admin/clients/new' },
            { label: 'Add Lead',      path: '/admin/leads/new' },
            { label: 'New Invoice',   path: '/admin/invoices/new' },
            { label: 'New Project',   path: '/admin/projects/new' },
            { label: 'Add Employee',  path: '/admin/employees/new' },
          ].map(({ label, path }) => (
            <button key={path} onClick={() => navigate(path)} className="btn-primary text-sm">
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
