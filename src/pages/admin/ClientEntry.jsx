import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader, FormField } from '../../components/ui/index.jsx';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';

const SERVICES = [
  'House Plan as per Vaastu', '3D Visualization', 'Construction',
  'Interior Designing', 'Modular Kitchen', 'Building Plan Approval',
  'Structural Designing', 'Landscape Designing', 'Renovation', 'House Loan',
];

const DEFAULTS = {
  fullname: '', gender: 'Male', dor: '', contact_number: '',
  whatsapp_number: '', address: '', services: [], email: '',
};

export default function ClientEntry() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm]   = useState(DEFAULTS);
  const [file, setFile]   = useState(null);
  const [busy, setBusy]   = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/clients/${id}`)
      .then(r => {
        const d = r.data;
        setForm({
          fullname: d.fullname || '',
          gender: d.gender || 'Male',
          dor: d.dor ? d.dor.split('T')[0] : '',
          contact_number: d.contact_number || '',
          whatsapp_number: d.whatsapp_number || '',
          address: d.address || '',
          services: d.services || [],
          email: d.email || '',
        });
      })
      .catch(() => toast.error('Failed to load client'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleService = (s) => setForm(f => ({
    ...f,
    services: f.services.includes(s) ? f.services.filter(x => x !== s) : [...f.services, s],
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullname || !form.contact_number) {
      toast.error('Full name and contact number are required');
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'services') v.forEach(s => fd.append('services[]', s));
        else fd.append(k, v);
      });
      if (file) fd.append('quotation', file);

      if (isEdit) {
        await api.put(`/clients/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Client updated');
      } else {
        await api.post('/clients', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Client added');
      }
      navigate('/admin/clients');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;

  return (
    <div className="w-full">
      <PageHeader
        title={isEdit ? 'Edit Client' : 'Client Entry Form'}
        subtitle="Fill in the client details below"
      />
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Full Name" required>
              <input className="input-field" value={form.fullname} onChange={e => set('fullname', e.target.value)} placeholder="Client full name" required />
            </FormField>
            <FormField label="Gender">
              <select className="input-field" value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </FormField>
            <FormField label="Date of Registration">
              <input className="input-field" type="date" value={form.dor} onChange={e => set('dor', e.target.value)} />
            </FormField>
            <FormField label="Email">
              <input className="input-field" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@example.com" />
            </FormField>
            <FormField label="Contact Number" required>
              <input className="input-field" type="tel" value={form.contact_number} onChange={e => set('contact_number', e.target.value)} placeholder="9876543210" required />
            </FormField>
            <FormField label="WhatsApp Number">
              <input className="input-field" type="tel" value={form.whatsapp_number} onChange={e => set('whatsapp_number', e.target.value)} placeholder="9876543210" />
            </FormField>
          </div>

          <FormField label="Address">
            <input className="input-field" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Client address" />
          </FormField>

          <FormField label="Services (select all that apply)">
            <div className="grid grid-cols-2 gap-2 mt-1">
              {SERVICES.map(s => (
                <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.services.includes(s)}
                    onChange={() => toggleService(s)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  {s}
                </label>
              ))}
            </div>
          </FormField>

          <FormField label="Quotation (PDF)" hint={isEdit ? 'Upload a new file to replace the existing one' : ''}>
            <input
              type="file"
              accept="application/pdf"
              onChange={e => setFile(e.target.files[0])}
              className="input-field text-sm file:mr-3 file:py-1 file:px-3 file:border-0 file:rounded file:bg-blue-50 file:text-blue-700 file:text-xs"
            />
          </FormField>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={busy} className="btn-primary">
              {busy ? 'Saving…' : isEdit ? 'Update Client' : 'Add Client'}
            </button>
            <button type="button" onClick={() => navigate('/admin/clients')} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
