import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  LayoutDashboard, Users, TrendingUp, FolderKanban,
  FileText, Receipt, Briefcase, CalendarCheck,
  UserCog, Building, ChevronDown, ChevronRight,
  Menu, X, LogOut, Bell, Building2
} from 'lucide-react';

const NavGroup = ({ icon: Icon, label, children, badge }) => {
  const [open, setOpen] = useState(false);
  return (
    <li>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors group"
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span className="flex-1 text-left font-medium">{label}</span>
        {badge != null && (
          <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{badge}</span>
        )}
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>
      {open && (
        <ul className="ml-7 mt-1 space-y-0.5 border-l border-white/10 pl-3">
          {children}
        </ul>
      )}
    </li>
  );
};

const NavItem = ({ to, icon: Icon, label, end }) => (
  <li>
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-slate-300 hover:bg-white/10 hover:text-white'
        }`
      }
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      {label}
    </NavLink>
  </li>
);

const SubNavItem = ({ to, label }) => (
  <li>
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block px-2 py-1.5 rounded text-xs transition-colors ${
          isActive ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-white'
        }`
      }
    >
      {label}
    </NavLink>
  </li>
);

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-brand-900 w-64 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight">Archify</p>
          <p className="text-blue-300 text-[10px]">& Buildify</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <ul className="space-y-1">
          <NavItem to="/admin" icon={LayoutDashboard} label="Dashboard" end />

          <NavGroup icon={Users} label="Client Onboarding">
            <SubNavItem to="/admin/clients"     label="All Clients" />
            <SubNavItem to="/admin/clients/new" label="Client Entry Form" />
          </NavGroup>

          <NavGroup icon={TrendingUp} label="Leads Management">
            <SubNavItem to="/admin/leads"     label="All Leads" />
            <SubNavItem to="/admin/leads/new" label="New Lead" />
          </NavGroup>

          <NavGroup icon={FileText} label="Invoice & Payments">
            <SubNavItem to="/admin/invoices"     label="All Invoices" />
            <SubNavItem to="/admin/invoices/new" label="New Invoice / Quotation" />
          </NavGroup>

          <NavGroup icon={FolderKanban} label="Work Delegation">
            <SubNavItem to="/admin/projects"     label="All Projects" />
            <SubNavItem to="/admin/projects/new" label="Project Information Form" />
          </NavGroup>

          <NavItem to="/admin/staffs"     icon={Briefcase}    label="Ongoing Project Details" />
          <NavItem to="/admin/attendance" icon={CalendarCheck} label="Attendance & Work Reports" />

          <NavGroup icon={UserCog} label="Employee Management">
            <SubNavItem to="/admin/employees"     label="All Employees" />
            <SubNavItem to="/admin/employees/new" label="Add Employee" />
          </NavGroup>

          <NavItem to="/admin/departments" icon={Building} label="Departments & Shifts" />
        </ul>
      </nav>

      {/* User footer */}
      <div className="border-t border-white/10 p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
          {user?.name?.[0]?.toUpperCase() || 'A'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
          <p className="text-blue-400 text-[10px]">Administrator</p>
        </div>
        <button onClick={handleLogout} title="Logout" className="text-slate-400 hover:text-red-400 transition-colors">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex">
            <Sidebar />
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 text-white z-10"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center gap-4 shrink-0">
          <button
            className="lg:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <button className="relative text-gray-400 hover:text-gray-600">
            <Bell className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.name}</span>
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
