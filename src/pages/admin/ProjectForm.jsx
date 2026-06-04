import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader, FormField } from '../../components/ui/index.jsx';
import api from '../../utils/api.js';
import { normalizePhoneInput } from '../../utils/input.js';
import toast from 'react-hot-toast';

const TASK_STATUSES = ['Pending', 'In Progress', 'Completed', 'N/A'];
const PROJ_TYPES    = ['Residential', 'Commercial', 'Industrial', 'Renovation', 'Interior', 'Other'];
const OVERALL_STATUSES = ['Active', 'On Hold', 'Completed'];

const TASKS = [
  { key: 'twoDPlan',                  label: '2D Plan' },
  { key: 'threeDElevation',           label: '3D Elevation' },
  { key: 'interiorDesign',            label: 'Interior Design' },
  { key: 'planApproved',              label: 'Plan Approved' },
  { key: 'structureDetailing',        label: 'Structure Detailing' },
  { key: 'threeDElevationDetailing',  label: '3D Elevation Detailing' },
  { key: 'landscapeDesigning',        label: 'Landscape Designing' },
  { key: 'constructionDrawing',       label: 'Construction Drawing' },
];

const emptyTask = () => ({ status: 'Pending', architect: '' });

const DEFAULTS = {
  date: new Date().toISOString().split('T')[0],
  clientName: '', contactNumber: '', address: '', projectLocation: '',
  projectType: 'Residential', overallStatus: 'Active', notes: '',
  twoDPlan: emptyTask(), threeDElevation: emptyTask(), interiorDesign: emptyTask(),
  planApproved: emptyTask(), structureDetailing: emptyTask(),
  threeDElevationDetailing: emptyTask(), landscapeDesigning: emptyTask(),
  constructionDrawing: emptyTask(),
};

export default function ProjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm]     = useState(DEFAULTS);
  const [busy, setBusy]     = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/projects/${id}`)
      .then(r => {
        const d = r.data;
        setForm({ ...DEFAULTS, ...d, date: d.date ? d.date.split('T')[0] : DEFAULTS.date });
      })
      .catch(() => toast.error('Failed to load project'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setTask = (taskKey, field, value) => setForm(f => ({ ...f, [taskKey]: { ...(f[taskKey] || emptyTask()), [field]: value } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (isEdit) { await api.put(`/projects/${id}`, form); toast.success('Project updated'); }
      else        { await api.post('/projects', form);       toast.success('Project added'); }
      navigate('/admin/projects');
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setBusy(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;

  return (
    <div className="w-full">
      <PageHeader title={isEdit ? 'Edit Project' : 'Project Information Form'} subtitle="Work delegation to the staff" />
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info */}
        <div className="card space-y-5">
          <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Project Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Date" required>
              <input className="input-field" type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
            </FormField>
            <FormField label="Client Name" required>
              <input className="input-field" value={form.clientName} onChange={e => set('clientName', e.target.value)} required />
            </FormField>
            <FormField label="Contact Number" required>
              <input
                className="input-field"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                value={form.contactNumber}
                onChange={e => set('contactNumber', normalizePhoneInput(e.target.value))}
                required
              />
            </FormField>
            <FormField label="Project Type">
              <select className="input-field" value={form.projectType} onChange={e => set('projectType', e.target.value)}>
                {PROJ_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </FormField>
            <FormField label="Present Address">
              <input className="input-field" value={form.address} onChange={e => set('address', e.target.value)} />
            </FormField>
            <FormField label="Project Location">
              <input className="input-field" value={form.projectLocation} onChange={e => set('projectLocation', e.target.value)} />
            </FormField>
            <FormField label="Overall Status">
              <select className="input-field" value={form.overallStatus} onChange={e => set('overallStatus', e.target.value)}>
                {OVERALL_STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </FormField>
          </div>
          <FormField label="Notes">
            <textarea className="input-field" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} />
          </FormField>
        </div>

        {/* Tasks */}
        <div className="card">
          <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide mb-4">Task Assignment</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 w-48">Task</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 w-44">Status</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500">Assigned Architect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {TASKS.map(({ key, label }) => (
                  <tr key={key}>
                    <td className="py-2.5 px-3 text-gray-700 font-medium">{label}</td>
                    <td className="py-2.5 px-3">
                      <select
                        className="input-field text-xs py-1.5"
                        value={form[key]?.status || 'Pending'}
                        onChange={e => setTask(key, 'status', e.target.value)}
                      >
                        {TASK_STATUSES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        className="input-field text-xs py-1.5"
                        value={form[key]?.architect || ''}
                        onChange={e => setTask(key, 'architect', e.target.value)}
                        placeholder="Architect name"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={busy} className="btn-primary">{busy ? 'Saving…' : isEdit ? 'Update Project' : 'Add Project'}</button>
          <button type="button" onClick={() => navigate('/admin/projects')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
