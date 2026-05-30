import { useEffect, useState } from 'react';
import { CalendarCheck, MapPin, MessageSquare, Clock, CheckCircle2, LogIn, LogOut } from 'lucide-react';
import { FormField } from '../../components/ui/index.jsx';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const LOCATIONS = ['Office', 'Site Visit', 'Work From Home', 'Client Meeting', 'Other'];

export default function AttendanceMark() {
  const [today, setToday]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [checkInForm, setCheckInForm] = useState({ shift: '', location: 'Office', message: '' });
  const [checkOutForm, setCheckOutForm] = useState({ work_report: '' });
  const [busy, setBusy]         = useState(false);
  const [now, setNow]           = useState(new Date());

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const loadToday = () => {
    setLoading(true);
    api.get('/attendance/today')
      .then(r => setToday(r.data))
      .catch(() => setToday(null))
      .finally(() => setLoading(false));
  };
  useEffect(loadToday, []);

  const handleCheckIn = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await api.post('/attendance/checkin', checkInForm);
      setToday(r.data);
      toast.success('Checked in successfully! ✅');
    } catch (err) { toast.error(err.response?.data?.message || 'Check-in failed'); }
    finally { setBusy(false); }
  };

  const handleCheckOut = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await api.put('/attendance/checkout', checkOutForm);
      setToday(r.data);
      toast.success('Checked out. Have a great day! 👋');
    } catch (err) { toast.error(err.response?.data?.message || 'Check-out failed'); }
    finally { setBusy(false); }
  };

  const fmtTime = (dt) => dt ? format(new Date(dt), 'hh:mm:ss a') : null;

  const todayDate = format(new Date(), 'EEEE, dd MMMM yyyy');

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {/* Date & Clock */}
      <div className="bg-gradient-to-br from-brand-900 to-blue-700 rounded-2xl p-6 text-white text-center">
        <p className="text-blue-200 text-sm mb-1">{todayDate}</p>
        <p className="text-4xl font-bold tracking-wider font-mono">{format(now, 'hh:mm:ss')}</p>
        <p className="text-blue-300 text-sm mt-1">{format(now, 'a')}</p>
      </div>

      {loading ? (
        <div className="card flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <>
          {/* Status card */}
          {today ? (
            <div className={`card border-l-4 ${today.check_out ? 'border-green-500 bg-green-50' : 'border-blue-500 bg-blue-50'}`}>
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle2 className={`w-5 h-5 ${today.check_out ? 'text-green-600' : 'text-blue-600'}`} />
                <h3 className={`font-semibold ${today.check_out ? 'text-green-800' : 'text-blue-800'}`}>
                  {today.check_out ? 'Checked Out for Today' : 'Currently Checked In'}
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-500 flex items-center gap-1 mb-0.5"><LogIn className="w-3 h-3" /> Check In</p>
                  <p className="font-bold text-gray-800">{fmtTime(today.check_in)}</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-500 flex items-center gap-1 mb-0.5"><LogOut className="w-3 h-3" /> Check Out</p>
                  <p className="font-bold text-gray-800">{fmtTime(today.check_out) || 'Not yet'}</p>
                </div>
                {today.shift && (
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-500 flex items-center gap-1 mb-0.5"><Clock className="w-3 h-3" /> Shift</p>
                    <p className="font-medium text-gray-800">{today.shift}</p>
                  </div>
                )}
                {today.location && (
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-500 flex items-center gap-1 mb-0.5"><MapPin className="w-3 h-3" /> Location</p>
                    <p className="font-medium text-gray-800">{today.location}</p>
                  </div>
                )}
              </div>
              {today.message && (
                <div className="mt-3 bg-white rounded-lg p-3 text-sm">
                  <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Message</p>
                  <p className="text-gray-700">{today.message}</p>
                </div>
              )}
              {today.work_report && (
                <div className="mt-3 bg-white rounded-lg p-3 text-sm">
                  <p className="text-xs text-gray-500 mb-0.5">Work Report</p>
                  <p className="text-gray-700">{today.work_report}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="card border-l-4 border-yellow-400 bg-yellow-50">
              <p className="text-yellow-800 font-medium text-sm">You have not checked in today yet.</p>
            </div>
          )}

          {/* Check In form */}
          {!today?.check_in && (
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <LogIn className="w-4 h-4 text-blue-600" /> Mark Attendance — Check In
              </h3>
              <form onSubmit={handleCheckIn} className="space-y-4">
                <FormField label="Shift (optional)">
                  <input className="input-field" value={checkInForm.shift}
                    onChange={e => setCheckInForm(f => ({ ...f, shift: e.target.value }))}
                    placeholder="e.g. Morning Shift, 9 AM – 6 PM" />
                </FormField>
                <FormField label="Location" required>
                  <select className="input-field" value={checkInForm.location}
                    onChange={e => setCheckInForm(f => ({ ...f, location: e.target.value }))}>
                    {LOCATIONS.map(l => <option key={l}>{l}</option>)}
                  </select>
                </FormField>
                <FormField label="Message (optional)">
                  <textarea className="input-field" rows={2} value={checkInForm.message}
                    onChange={e => setCheckInForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Any note for today…" />
                </FormField>
                <button type="submit" disabled={busy}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50">
                  <LogIn className="w-4 h-4" /> {busy ? 'Marking…' : 'Check In Now'}
                </button>
              </form>
            </div>
          )}

          {/* Check Out form */}
          {today?.check_in && !today?.check_out && (
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <LogOut className="w-4 h-4 text-green-600" /> Check Out
              </h3>
              <form onSubmit={handleCheckOut} className="space-y-4">
                <FormField label="Daily Work Report" required>
                  <textarea className="input-field" rows={4} value={checkOutForm.work_report}
                    onChange={e => setCheckOutForm(f => ({ ...f, work_report: e.target.value }))}
                    placeholder="Describe what you worked on today…" required />
                </FormField>
                <button type="submit" disabled={busy}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50">
                  <LogOut className="w-4 h-4" /> {busy ? 'Checking out…' : 'Check Out Now'}
                </button>
              </form>
            </div>
          )}
        </>
      )}

      {/* Info footer */}
      <p className="text-center text-xs text-gray-400 pb-4">
        <CalendarCheck className="inline w-3.5 h-3.5 mr-1" />
        Attendance is recorded for {format(new Date(), 'dd MMM yyyy')}
      </p>
    </div>
  );
}
