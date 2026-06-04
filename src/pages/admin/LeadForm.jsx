import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader, FormField } from '../../components/ui/index.jsx';
import { Plus, Trash2 } from 'lucide-react';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';

const SOURCES   = ['Google', 'Facebook', 'Instagram', 'Walk-in', 'Referral', 'JustDial', 'Other'];
const PROJ_TYPES = ['Residential', 'Commercial', 'Industrial', 'Interior', 'Renovation'];
const STATUSES  = ['New', 'Contacted', 'Qualified', 'Lost', 'Won'];
const PRIORITIES = ['Low', 'Medium', 'High'];

const emptyFollowUp = () => ({ follow_up_date: '', assigned_to: '', note: '' });

const DEFAULTS = {
  lead_name: '', contact_number: '', email_address: '', lead_source: 'Google',
  other_source: '', project_type: 'Residential', project_location: '',
  project_budget: '', lead_status: 'New', lead_priority: 'Medium',
  lead_notes: '', follow_ups: [emptyFollowUp(), emptyFollowUp(), emptyFollowUp()],
};

export default function LeadForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm]     = useState(DEFAULTS);
  const [busy, setBusy]     = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/leads/${id}`)
      .then(r => {
        const d = r.data;
        const fu = d.follow_ups || [];
        while (fu.length < 3) fu.push(emptyFollowUp());
        setForm({ ...DEFAULTS, ...d, follow_ups: fu });
      })
      .catch(() => toast.error('Failed to load lead'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setFU = (i, k, v) => setForm(f => {
    const fu = [...f.follow_ups];
    fu[i] = { ...fu[i], [k]: v };
    return { ...f, follow_ups: fu };
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = { ...form, follow_ups: form.follow_ups.filter(f => f.follow_up_date || f.note) };
      if (isEdit) { await api.put(`/leads/${id}`, payload); toast.success('Lead updated'); }
      else        { await api.post('/leads', payload);       toast.success('Lead added'); }
      navigate('/admin/leads');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setBusy(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;

  return (
    <div className="w-full">
      <PageHeader title={isEdit ? 'Edit Lead' : 'New Lead'} subtitle="Lead Management Form" />
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card space-y-5">
          <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Lead Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Lead Name" required>
              <input className="input-field" value={form.lead_name} onChange={e => set('lead_name', e.target.value)} required />
            </FormField>
            <FormField label="Contact Number" required>
              <input className="input-field" type="tel" value={form.contact_number} onChange={e => set('contact_number', e.target.value)} required />
            </FormField>
            <FormField label="Email Address">
              <input className="input-field" type="email" value={form.email_address} onChange={e => set('email_address', e.target.value)} />
            </FormField>
            <FormField label="Lead Source">
              <select className="input-field" value={form.lead_source} onChange={e => set('lead_source', e.target.value)}>
                {SOURCES.map(s => <option key={s}>{s}</option>)}
              </select>
            </FormField>
            {form.lead_source === 'Other' && (
              <FormField label="Specify Other">
                <input className="input-field" value={form.other_source} onChange={e => set('other_source', e.target.value)} />
              </FormField>
            )}
            <FormField label="Project Type">
              <select className="input-field" value={form.project_type} onChange={e => set('project_type', e.target.value)}>
                {PROJ_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </FormField>
            <FormField label="Project Location">
              <input className="input-field" value={form.project_location} onChange={e => set('project_location', e.target.value)} />
            </FormField>
            <FormField label="Project Budget (Approx.)">
              <input className="input-field" value={form.project_budget} onChange={e => set('project_budget', e.target.value)} placeholder="e.g. 25 Lakhs" />
            </FormField>
            <FormField label="Lead Status">
              <select className="input-field" value={form.lead_status} onChange={e => set('lead_status', e.target.value)}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </FormField>
            <FormField label="Lead Priority">
              <select className="input-field" value={form.lead_priority} onChange={e => set('lead_priority', e.target.value)}>
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
            </FormField>
          </div>
          <FormField label="Notes / Additional Information">
            <textarea className="input-field" rows={3} value={form.lead_notes} onChange={e => set('lead_notes', e.target.value)} />
          </FormField>
        </div>

        {/* Follow-ups */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Follow-Up Tracking</h3>
          {form.follow_ups.map((fu, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold text-gray-500 uppercase">Follow-up {i + 1}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <FormField label="Date">
                  <input className="input-field" type="date" value={fu.follow_up_date || ''} onChange={e => setFU(i, 'follow_up_date', e.target.value)} />
                </FormField>
                <FormField label="Assigned To">
                  <input className="input-field" value={fu.assigned_to || ''} onChange={e => setFU(i, 'assigned_to', e.target.value)} />
                </FormField>
                <FormField label="Note">
                  <textarea className="input-field" rows={2} value={fu.note || ''} onChange={e => setFU(i, 'note', e.target.value)} />
                </FormField>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => setForm(f => ({ ...f, follow_ups: [...f.follow_ups, emptyFollowUp()] }))}
            className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add Follow-up
          </button>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={busy} className="btn-primary">{busy ? 'Saving…' : isEdit ? 'Update Lead' : 'Add Lead'}</button>
          <button type="button" onClick={() => navigate('/admin/leads')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
