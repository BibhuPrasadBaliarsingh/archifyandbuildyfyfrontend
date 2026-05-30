import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { User, Mail, Phone, MapPin, Building, Clock, Briefcase } from 'lucide-react';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';

export default function EmployeeProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    // Fetch employee data from admin route using own ID
    // We call the attendance today endpoint to get shift, and rely on user context for basic info
    setProfile({
      name: user.name,
      username: localStorage.getItem('name') || user.name,
    });
    setLoading(false);
  }, [user]);

  const fields = [
    { icon: User,     label: 'Full Name',   value: user?.name },
    { icon: Building, label: 'Role',        value: 'Employee' },
  ];

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-gradient-to-br from-brand-900 to-blue-700 rounded-2xl p-8 text-white text-center mb-6">
        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold mx-auto mb-4 border-2 border-white/30">
          {user?.name?.[0]?.toUpperCase() || '?'}
        </div>
        <h2 className="text-xl font-bold">{user?.name}</h2>
        <p className="text-blue-200 text-sm mt-1">Employee Portal</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h3 className="font-semibold text-gray-800 mb-2">My Information</h3>
        {fields.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-gray-800 font-medium">{value || '—'}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        <p className="font-semibold mb-1">Quick Guide</p>
        <ul className="space-y-1 text-xs list-disc list-inside text-blue-600">
          <li>Go to <strong>Attendance</strong> tab to mark your daily attendance.</li>
          <li>Check in when you arrive and check out when you leave.</li>
          <li>Submit your daily work report at check-out.</li>
          <li>Contact your admin if you face any issues.</li>
        </ul>
      </div>
    </div>
  );
}
