import { useNavigate } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        <h1 className="text-6xl font-bold text-gray-200 mb-2">404</h1>
        <p className="text-gray-600 mb-6">Page not found.</p>
        <button onClick={() => navigate('/')} className="btn-primary flex items-center gap-2 mx-auto">
          <Home className="w-4 h-4" /> Go Home
        </button>
      </div>
    </div>
  );
}
