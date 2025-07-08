import React, { createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { User, Story, Comment, Notification } from '../types';
import { StoryCategory } from '../types';

// --- Default Data for initial setup ---
const createInitialData = () => {
    const defaultUserId1 = "user-1";
    const defaultUser1: User = { id: defaultUserId1, name: "مؤلف تجريبي", avatar: "https://picsum.photos/seed/user1/100/100" };
    const defaultUserId2 = "user-2";
    const defaultUser2: User = { id: defaultUserId2, name: "عاشق الفضاء", avatar: "https://picsum.photos/seed/user2/100/100" };
    const defaultUserId3 = "user-3";
    const defaultUser3: User = { id: defaultUserId3, name: "أسطورة الخيال", avatar: "https://picsum.photos/seed/user3/100/100" };

    const initialUsers: User[] = [defaultUser1, defaultUser2, defaultUser3];

    const initialStories: Story[] = [
        
    ];
    return { initialUsers, initialStories };
};


// --- Context Types ---
interface AppContextType {
  users: User[];
  stories: Story[];
  currentUser: User | null;
  login: (name: string) => User;
  logout: () => void;
  updateUserAvatar: (userId: string, avatar: string) => void;
  getStory: (id: string) => Story | undefined;
  incrementStoryView: (id: string) => void;
  createStory: (story: Omit<Story, 'id' | 'createdAt' | 'views' | 'likes' | 'comments'>) => Story;
  updateStory: (story: Story) => void;
  deleteStory: (id: string) => void;
  toggleLike: (storyId: string, userId: string) => void;
  addComment: (storyId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void;
  getUser: (id: string) => User | undefined;
  notifications: Notification[];
  unreadCount: number;
  markNotificationsAsRead: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// --- Provider Component ---
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { initialUsers, initialStories } = createInitialData();
  const [users, setUsers] = useLocalStorage<User[]>('hakayat_users', initialUsers);
  const [stories, setStories] = useLocalStorage<Story[]>('hakayat_stories', initialStories);
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('hakayat_currentUser', null);
  const [notifications, setNotifications] = useLocalStorage<Notification[]>('hakayat_notifications', []);
  const [userMeta, setUserMeta] = useLocalStorage<Record<string, { lastNotificationCheck: string }>>('hakayat_user_meta', {});

  const login = useCallback((name: string): User => {
    let user = users.find(u => u.name.toLowerCase() === name.toLowerCase());
    if (!user) {
      user = {
        id: `user-${Date.now()}`,
        name,
        avatar: `https://picsum.photos/seed/${name}/100/100`,
      };
      setUsers(prev => [...prev, user]);
    }
    setCurrentUser(user);
    return user;
  }, [users, setUsers, setCurrentUser]);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, [setCurrentUser]);

  const updateUserAvatar = useCallback((userId: string, avatar: string) => {
    setUsers((prevUsers: User[]) => prevUsers.map(u => u.id === userId ? { ...u, avatar } : u));
    if (currentUser?.id === userId) {
      setCurrentUser((prev: User | null) => prev ? { ...prev, avatar } : null);
    }
  }, [setUsers, currentUser, setCurrentUser]);
  
  const getUser = useCallback((id: string) => users.find(u => u.id === id), [users]);

  const getStory = useCallback((id: string) => {
    return stories.find(s => s.id === id);
  }, [stories]);

  const incrementStoryView = useCallback((id: string) => {
    const viewedInSessionKey = `viewed_story_${id}`;
    if (sessionStorage.getItem(viewedInSessionKey)) {
      return; // Already viewed in this session
    }
    
    setStories(prevStories => prevStories.map(s => s.id === id ? { ...s, views: s.views + 1 } : s));
    sessionStorage.setItem(viewedInSessionKey, 'true');
  }, [setStories]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 50));
  }, [setNotifications]);

  const createStory = useCallback((storyData: Omit<Story, 'id' | 'createdAt' | 'views' | 'likes' | 'comments'>) => {
    const newStory: Story = {
      ...storyData,
      id: `story-${Date.now()}`,
      createdAt: new Date().toISOString(),
      views: 0,
      likes: [],
      comments: [],
    };
    setStories((prev: Story[]) => [newStory, ...prev]);
    
    addNotification({
        storyId: newStory.id,
        storyTitle: newStory.title,
        authorId: newStory.authorId,
    });
    
    return newStory;
  }, [setStories, addNotification]);

  const updateStory = useCallback((updatedStory: Story) => {
    setStories((prev: Story[]) => prev.map(s => s.id === updatedStory.id ? updatedStory : s));
  }, [setStories]);

  const deleteStory = useCallback((id: string) => {
    setStories((prev: Story[]) => prev.filter(s => s.id !== id));
  }, [setStories]);
  
  const toggleLike = useCallback((storyId: string, userId: string) => {
    setStories((prevStories: Story[]) => prevStories.map(s => {
        if (s.id === storyId) {
            const newLikes = s.likes.includes(userId)
                ? s.likes.filter(uid => uid !== userId)
                : [...s.likes, userId];
            return { ...s, likes: newLikes };
        }
        return s;
    }));
  }, [setStories]);

  const addComment = useCallback((storyId: string, commentData: Omit<Comment, 'id' | 'createdAt'>) => {
    const newComment: Comment = {
        ...commentData,
        id: `comment-${Date.now()}`,
        createdAt: new Date().toISOString(),
    };
    setStories((prevStories: Story[]) => prevStories.map(s =>
        s.id === storyId ? { ...s, comments: [newComment, ...s.comments] } : s
    ));
  }, [setStories]);
  
  const unreadCount = useMemo(() => {
    if (!currentUser) return 0;
    const lastCheck = userMeta[currentUser.id]?.lastNotificationCheck;
    if (!lastCheck) return notifications.length;
    
    const lastCheckDate = new Date(lastCheck);
    return notifications.filter(n => new Date(n.timestamp) > lastCheckDate).length;
  }, [notifications, currentUser, userMeta]);

  const markNotificationsAsRead = useCallback(() => {
    if (!currentUser) return;
    setUserMeta(prev => ({
        ...prev,
        [currentUser.id]: {
            ...prev[currentUser.id],
            lastNotificationCheck: new Date().toISOString(),
        }
    }));
  }, [currentUser, setUserMeta]);


  const value = {
    users,
    stories,
    currentUser,
    login,
    logout,
    updateUserAvatar,
    getStory,
    incrementStoryView,
    createStory,
    updateStory,
    deleteStory,
    toggleLike,
    addComment,
    getUser,
    notifications,
    unreadCount,
    markNotificationsAsRead,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// --- Custom Hook for consuming context ---
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};