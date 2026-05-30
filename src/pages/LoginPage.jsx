import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { Building2, Lock, User, HardHat } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]   = useState({ username: '', password: '' });
  const [busy, setBusy]   = useState(false);

  const handleLogin = async (role) => {
    if (!form.username || !form.password) {
      toast.error('Please enter username and password');
      return;
    }
    setBusy(true);
    try {
      const data = await login(form.username, form.password, role);
      toast.success(`Welcome, ${data.name}!`);
      navigate(role === 'admin' ? '/admin' : '/emp');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-900 via-brand-800 to-blue-700 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-2xl mb-4 backdrop-blur-sm border border-white/20">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Archify & Buildify</h1>
          <p className="text-blue-200 mt-1 text-sm">Architecture & Construction Management</p>
        </div>

        {/* Login card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">Sign In</h2>

          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300" />
              <input
                type="text"
                placeholder="Username"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleLogin('admin')}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300" />
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleLogin('admin')}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={() => handleLogin('admin')}
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold py-3 rounded-xl transition-colors duration-200"
            >
              <Building2 className="w-4 h-4" />
              {busy ? 'Signing in…' : 'Admin Login'}
            </button>

            <div className="flex items-center gap-3 text-blue-300 text-xs">
              <div className="flex-1 h-px bg-white/20" />
              <span>or</span>
              <div className="flex-1 h-px bg-white/20" />
            </div>

            <button
              onClick={() => navigate('/attendance')}
              className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-3 rounded-xl transition-colors duration-200"
            >
              <HardHat className="w-4 h-4" />
              Employee Login
            </button>
          </div>
        </div>

        <p className="text-center text-blue-300 text-xs mt-6">
          © {new Date().getFullYear()} Archify & Buildify. All rights reserved.
        </p>
      </div>
    </div>
  );
}
