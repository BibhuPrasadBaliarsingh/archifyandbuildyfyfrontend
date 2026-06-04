import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';

// Shared
import LoginPage from './pages/LoginPage.jsx';
import NotFound  from './pages/NotFound.jsx';

// Admin pages
import AdminLayout          from './components/layout/AdminLayout.jsx';
import AdminDashboard       from './pages/admin/Dashboard.jsx';
import ClientsList          from './pages/admin/ClientsList.jsx';
import ClientEntry          from './pages/admin/ClientEntry.jsx';
import LeadsList            from './pages/admin/LeadsList.jsx';
import LeadForm             from './pages/admin/LeadForm.jsx';
import ProjectsList         from './pages/admin/ProjectsList.jsx';
import ProjectForm          from './pages/admin/ProjectForm.jsx';
import InvoiceList          from './pages/admin/InvoiceList.jsx';
import InvoiceForm          from './pages/admin/InvoiceForm.jsx';
import InvoicePrint         from './pages/admin/InvoicePrint.jsx';
import StaffsList           from './pages/admin/StaffsList.jsx';
import StaffEntry           from './pages/admin/StaffEntry.jsx';
import AttendanceAdmin      from './pages/admin/AttendanceAdmin.jsx';
import EmployeesList        from './pages/admin/EmployeesList.jsx';
import EmployeeForm         from './pages/admin/EmployeeForm.jsx';
import DepartmentsPage      from './pages/admin/DepartmentsPage.jsx';

// Attendance (employee) pages
import AttendanceLayout   from './components/layout/AttendanceLayout.jsx';
import EmployeeLogin      from './pages/attendance/EmployeeLogin.jsx';
import EmployeeProfile    from './pages/attendance/EmployeeProfile.jsx';
import AttendanceMark     from './pages/attendance/AttendanceMark.jsx';

// Guards
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  return user?.role === 'admin' ? children : <Navigate to="/" replace />;
};

const EmployeeRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  return user?.role === 'employee' ? children : <Navigate to="/attendance" replace />;
};

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"           element={<LoginPage />} />
      <Route path="/attendance" element={<EmployeeLogin />} />

      {/* Admin routes */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index                   element={<AdminDashboard />} />
        <Route path="clients"          element={<ClientsList />} />
        <Route path="clients/new"      element={<ClientEntry />} />
        <Route path="clients/edit/:id" element={<ClientEntry />} />
        <Route path="leads"            element={<LeadsList />} />
        <Route path="leads/new"        element={<LeadForm />} />
        <Route path="leads/edit/:id"   element={<LeadForm />} />
        <Route path="projects"         element={<ProjectsList />} />
        <Route path="projects/new"     element={<ProjectForm />} />
        <Route path="projects/edit/:id" element={<ProjectForm />} />
        <Route path="invoices"         element={<InvoiceList />} />
        <Route path="invoices/new"     element={<InvoiceForm />} />
        <Route path="invoices/edit/:id" element={<InvoiceForm />} />
        <Route path="invoices/print/:id" element={<InvoicePrint />} />
        <Route path="staffs"           element={<StaffsList />} />
        <Route path="staffs/new"       element={<StaffEntry />} />
        <Route path="staffs/edit/:id"  element={<StaffEntry />} />
        <Route path="attendance"       element={<AttendanceAdmin />} />
        <Route path="employees"        element={<EmployeesList />} />
        <Route path="employees/new"    element={<EmployeeForm />} />
        <Route path="employees/edit/:id" element={<EmployeeForm />} />
        <Route path="departments"      element={<DepartmentsPage />} />
      </Route>

      {/* Employee / Attendance routes */}
      <Route path="/emp" element={<EmployeeRoute><AttendanceLayout /></EmployeeRoute>}>
        <Route index              element={<EmployeeProfile />} />
        <Route path="attendance"  element={<AttendanceMark />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
