import { X, ChevronLeft, ChevronRight } from 'lucide-react';

// ── PageHeader ──────────────────────────────────────────────
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

// ── StatCard ────────────────────────────────────────────────
export function StatCard({ icon: Icon, label, value, color = 'blue', sub }) {
  const colors = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red:    'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium truncate">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── DataTable ───────────────────────────────────────────────
export function DataTable({ columns, data, loading, emptyText = 'No records found.' }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3" />
        Loading…
      </div>
    );
  }
  if (!data?.length) {
    return <p className="text-center py-16 text-gray-400 text-sm">{emptyText}</p>;
  }
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {columns.map(col => (
              <th key={col.key} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((row, i) => (
            <tr key={row._id || i} className="hover:bg-gray-50 transition-colors group">
              {columns.map(col => (
                <td key={col.key} className="px-4 py-3 text-gray-700 whitespace-nowrap">
                  {col.render ? col.render(row) : row[col.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Modal ───────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-xl w-full ${sizes[size]} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-base">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

// ── FormField ───────────────────────────────────────────────
export function FormField({ label, required, children, hint }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

// ── StatusBadge ─────────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    Active: 'badge-success', Present: 'badge-success', Completed: 'badge-success',
    Won: 'badge-success', Paid: 'badge-success',
    Pending: 'badge-warning', 'In Progress': 'badge-warning', 'On Hold': 'badge-warning',
    Partial: 'badge-warning', Late: 'badge-warning', 'Half Day': 'badge-warning',
    New: 'badge-info', Contacted: 'badge-info',
    Inactive: 'badge-gray', Absent: 'badge-gray', 'N/A': 'badge-gray',
    Lost: 'badge-danger', Unpaid: 'badge-danger',
    High: 'badge-danger', Medium: 'badge-warning', Low: 'badge-info',
  };
  return <span className={map[status] || 'badge-gray'}>{status}</span>;
}

// ── SearchBar ───────────────────────────────────────────────
export function SearchBar({ value, onChange, placeholder = 'Search…' }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="input-field max-w-xs text-sm"
    />
  );
}

// ── ConfirmDialog ───────────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, message, busy }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-gray-600 text-sm mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="btn-secondary text-sm">Cancel</button>
        <button onClick={onConfirm} disabled={busy} className="btn-danger text-sm">
          {busy ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </Modal>
  );
}
