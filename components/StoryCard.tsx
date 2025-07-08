
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, Heart, MessageCircle, Star, Flame } from 'lucide-react';
import type { Story } from '../types';
import { useAppContext } from '../context/AppContext';
import Avatar from './Avatar';

interface StoryCardProps {
  story: Story;
  isMostViewed?: boolean;
  isMostLiked?: boolean;
}

const StoryCard: React.FC<StoryCardProps> = ({ story, isMostViewed, isMostLiked }) => {
  const { getUser } = useAppContext();
  const author = getUser(story.authorId);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-amber-500/20 transition-all duration-300 flex flex-col group relative hover:-translate-y-1"
    >
      <div className="overflow-hidden relative">
         <ReactRouterDOM.Link to={`/story/${story.id}`} className="block relative">
            <img
              src={story.coverImage || `https://picsum.photos/seed/${story.id}/400/200`}
              alt={story.title}
              className="w-full h-48 object-cover transform transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </ReactRouterDOM.Link>
        <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
          {isMostLiked && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
              title="الأكثر إعجاباً"
              className="bg-red-500/80 backdrop-blur-sm text-white h-7 w-7 flex items-center justify-center rounded-full shadow-lg"
            >
              <Flame size={16} />
            </motion.div>
          )}
          {isMostViewed && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
              title="الأكثر مشاهدة"
              className="bg-amber-400/80 backdrop-blur-sm text-white h-7 w-7 flex items-center justify-center rounded-full shadow-lg"
            >
              <Star size={16} />
            </motion.div>
          )}
        </div>
      </div>
     
      <div className="p-4 flex flex-col flex-grow">
        <span className="text-sm text-amber-400 font-semibold">{story.category}</span>
        <ReactRouterDOM.Link to={`/story/${story.id}`} className="block flex-grow">
          <h3 className="text-xl font-bold mt-1 mb-2 text-gray-100 group-hover:text-amber-300 transition-colors">{story.title}</h3>
        </ReactRouterDOM.Link>
        <p className="text-gray-400 text-sm line-clamp-2 mt-auto">
           {story.content.substring(0, 100)}...
        </p>
        <div className="mt-4 pt-4 border-t border-gray-700/50 flex justify-between items-center">
          {author && (
            <ReactRouterDOM.Link to={`/profile/${author.id}`} className="flex items-center gap-2 group/author">
              <Avatar src={author.avatar} alt={author.name} size="sm" />
              <span className="text-sm font-medium text-gray-300 group-hover/author:text-white transition-colors">{author.name}</span>
            </ReactRouterDOM.Link>
          )}
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span className="flex items-center gap-1" title="الإعجابات"><Heart size={14} /> {story.likes.length}</span>
            <span className="flex items-center gap-1" title="التعليقات"><MessageCircle size={14} /> {story.comments.length}</span>
            <span className="flex items-center gap-1" title="المشاهدات"><Eye size={14} /> {story.views}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StoryCard;
