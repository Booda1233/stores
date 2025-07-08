

import React, { useState, useEffect, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { LogOut, User, PlusCircle, BrainCircuit, Bell } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import Avatar from './Avatar';

const NavLink: React.FC<{ to: string, children: React.ReactNode, className?: string, title?: string }> = ({ to, children, className, title }) => {
  const location = ReactRouterDOM.useLocation();
  const isActive = location.pathname === to;
  return (
    <ReactRouterDOM.Link 
      to={to} 
      title={title}
      className={`flex items-center gap-2 text-gray-300 hover:text-amber-400 p-2 rounded-md transition-colors ${isActive ? 'bg-gray-800' : ''} ${className}`}
    >
      {children}
    </ReactRouterDOM.Link>
  );
};

// Helper function for time formatting
const timeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return `منذ ${Math.floor(interval)} سنة`;
    interval = seconds / 2592000;
    if (interval > 1) return `منذ ${Math.floor(interval)} شهر`;
    interval = seconds / 86400;
    if (interval > 1) return `منذ ${Math.floor(interval)} يوم`;
    interval = seconds / 3600;
    if (interval > 1) return `منذ ${Math.floor(interval)} ساعة`;
    interval = seconds / 60;
    if (interval > 1) return `منذ ${Math.floor(interval)} دقيقة`;
    return `الآن`;
};

// Dropdown component
const NotificationsDropdown: React.FC<{onClose: () => void}> = ({ onClose }) => {
    const { notifications, getUser } = useAppContext();
    const navigate = ReactRouterDOM.useNavigate();

    const handleNotificationClick = (storyId: string) => {
        navigate(`/story/${storyId}`);
        onClose();
    };

    return (
        <div className="absolute top-full mt-2 end-0 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50">
            <div className="p-3 font-bold text-white border-b border-gray-700">الإشعارات</div>
            <ul className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                    notifications.map(notif => {
                        const author = getUser(notif.authorId);
                        return (
                            <li key={notif.id} className="border-b border-gray-800 last:border-b-0">
                                <button onClick={() => handleNotificationClick(notif.storyId)} className="w-full text-right flex items-start gap-3 p-3 hover:bg-gray-800 transition-colors">
                                    <Avatar src={author?.avatar || ''} alt={author?.name || 'مستخدم'} size="sm" />
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-200">
                                            <span className="font-bold">{author?.name || 'مستخدم'}</span> نشر قصة جديدة: <span className="text-amber-400 font-semibold">"{notif.storyTitle}"</span>
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">{timeAgo(notif.timestamp)}</p>
                                    </div>
                                </button>
                            </li>
                        );
                    })
                ) : (
                    <li className="p-4 text-center text-gray-500">لا توجد إشعارات بعد.</li>
                )}
            </ul>
        </div>
    );
};


const Header: React.FC = () => {
  const { currentUser, logout, unreadCount, markNotificationsAsRead } = useAppContext();
  const navigate = ReactRouterDOM.useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleDropdown = () => {
      setIsDropdownOpen(prev => {
          const newOpenState = !prev;
          if (newOpenState && unreadCount > 0) {
              markNotificationsAsRead();
          }
          return newOpenState;
      });
  };

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
              setIsDropdownOpen(false);
          }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
          document.removeEventListener("mousedown", handleClickOutside);
      };
  }, [dropdownRef]);


  return (
    <header className="bg-gray-950/70 backdrop-blur-lg sticky top-0 z-40 shadow-md shadow-amber-500/10">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <ReactRouterDOM.Link to="/" className="text-2xl font-bold text-amber-400 tracking-wider">
          حكايات
        </ReactRouterDOM.Link>
        <div className="flex items-center gap-2 sm:gap-4">
          {currentUser ? (
            <>
              <NavLink to="/generate" title="إنشاء بالذكاء الاصطناعي">
                <BrainCircuit size={20} />
                <span className="hidden sm:inline">إنشاء AI</span>
              </NavLink>
              <NavLink to="/create" title="قصة جديدة">
                <PlusCircle size={20} />
                <span className="hidden sm:inline">قصة جديدة</span>
              </NavLink>
              <div className="h-6 w-px bg-gray-700 mx-2"></div>

              <div className="relative" ref={dropdownRef}>
                  <button onClick={toggleDropdown} className="relative text-gray-400 hover:text-amber-400 transition-colors p-2 rounded-full hover:bg-gray-800" title="الإشعارات">
                      <Bell size={20} />
                      {unreadCount > 0 && (
                          <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                          </span>
                      )}
                  </button>
                  {isDropdownOpen && <NotificationsDropdown onClose={() => setIsDropdownOpen(false)} />}
              </div>
              
              <ReactRouterDOM.Link to={`/profile/${currentUser.id}`} className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-800 transition-colors">
                <Avatar src={currentUser.avatar} alt={currentUser.name} size="sm" />
                <span className="font-medium hover:text-amber-400 transition-colors hidden md:inline">{currentUser.name}</span>
              </ReactRouterDOM.Link>
              <button onClick={handleLogout} className="text-gray-400 hover:text-amber-400 transition-colors p-2 rounded-full hover:bg-gray-800" title="تسجيل الخروج">
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <ReactRouterDOM.Link to="/login" className="flex items-center gap-2 bg-amber-500 text-gray-900 px-4 py-2 rounded-md hover:bg-amber-400 transition-colors font-bold">
              <User size={20} />
              <span>تسجيل الدخول</span>
            </ReactRouterDOM.Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;