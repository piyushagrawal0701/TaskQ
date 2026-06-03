import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import { Toaster } from "react-hot-toast";

const AuthGate = ({ children }) => {
  const { user, loading, loginWithGoogle } = useAuth();

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-xs font-mono text-zinc-500">Loading token profile...</div>;
  
  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full border border-zinc-800 bg-zinc-900 p-8 rounded-2xl text-center space-y-6">
          <h1 className="text-2xl font-bold tracking-tight text-white">Kriscent Enterprise Node</h1>
          <button onClick={loginWithGoogle} className="w-full bg-white hover:bg-zinc-100 text-zinc-950 font-semibold p-3 rounded-xl transition-all shadow-md active:scale-[0.99] text-sm">
            Authenticate via Google
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
       <Toaster position="top-right" toastOptions={{
      duration: 3000,
    }} />
        <Routes>
          <Route path="/" element={<AuthGate><Dashboard /></AuthGate>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;