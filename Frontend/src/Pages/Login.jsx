import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Updated Import
import { LogIn } from 'lucide-react';

const Login = () => {
  const { loginWithGoogle, user, error, loading } = useAuth(); // Consuming Context Hook
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/20">
            <span className="text-xl font-black tracking-wider">T</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Welcome to TaskQ</h2>
          <p className="text-sm text-slate-400">Collaborative Project & Task Architecture</p>
        </div>

       

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400 text-center">
            {error}
          </div>
        )}

        <button
          onClick={loginWithGoogle}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition-all hover:bg-slate-100 active:scale-[0.98] disabled:opacity-50 shadow-md"
        >
          {loading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
          ) : (
            <>
              <LogIn className="h-5 w-5 text-slate-700" />
              Sign in with Google
            </>
          )}
        </button>

        <div className="text-center text-xs text-slate-500">
          Kriscent Techno Hub • Context Portal Engine
        </div>
      </div>
    </div>
  );
};

export default Login;