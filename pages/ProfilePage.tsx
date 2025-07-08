

import React, { useState, useMemo, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, BookOpen, Heart, MessageSquare } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import Avatar from '../components/Avatar';
import Spinner from '../components/Spinner';
import StoryCard from '../components/StoryCard';

type Tab = 'written' | 'liked' | 'commented';

const ProfilePage: React.FC = () => {
  const { userId } = ReactRouterDOM.useParams<{ userId: string }>();
  const { getUser, currentUser, stories, updateUserAvatar } = useAppContext();
  const [activeTab, setActiveTab] = useState<Tab>('written');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const user = useMemo(() => userId ? getUser(userId) : undefined, [userId, getUser]);
  const isOwnProfile = currentUser?.id === user?.id;

  const userStories = useMemo(() => {
    return stories.filter(s => s.authorId === userId);
  }, [stories, userId]);

  const likedStories = useMemo(() => {
    return stories.filter(s => s.likes.includes(userId || ''));
  }, [stories, userId]);

  const commentedStories = useMemo(() => {
    const storyIds = new Set<string>();
    stories.forEach(story => {
      if (story.comments.some(c => c.authorId === userId)) {
        storyIds.add(story.id);
      }
    });
    return stories.filter(s => storyIds.has(s.id));
  }, [stories, userId]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
        const reader = new FileReader();
        reader.onloadend = () => {
            updateUserAvatar(user.id, reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;
  }
  
  const TABS: { id: Tab, label: string, icon: React.ElementType, data: typeof userStories }[] = [
      { id: 'written', label: `قصصه (${userStories.length})`, icon: BookOpen, data: userStories },
      { id: 'liked', label: `أعجبه (${likedStories.length})`, icon: Heart, data: likedStories },
      { id: 'commented', label: `علّق عليها (${commentedStories.length})`, icon: MessageSquare, data: commentedStories },
  ]

  const activeTabData = TABS.find(tab => tab.id === activeTab)?.data || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* Profile Header */}
      <div className="relative bg-gray-900 p-8 rounded-xl shadow-lg mb-8 overflow-hidden border border-gray-800">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-cover bg-center opacity-30" style={{backgroundImage: `url(https://picsum.photos/seed/${user.id}/1200/400)`}}></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-gray-900 to-transparent"></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <Avatar src={user.avatar} alt={user.name} size="lg" />
              {isOwnProfile && (
                <>
                  <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 end-0 bg-amber-500 p-2 rounded-full text-gray-900 hover:bg-amber-400 transition-colors shadow-lg" title="تغيير الصورة الرمزية">
                    <Edit2 size={16} />
                  </button>
                </>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white text-center sm:text-start">{user.name}</h1>
              <p className="text-gray-400 mt-1 text-center sm:text-start">عضو في مجتمع حكايات</p>
            </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex border-b border-gray-800">
          {TABS.map(({id, label, icon: Icon}) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`relative flex items-center gap-2 px-4 py-3 font-semibold transition-colors ${activeTab === id ? 'text-amber-400' : 'text-gray-400 hover:text-white'}`}
            >
              <Icon size={18} />
              <span>{label}</span>
              {activeTab === id && (
                <motion.div className="absolute bottom-0 right-0 left-0 h-0.5 bg-amber-400" layoutId="underline" />
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Tab Content */}
      <div>
        <AnimatePresence mode="wait">
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
            >
                {activeTabData.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {activeTabData.map(story => <StoryCard key={story.id} story={story} />)}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-gray-900 rounded-lg border border-gray-800">
                        <p className="text-gray-400 text-lg">لا توجد قصص لعرضها في هذا القسم.</p>
                        <p className="text-gray-500 mt-1">عندما يتفاعل {user.name} مع القصص، ستظهر هنا.</p>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ProfilePage;