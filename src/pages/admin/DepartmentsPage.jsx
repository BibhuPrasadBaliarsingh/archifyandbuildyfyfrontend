import { useEffect, useState } from 'react';
import { PageHeader, Modal, FormField, ConfirmDialog } from '../../components/ui/index.jsx';
import { Plus, Trash2, Clock, Building } from 'lucide-react';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';

export default function DepartmentsPage() {
  const [departments, setDepts]   = useState([]);
  const [shifts, setShifts]       = useState([]);
  const [deptModal, setDeptModal] = useState(false);
  const [shiftModal, setShiftModal] = useState(false);
  const [deptForm, setDeptForm]   = useState({ name: '', description: '' });
  const [shiftForm, setShiftForm] = useState({ shift: '', start_time: '', end_time: '' });
  const [busy, setBusy]           = useState(false);
  const [delDept, setDelDept]     = useState(null);
  const [delShift, setDelShift]   = useState(null);

  const loadAll = () => {
    api.get('/departments').then(r => setDepts(r.data));
    api.get('/departments/shifts/all').then(r => setShifts(r.data));
  };
  useEffect(loadAll, []);

  const addDept = async () => {
    if (!deptForm.name) { toast.error('Name required'); return; }
    setBusy(true);
    try { await api.post('/departments', deptForm); toast.success('Department added'); setDeptModal(false); setDeptForm({ name: '', description: '' }); loadAll(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setBusy(false); }
  };

  const addShift = async () => {
    if (!shiftForm.shift || !shiftForm.start_time || !shiftForm.end_time) { toast.error('All fields required'); return; }
    setBusy(true);
    try { await api.post('/departments/shifts', shiftForm); toast.success('Shift added'); setShiftModal(false); setShiftForm({ shift: '', start_time: '', end_time: '' }); loadAll(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setBusy(false); }
  };

  const deleteDept = async () => {
    try { await api.delete(`/departments/${delDept._id}`); toast.success('Deleted'); setDelDept(null); loadAll(); }
    catch { toast.error('Delete failed'); }
  };

  const deleteShift = async () => {
    try { await api.delete(`/departments/shifts/${delShift._id}`); toast.success('Deleted'); setDelShift(null); loadAll(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <PageHeader title="Departments & Shifts" subtitle="Manage attendance departments and work shifts" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Departments */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Building className="w-4 h-4 text-blue-600" /> Departments</h3>
            <button onClick={() => setDeptModal(true)} className="btn-primary text-xs flex items-center gap-1 px-3 py-1.5">
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>
          {departments.length === 0
            ? <p className="text-center py-8 text-gray-400 text-sm">No departments yet</p>
            : (
              <ul className="divide-y divide-gray-50">
                {departments.map(d => (
                  <li key={d._id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{d.name}</p>
                      {d.description && <p className="text-xs text-gray-500">{d.description}</p>}
                    </div>
                    <button onClick={() => setDelDept(d)} className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )
          }
        </div>

        {/* Shifts */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Clock className="w-4 h-4 text-blue-600" /> Shifts</h3>
            <button onClick={() => setShiftModal(true)} className="btn-primary text-xs flex items-center gap-1 px-3 py-1.5">
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>
          {shifts.length === 0
            ? <p className="text-center py-8 text-gray-400 text-sm">No shifts yet</p>
            : (
              <ul className="divide-y divide-gray-50">
                {shifts.map(s => (
                  <li key={s._id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{s.shift}</p>
                      <p className="text-xs text-gray-500">{s.start_time} – {s.end_time}</p>
                    </div>
                    <button onClick={() => setDelShift(s)} className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )
          }
        </div>
      </div>

      {/* Add Department Modal */}
      <Modal open={deptModal} onClose={() => setDeptModal(false)} title="Add Department" size="sm">
        <div className="space-y-4">
          <FormField label="Department Name" required>
            <input className="input-field" value={deptForm.name} onChange={e => setDeptForm(f => ({ ...f, name: e.target.value }))} />
          </FormField>
          <FormField label="Description">
            <input className="input-field" value={deptForm.description} onChange={e => setDeptForm(f => ({ ...f, description: e.target.value }))} />
          </FormField>
          <div className="flex gap-3 pt-2">
            <button onClick={addDept} disabled={busy} className="btn-primary">{busy ? 'Adding…' : 'Add Department'}</button>
            <button onClick={() => setDeptModal(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Add Shift Modal */}
      <Modal open={shiftModal} onClose={() => setShiftModal(false)} title="Add Shift" size="sm">
        <div className="space-y-4">
          <FormField label="Shift Name" required>
            <input className="input-field" value={shiftForm.shift} onChange={e => setShiftForm(f => ({ ...f, shift: e.target.value }))} placeholder="e.g. Morning Shift" />
          </FormField>
          <FormField label="Start Time" required>
            <input className="input-field" type="time" value={shiftForm.start_time} onChange={e => setShiftForm(f => ({ ...f, start_time: e.target.value }))} />
          </FormField>
          <FormField label="End Time" required>
            <input className="input-field" type="time" value={shiftForm.end_time} onChange={e => setShiftForm(f => ({ ...f, end_time: e.target.value }))} />
          </FormField>
          <div className="flex gap-3 pt-2">
            <button onClick={addShift} disabled={busy} className="btn-primary">{busy ? 'Adding…' : 'Add Shift'}</button>
            <button onClick={() => setShiftModal(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!delDept} onClose={() => setDelDept(null)} onConfirm={deleteDept}
        title="Delete Department" message={`Delete "${delDept?.name}"?`} />
      <ConfirmDialog open={!!delShift} onClose={() => setDelShift(null)} onConfirm={deleteShift}
        title="Delete Shift" message={`Delete shift "${delShift?.shift}"?`} />
    </div>
  );
}
