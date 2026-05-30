import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { HardHat, CalendarCheck, User, LogOut } from 'lucide-react';

export default function AttendanceLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/attendance'); };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-brand-900 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <HardHat className="w-6 h-6 text-blue-300" />
            <span className="font-bold text-sm sm:text-base">Employee Attendance Portal</span>
          </div>
          <nav className="flex-1 flex items-center justify-center gap-1">
            <NavLink
              to="/emp"
              end
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-blue-200 hover:bg-white/10'}`
              }
            >
              <User className="w-3.5 h-3.5" /> Profile
            </NavLink>
            <NavLink
              to="/emp/attendance"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-blue-200 hover:bg-white/10'}`
              }
            >
              <CalendarCheck className="w-3.5 h-3.5" /> Attendance
            </NavLink>
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-xs text-blue-300 hidden sm:block">{user?.name}</span>
            <button onClick={handleLogout} className="text-blue-300 hover:text-red-400 transition-colors" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
