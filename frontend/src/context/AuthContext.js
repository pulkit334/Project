import React, { createContext, useState, useContext, useEffect } from 'react';
import API from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/auth/me')
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem('user');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const signup = async (username, email, password) => {
    const res = await API.post('/auth/signup', { username, email, password });
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const logout = async () => {
    try { await API.post('/auth/logout'); } catch(e) {}
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
