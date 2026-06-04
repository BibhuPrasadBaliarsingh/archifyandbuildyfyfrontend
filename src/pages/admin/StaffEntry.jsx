import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader, FormField } from '../../components/ui/index.jsx';
import api from '../../utils/api.js';
import { normalizePhoneInput } from '../../utils/input.js';
import toast from 'react-hot-toast';

const DESIGNATIONS = ['Architect','Junior Architect','Interior Designer','Structural Engineer','Site Supervisor','CAD Operator','Office Admin','Accountant'];
const DEFAULTS = { fullname:'', username:'', password:'', email:'', address:'', designation:'Architect', gender:'Male', contact:'', status:'Active' };

export default function StaffEntry() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm]     = useState(DEFAULTS);
  const [busy, setBusy]     = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/staffs/${id}`)
      .then(r => setForm({ ...DEFAULTS, ...r.data, password: '' }))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEdit && !form.password) { toast.error('Password is required'); return; }
    setBusy(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (isEdit) { await api.put(`/staffs/${id}`, payload); toast.success('Staff updated'); }
      else        { await api.post('/staffs', payload);       toast.success('Staff added'); }
      navigate('/admin/staffs');
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setBusy(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;

  return (
    <div className="w-full">
      <PageHeader title={isEdit ? 'Edit Staff Member' : 'Add Staff Member'} />
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Full Name" required>
              <input className="input-field" value={form.fullname} onChange={e => set('fullname', e.target.value)} required />
            </FormField>
            <FormField label="Username" required>
              <input className="input-field" value={form.username} onChange={e => set('username', e.target.value)} required />
            </FormField>
            <FormField label={isEdit ? 'New Password (leave blank to keep)' : 'Password'} required={!isEdit}>
              <input className="input-field" type="password" value={form.password} onChange={e => set('password', e.target.value)} />
            </FormField>
            <FormField label="Email">
              <input className="input-field" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
            </FormField>
            <FormField label="Designation">
              <select className="input-field" value={form.designation} onChange={e => set('designation', e.target.value)}>
                {DESIGNATIONS.map(d => <option key={d}>{d}</option>)}
              </select>
            </FormField>
            <FormField label="Gender">
              <select className="input-field" value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </FormField>
            <FormField label="Contact Number">
              <input
                className="input-field"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                value={form.contact}
                onChange={e => set('contact', normalizePhoneInput(e.target.value))}
              />
            </FormField>
            <FormField label="Status">
              <select className="input-field" value={form.status} onChange={e => set('status', e.target.value)}>
                <option>Active</option><option>Inactive</option>
              </select>
            </FormField>
          </div>
          <FormField label="Address">
            <input className="input-field" value={form.address} onChange={e => set('address', e.target.value)} />
          </FormField>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={busy} className="btn-primary">{busy ? 'Saving…' : isEdit ? 'Update Staff' : 'Add Staff'}</button>
            <button type="button" onClick={() => navigate('/admin/staffs')} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
