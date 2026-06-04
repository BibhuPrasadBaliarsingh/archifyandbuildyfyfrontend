import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { User, Mail, Phone, MapPin, Building, Clock, Briefcase, Calendar, Code2 } from 'lucide-react';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function EmployeeProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    
    api.get('/employees/profile/me')
      .then(r => {
        setProfile(r.data);
      })
      .catch(err => {
        console.error('Failed to fetch profile:', err);
        setProfile(null);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const fields = profile ? [
    { icon: User,      label: 'Full Name',     value: `${profile.first_name} ${profile.last_name}` },
    { icon: Code2,     label: 'Employee ID',   value: profile.employee_id },
    { icon: Mail,      label: 'Email',         value: profile.email },
    { icon: Phone,     label: 'Phone',         value: profile.phone },
    { icon: Building,  label: 'Department',    value: profile.department?.name || profile.department },
    { icon: Clock,     label: 'Shift',         value: profile.shift?.shift || profile.shift },
    { icon: Calendar,  label: 'Joining Date',  value: profile.joining_date ? format(new Date(profile.joining_date), 'dd MMM yyyy') : '—' },
    { icon: Briefcase, label: 'Designation',   value: profile.designation || '—' },
  ] : [];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gradient-to-br from-brand-900 to-blue-700 rounded-2xl p-8 text-white text-center mb-6">
        <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold mx-auto mb-4 border-2 border-white/30">
          {profile?.first_name?.[0]?.toUpperCase() || '?'}
        </div>
        <h2 className="text-2xl font-bold">{profile?.first_name} {profile?.last_name}</h2>
        <p className="text-blue-200 text-sm mt-1">Employee ID: {profile?.employee_id}</p>
        <p className="text-blue-100 text-xs mt-2">{profile?.designation || 'Employee'} • {profile?.department?.name || 'No Department'}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-1">
        <h3 className="font-semibold text-gray-800 mb-4">My Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 text-sm p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                <p className="text-gray-800 font-medium truncate">{value || '—'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 mb-1">Status</p>
              <p className="text-lg font-bold text-green-700">{profile?.status === 'Active' ? 'Active' : 'Inactive'}</p>
            </div>
            <div className="text-3xl opacity-30">✓</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 mb-1">Role</p>
              <p className="text-lg font-bold text-blue-700">Employee</p>
            </div>
            <div className="text-3xl opacity-30">👤</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 mb-1">System</p>
              <p className="text-lg font-bold text-orange-700">Archify</p>
            </div>
            <div className="text-3xl opacity-30">🏢</div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        <p className="font-semibold mb-2">📋 Quick Guide</p>
        <ul className="space-y-1.5 text-xs list-disc list-inside text-blue-600">
          <li>Go to <strong>Attendance</strong> tab to mark your daily check-in and check-out.</li>
          <li>Check in when you arrive at your shift start time.</li>
          <li>Check out when you leave, and optionally submit your work report.</li>
          <li>Your shift is <strong>{profile?.shift?.start_time} - {profile?.shift?.end_time}</strong>.</li>
          <li>Contact your admin if you face any issues or need assistance.</li>
        </ul>
      </div>
    </div>
  );
}
