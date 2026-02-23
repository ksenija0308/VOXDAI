import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, LogOut, User } from 'lucide-react';
import NotificationBell from '../NotificationBell';
import { useLogoContext } from '@/context/LogoContext';
import { authAPI } from '@/api';
import { toast } from 'sonner';
import { FormData } from '@/types/formData';

interface DashboardHeaderProps {
  profileData: FormData;
  totalUnread: number;
  onLogout?: () => void;
}

export default function DashboardHeader({ profileData, totalUnread, onLogout }: DashboardHeaderProps) {
  const navigate = useNavigate();
  const { logoUrl } = useLogoContext();
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showUserMenu && !target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  const avatarInitial =
    profileData.organisationName?.charAt(0)?.toUpperCase() ||
    profileData.full_name?.charAt(0)?.toUpperCase() ||
    profileData.firstName?.charAt(0)?.toUpperCase() ||
    'U';

  return (
    <div className="border-b border-[#e9ebef]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <h2 style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold' }}>VOXD</h2>
        <div className="flex items-center gap-4">
          <button
            className="text-[#717182] hover:text-black relative"
            onClick={() => navigate('/dashboard/messages')}
          >
            <Mail className="w-5 h-5" />
            {totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                {totalUnread}
              </span>
            )}
          </button>
          <NotificationBell />
          <div className="relative user-menu-container">
            <button
              className="w-10 h-10 bg-[#0B3B2E] rounded-full flex items-center justify-center text-white hover:bg-black transition-colors overflow-hidden"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                avatarInitial
              )}
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-[#e9ebef] rounded-lg shadow-lg overflow-hidden z-50">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/profile');
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-[#f3f3f5] transition-colors flex items-center gap-3"
                >
                  <User className="w-4 h-4 text-[#717182]" />
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>Profile</span>
                </button>
                <button
                  onClick={async () => {
                    if (onLogout) {
                      try {
                        await authAPI.signOut();
                        onLogout();
                      } catch (error: any) {
                        console.error('Logout error:', error);
                        toast.error(`Failed to logout: ${error.message}`);
                      }
                    }
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-[#f3f3f5] transition-colors flex items-center gap-3"
                >
                  <LogOut className="w-4 h-4 text-[#717182]" />
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
