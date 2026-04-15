import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

export const useFetchUser = () => {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await api.get('/user/index');
      if (res.data) {
        setUser(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch user info:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return { user, loading, refetch: fetchUser };
};
