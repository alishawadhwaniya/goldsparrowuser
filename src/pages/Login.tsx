import { useUser } from '@/hooks/useUser';
import { gradients, textColors } from '@/theme/colors';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { useDeviceSize } from '@/hooks/use-responsive';

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useUser();
  const { isSmallPhone, isPhone, isTablet, isLaptop, currentSize } = useDeviceSize();

  // Show decorative elements only on larger screens
  const showDecorations = !isSmallPhone && !isPhone;

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-navy-900">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-9 w-9 xs:h-10 xs:w-10 sm:h-12 sm:w-12 bg-gold-400 rounded-full mb-2 xs:mb-3 sm:mb-4"></div>
          <div className="h-2.5 xs:h-3 sm:h-4 w-16 xs:w-20 sm:w-24 bg-gold-300/30 rounded"></div>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className={`min-h-screen flex flex-col bg-gradient-to-br ${gradients.navy.dark}`}>
      {/* Top left logo removed */}

      <div className="flex-1 flex flex-col items-center justify-center px-2 xxs:px-3 xs:px-4 py-6 xxs:py-8 xs:py-10 sm:py-12">
        <div className="w-full max-w-[250px] xxs:max-w-[280px] xs:max-w-sm sm:max-w-md mx-auto text-center mb-3 xxs:mb-4 xs:mb-6 sm:mb-8">
          {/* Center logo - now shown on all screen sizes */}
          <div className={`h-12 w-12 xxs:h-14 xxs:w-14 xs:h-16 xs:w-16 bg-gradient-to-br ${gradients.gold.default} rounded-full flex items-center justify-center ${textColors.navy} font-bold text-lg xxs:text-xl xs:text-2xl mx-auto mb-2 xxs:mb-3 xs:mb-4`}>
            GS
          </div>
          <h1 className="text-lg xxs:text-xl xs:text-2xl sm:text-3xl font-bold text-white mb-1 xs:mb-2">
            GoldSparrow Solutions
          </h1>
          <p className="text-gold-200 text-xs xxs:text-sm xs:text-base sm:text-lg">
            Gold Auction Management System
          </p>
        </div>

        <div className="animate-fade-in w-full max-w-[250px] xxs:max-w-[280px] xs:max-w-sm sm:max-w-md">
          <div className="bg-white/5 backdrop-blur-sm p-3 xxs:p-4 xs:p-6 sm:p-8 rounded-md xxs:rounded-lg xs:rounded-xl border border-white/10 shadow xs:shadow-lg sm:shadow-xl">
            <AuthForm />
          </div>
        </div>

        <p className="mt-3 xxs:mt-4 xs:mt-6 sm:mt-8 text-[8px] xxs:text-[10px] xs:text-xs sm:text-sm text-gray-400 px-2 text-center">
          © 2025 GoldSparrow Solutions. All rights reserved.
        </p>
      </div>

      {/* Background decorative elements - only visible on tablet and larger screens */}
      {showDecorations && (
        <>
          <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-gold-500/5 rounded-tl-full pointer-events-none" />
          <div className="absolute top-0 right-20 w-16 sm:w-20 h-16 sm:h-20 bg-gold-500/10 rounded-full pointer-events-none" />
        </>
      )}
    </div>
  );
};

export default Login; 