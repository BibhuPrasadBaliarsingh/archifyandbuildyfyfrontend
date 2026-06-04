import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader, FormField } from '../../components/ui/index.jsx';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';

const DEFAULTS = {
  first_name:'', last_name:'', username:'', password:'', email:'',
  department:'', shift:'', designation:'', gender:'Male', phone:'', address:'', status:'Active', role: 0,
};

export default function EmployeeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm]       = useState(DEFAULTS);
  const [departments, setDepts] = useState([]);
  const [shifts, setShifts]   = useState([]);
  const [busy, setBusy]       = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/departments'),
      api.get('/departments/shifts/all'),
      isEdit ? api.get(`/employees/${id}`) : Promise.resolve(null),
    ]).then(([dRes, sRes, eRes]) => {
      setDepts(dRes.data);
      setShifts(sRes.data);
      if (eRes) {
        const d = eRes.data;
        setForm({
          ...DEFAULTS, ...d,
          department: d.department?._id || '',
          shift:      d.shift?._id      || '',
          password:   '',
        });
      }
    }).catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEdit && !form.password) { toast.error('Password required'); return; }
    setBusy(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (!payload.department) delete payload.department;
      if (!payload.shift) delete payload.shift;
      if (isEdit) { await api.put(`/employees/${id}`, payload); toast.success('Employee updated'); }
      else        { await api.post('/employees', payload);       toast.success('Employee added'); }
      navigate('/admin/employees');
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setBusy(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;

  return (
    <div className="w-full">
      <PageHeader title={isEdit ? 'Edit Employee' : 'Add Employee'} />
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="First Name" required>
              <input className="input-field" value={form.first_name} onChange={e => set('first_name', e.target.value)} required />
            </FormField>
            <FormField label="Last Name" required>
              <input className="input-field" value={form.last_name} onChange={e => set('last_name', e.target.value)} required />
            </FormField>
            <FormField label="Username" required>
              <input className="input-field" value={form.username} onChange={e => set('username', e.target.value)} required />
            </FormField>
            <FormField label={isEdit ? 'New Password (blank = unchanged)' : 'Password'} required={!isEdit}>
              <input className="input-field" type="password" value={form.password} onChange={e => set('password', e.target.value)} />
            </FormField>
            <FormField label="Email">
              <input className="input-field" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
            </FormField>
            <FormField label="Phone">
              <input className="input-field" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </FormField>
            <FormField label="Department">
              <select className="input-field" value={form.department} onChange={e => set('department', e.target.value)}>
                <option value="">-- Select Department --</option>
                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </FormField>
            <FormField label="Shift">
              <select className="input-field" value={form.shift} onChange={e => set('shift', e.target.value)}>
                <option value="">-- Select Shift --</option>
                {shifts.map(s => <option key={s._id} value={s._id}>{s.shift} ({s.start_time} – {s.end_time})</option>)}
              </select>
            </FormField>
            <FormField label="Designation">
              <input className="input-field" value={form.designation} onChange={e => set('designation', e.target.value)} />
            </FormField>
            <FormField label="Gender">
              <select className="input-field" value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </FormField>
            <FormField label="Status">
              <select className="input-field" value={form.status} onChange={e => set('status', e.target.value)}>
                <option>Active</option><option>Inactive</option>
              </select>
            </FormField>
            <FormField label="Role">
              <select className="input-field" value={form.role} onChange={e => set('role', Number(e.target.value))}>
                <option value={0}>Employee</option>
                <option value={1}>Manager</option>
              </select>
            </FormField>
          </div>
          <FormField label="Address">
            <input className="input-field" value={form.address} onChange={e => set('address', e.target.value)} />
          </FormField>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={busy} className="btn-primary">{busy ? 'Saving…' : isEdit ? 'Update Employee' : 'Add Employee'}</button>
            <button type="button" onClick={() => navigate('/admin/employees')} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
