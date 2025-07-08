
import React, { useState, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Filter, BookHeart, Wand2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import StoryCard from '../components/StoryCard';
import { CATEGORIES } from '../constants';
import type { Story, StoryCategory } from '../types';

const SectionTitle: React.FC<{children: React.ReactNode}> = ({ children }) => (
    <h2 className="text-3xl font-bold text-white mb-6">
        <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">{children}</span>
    </h2>
)

const HomePage: React.FC = () => {
  const { stories, getUser } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<StoryCategory | 'all'>('all');

  const topStoriesMeta = useMemo(() => {
    const storiesByViews = [...stories].sort((a, b) => b.views - a.views);
    const storiesByLikes = [...stories].sort((a, b) => b.likes.length - a.likes.length);
    
    return {
        mostViewedIds: storiesByViews.slice(0, 3).map(s => s.id),
        mostLikedIds: storiesByLikes.slice(0, 3).map(s => s.id),
    }
  }, [stories]);

  const filteredStories = useMemo(() => {
    return stories.filter(story => {
      const author = getUser(story.authorId);
      const matchesCategory = selectedCategory === 'all' || story.category === selectedCategory;
      const matchesSearch =
        story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (author && author.name.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [stories, searchTerm, selectedCategory, getUser]);

  const trendingStories = useMemo(() => {
    return [...stories]
      .sort((a, b) => (b.views + b.likes.length * 5) - (a.views + a.likes.length * 5))
      .slice(0, 4);
  }, [stories]);

  const recentStories = useMemo(() => {
    return [...stories]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);
  }, [stories]);


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative rounded-lg overflow-hidden mb-16 text-center h-[50vh] flex flex-col justify-center items-center p-8">
        <div className="absolute inset-0 bg-cover bg-center bg-[url('https://picsum.photos/seed/hero/1200/600')] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 to-transparent"></div>
        <motion.div 
            className="relative z-10"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
        >
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight shadow-black [text-shadow:_0_2px_4px_var(--tw-shadow-color)]">
                حيث تولد الكلمات عوالم جديدة
            </h1>
            <p className="text-lg text-gray-300 mt-4 max-w-2xl mx-auto">
                منصة "حكايات" هي بوابتك لقراءة ومشاركة وتوليد أروع القصص. انطلق في رحلة إبداعية لا حدود لها.
            </p>
            <div className="mt-8 flex justify-center gap-4">
                <ReactRouterDOM.Link to="/create" className="flex items-center gap-2 bg-amber-500 text-gray-900 px-6 py-3 rounded-lg hover:bg-amber-400 transition-all font-bold text-lg transform hover:scale-105">
                    <BookHeart />
                    <span>اكتب قصتك</span>
                </ReactRouterDOM.Link>
                <ReactRouterDOM.Link to="/generate" className="flex items-center gap-2 bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-all font-bold text-lg transform hover:scale-105">
                    <Wand2 />
                    <span>استعن بالذكاء الاصطناعي</span>
                </ReactRouterDOM.Link>
            </div>
        </motion.div>
      </div>

      {/* Trending Section */}
      <section className="mb-12">
        <SectionTitle>الأكثر رواجاً</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence>
            {trendingStories.map(story => (
              <StoryCard key={story.id} story={story} isMostViewed={topStoriesMeta.mostViewedIds.includes(story.id)} isMostLiked={topStoriesMeta.mostLikedIds.includes(story.id)} />
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Recent Section */}
      <section className="mb-12">
        <SectionTitle>أحدث القصص</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence>
            {recentStories.map(story => (
              <StoryCard key={story.id} story={story} isMostViewed={topStoriesMeta.mostViewedIds.includes(story.id)} isMostLiked={topStoriesMeta.mostLikedIds.includes(story.id)} />
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* All Stories Section */}
      <section>
        <SectionTitle>كل القصص</SectionTitle>
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-gray-900/70 rounded-lg border border-gray-800">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="ابحث عن قصة، محتوى، أو مؤلف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg py-2 ps-10 pe-4 text-white focus:outline-none focus:border-amber-500 transition-colors"
            />
            <Search className="absolute top-1/2 -translate-y-1/2 start-3 text-gray-400" size={20} />
          </div>
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as StoryCategory | 'all')}
              className="w-full md:w-auto appearance-none bg-gray-800 border-2 border-gray-700 rounded-lg py-2 ps-10 pe-4 text-white focus:outline-none focus:border-amber-500 transition-colors"
            >
              <option value="all">كل التصنيفات</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <Filter className="absolute top-1/2 -translate-y-1/2 start-3 text-gray-400" size={20} />
          </div>
        </div>

        {/* Story Grid */}
        <AnimatePresence>
            {filteredStories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredStories.map(story => <StoryCard key={story.id} story={story} isMostViewed={topStoriesMeta.mostViewedIds.includes(story.id)} isMostLiked={topStoriesMeta.mostLikedIds.includes(story.id)} />)}
                </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-400 col-span-full text-center py-16 bg-gray-900 rounded-lg">
                <p className="text-xl">لم يتم العثور على قصص تطابق بحثك.</p>
                <p className="text-gray-500 mt-2">جرّب كلمة بحث مختلفة أو قم بتغيير التصنيف.</p>
              </motion.div>
            )}
        </AnimatePresence>
      </section>
    </motion.div>
  );
};

export default HomePage;
