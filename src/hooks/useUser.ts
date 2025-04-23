import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, LoginResponse } from '@/api/services/auth.service';

export interface UserData {
  _id: string;
  username: string;
  role: string;
}

export const useUser = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedToken && storedUser) {
      setUser({
        ...JSON.parse(storedUser),
      });
    }

    setLoading(false);
  }, []);

  const login = (user: LoginResponse) => {
    localStorage.setItem('user', JSON.stringify(user.user));
    localStorage.setItem('token', user.token);
    setUser(user.user);
  };

  const logout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: Boolean(user)
  };
}; 