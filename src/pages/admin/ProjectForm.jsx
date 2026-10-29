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
  const [form, setForm] = useState(DEFAULTS);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/projects/${id}`)
      .then(r => {
        const d = r.data;
        setForm({ ...DEFAULTS, ...d, date: d.date ? d.date.split('T')[0] : DEFAULTS.date });

        // Auto-check tasks that are active (not N/A or have an architect assigned)
        const activeKeys = TASKS.map(t => t.key).filter(k => {
          const task = d[k];
          return task && (task.architect || (task.status && task.status !== 'N/A'));
        });
        setSelectedTasks(activeKeys);
      })
      .catch(() => toast.error('Failed to load project'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setTask = (taskKey, field, value) =>
    setForm(f => ({ ...f, [taskKey]: { ...(f[taskKey] || emptyTask()), [field]: value } }));

  const toggleTask = (taskKey) => {
    setSelectedTasks(prev => {
      const isCurrentlySelected = prev.includes(taskKey);
      if (isCurrentlySelected) {
        // Uncheck: set status to N/A
        setTask(taskKey, 'status', 'N/A');
        return prev.filter(k => k !== taskKey);
      } else {
        // Check: ensure valid initial status
        const currentTask = form[taskKey];
        if (!currentTask || currentTask.status === 'N/A') {
          setTask(taskKey, 'status', 'Pending');
        }
        return [...prev, taskKey];
      }
    });
  };

  const selectAllTasks = () => {
    const allKeys = TASKS.map(t => t.key);
    setSelectedTasks(allKeys);
    allKeys.forEach(k => {
      if (!form[k] || form[k].status === 'N/A') {
        setTask(k, 'status', 'Pending');
      }
    });
  };

  const deselectAllTasks = () => {
    setSelectedTasks([]);
    TASKS.forEach(t => setTask(t.key, 'status', 'N/A'));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.contactNumber && form.contactNumber.length < 10) {
      toast.error('Contact number must be at least 10 digits');
      return;
    }
    setBusy(true);

    try {
      const payload = { ...form };
      // For any task that was NOT selected, mark as N/A
      TASKS.forEach(({ key }) => {
        if (!selectedTasks.includes(key)) {
          payload[key] = { status: 'N/A', architect: '' };
        } else {
          payload[key] = {
            status: form[key]?.status || 'Pending',
            architect: form[key]?.architect || '',
          };
        }
      });

      if (isEdit) {
        await api.put(`/projects/${id}`, payload);
        toast.success('Project updated');
      } else {
        await api.post('/projects', payload);
        toast.success('Project added');
      }
      navigate('/admin/projects');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Filter tasks to only those currently checked
  const visibleTasks = TASKS.filter(t => selectedTasks.includes(t.key));

  return (
    <div className="w-full">
      <PageHeader
        title={isEdit ? 'Edit Project' : 'Project Information Form'}
        subtitle="Work delegation to the staff"
      />
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
                pattern="[0-9]{10}"
                minLength={10}
                maxLength={10}
                placeholder="10-digit mobile number"
                title="Please enter a 10-digit contact number"
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

        {/* Tasks Section with Checkbox Selection and Filtered Assignment Table */}
        <div className="card space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
                Select Tasks for this Project
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Check the tasks above to display them in the task assignment table below.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAllTasks}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline px-2 py-1 rounded bg-blue-50"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={deselectAllTasks}
                className="text-xs font-semibold text-gray-600 hover:text-gray-800 hover:underline px-2 py-1 rounded bg-gray-100"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Task Checkboxes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TASKS.map(({ key, label }) => {
              const isChecked = selectedTasks.includes(key);
              return (
                <label
                  key={key}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                    isChecked
                      ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-sm font-semibold'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleTask(key)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              );
            })}
          </div>

          {/* Filtered Task Assignment Table */}
          <div className="pt-2">
            <h4 className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-3 flex items-center gap-2">
              <span>Task Assignment Table</span>
              <span className="text-xs font-normal text-gray-500">
                ({visibleTasks.length} {visibleTasks.length === 1 ? 'task' : 'tasks'} selected)
              </span>
            </h4>

            {visibleTasks.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-xl border border-dashed border-gray-300 bg-gray-50">
                <p className="text-sm font-medium text-gray-600">No tasks selected yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Click on the checkboxes above to assign architects and statuses to this project.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-100 rounded-xl">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
                      <th className="text-left py-2.5 px-3 text-xs font-semibold w-48">Task</th>
                      <th className="text-left py-2.5 px-3 text-xs font-semibold w-44">Status</th>
                      <th className="text-left py-2.5 px-3 text-xs font-semibold">Assigned Architect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {visibleTasks.map(({ key, label }) => (
                      <tr key={key} className="hover:bg-gray-50/50">
                        <td className="py-2.5 px-3 text-gray-800 font-medium">{label}</td>
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
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={busy} className="btn-primary">
            {busy ? 'Saving…' : isEdit ? 'Update Project' : 'Add Project'}
          </button>
          <button type="button" onClick={() => navigate('/admin/projects')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
