import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isAdmin } from '../services/adminService';

export default function AdminRoute({ children }) {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [adminCheck, setAdminCheck] = useState({ loading: true, isAdmin: false });

  useEffect(() => {
    if (!user) {
      setAdminCheck({ loading: false, isAdmin: false });
      return;
    }
    let cancelled = false;
    isAdmin(user.uid).then((ok) => {
      if (!cancelled) setAdminCheck({ loading: false, isAdmin: ok });
    });
    return () => { cancelled = true; };
  }, [user]);

  if (authLoading || adminCheck.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <p className="text-slate-500">Verificando acceso...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/iniciar-sesion" state={{ from: location }} replace />;
  }

  if (!adminCheck.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
