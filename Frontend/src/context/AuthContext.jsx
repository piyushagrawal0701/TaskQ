import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
// Import your existing initialized Firebase instances
import { auth, googleProvider } from '../config/firebase'; 
import api from '../utils/api';
import { socket } from '../utils/socket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [mongoUser, setMongoUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncUserProfile = async (firebaseUser) => {
    try {
      const token = await firebaseUser.getIdToken();
      
      const res = await api.get('/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMongoUser(res.data);
      
      // If the user belongs to a team, instantly put them in their Socket.IO channel
      if (res.data.teamId) {
        socket.auth = { token };
        socket.connect();
        socket.emit('join-team', res.data.teamId);
      }
    } catch (err) {
      console.error('Error syncing profile metadata with MongoDB:', err);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      await syncUserProfile(result.user);
    } catch (err) {
      console.error('Authentication process aborted:', err);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      socket.disconnect();
      setUser(null);
      setMongoUser(null);
    } catch (err) {
      console.error('Sign-out exception:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await syncUserProfile(firebaseUser);
      } else {
        setUser(null);
        setMongoUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, mongoUser, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be wrapped within an AuthProvider');
  return context;
};