import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from '@/components/Dashboard';
import Header from '@/components/Header';
import { useUser } from '@/hooks/useUser';

const Index = () => {
  const { user, loading, isAuthenticated } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Dashboard />
      </main>
    </div>
  );
};

export default Index;
