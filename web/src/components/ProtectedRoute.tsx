import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { addToast } from '@heroui/react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  message?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/', 
  message = '请先登录' 
}) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      addToast({
        title: message,
        description: '登录后才能访问此页面',
        color: 'warning',
        timeout: 3000,
      });
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo, message]);

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;