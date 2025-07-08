import React, { useState, FormEvent, useMemo, useRef, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, User, Calendar, Clock, Volume2, Play, Pause, StopCircle, Share2, Twitter, Facebook, Link as LinkIcon, Edit, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import Avatar from '../components/Avatar';
import Spinner from '../components/Spinner';
import { useReadingProgress } from '../hooks/useReadingProgress';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

const StoryPage: React.FC = () => {
  const { storyId } = ReactRouterDOM.useParams<{ storyId: string }>();
  const navigate = ReactRouterDOM.useNavigate();
  const { getStory, getUser, currentUser, toggleLike, addComment, deleteStory, incrementStoryView, stories } = useAppContext();
  
  const storyFromContext = useMemo(() => (storyId ? getStory(storyId) : undefined), [storyId, stories, getStory]);
  
  const [story, setStory] = useState(storyFromContext);
  const [commentText, setCommentText] = useState('');
  
  useEffect(() => {
    if (storyId) {
      incrementStoryView(storyId);
    }
  }, [storyId, incrementStoryView]);

  useEffect(() => {
    setStory(storyFromContext);
  }, [storyFromContext]);
  
  const author = useMemo(() => story ? getUser(story.authorId) : undefined, [story, getUser]);

  const contentRef = useRef<HTMLDivElement>(null);
  const readingProgress = useReadingProgress(contentRef);
  const { isSpeaking, isPaused, play, pause, stop } = useTextToSpeech(story?.content || '');

  if (!story || !author) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;
  }
  
  const isAuthor = currentUser?.id === author.id;
  const hasLiked = currentUser ? story.likes.includes(currentUser.id) : false;

  const handleLike = () => {
    if (currentUser) {
      toggleLike(story.id, currentUser.id);
      // Optimistic update for UI
      const newLikes = hasLiked ? story.likes.filter(id => id !== currentUser.id) : [...story.likes, currentUser.id];
      setStory(s => s ? {...s, likes: newLikes} : undefined);
    } else {
      navigate('/login');
    }
  };

  const handleCommentSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (commentText.trim() && currentUser) {
      addComment(story.id, { authorId: currentUser.id, content: commentText });
      // Optimistic update for UI
      const newComment = { id: `temp-${Date.now()}`, authorId: currentUser.id, content: commentText, createdAt: new Date().toISOString() };
      setStory(s => s ? {...s, comments: [newComment, ...s.comments]} : undefined);
      setCommentText('');
    } else if (!currentUser) {
        navigate('/login');
    }
  };
  
  const handleDelete = () => {
    if (window.confirm("هل أنت متأكد من أنك تريد حذف هذه القصة؟ لا يمكن التراجع عن هذا الإجراء.")) {
        deleteStory(story.id);
        navigate('/');
    }
  };

  const estimatedReadTime = Math.ceil(story.content.split(' ').length / 200);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div
        className="fixed top-0 left-0 right-0 h-1 bg-amber-500 z-50 transition-transform duration-150"
        style={{ transform: `scaleX(${readingProgress / 100})`, transformOrigin: 'right' }}
      />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <span className="text-amber-400 font-semibold">{story.category}</span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mt-2 mb-4">{story.title}</h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-400">
            <ReactRouterDOM.Link to={`/profile/${author.id}`} className="flex items-center gap-2 hover:text-white transition-colors">
              <Avatar src={author.avatar} alt={author.name} size="sm" />
              <span>{author.name}</span>
            </ReactRouterDOM.Link>
            <span className="flex items-center gap-2"><Calendar size={16} /> {new Date(story.createdAt).toLocaleDateString('ar-EG')}</span>
            <span className="flex items-center gap-2"><Clock size={16} /> قراءة {estimatedReadTime} دقائق</span>
          </div>
        </div>

        {/* Cover Image */}
        <img
          src={story.coverImage || `https://picsum.photos/seed/${story.id}/800/400`}
          alt={story.title}
          className="w-full h-64 md:h-96 object-cover rounded-lg mb-8 shadow-lg shadow-black/30"
        />

        {/* Actions Bar & TTS */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 p-3 bg-gray-900 rounded-lg border border-gray-800">
            <div className="flex items-center gap-4">
                <button onClick={handleLike} className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-300 ${hasLiked ? 'text-amber-400 bg-amber-500/10 ring-1 ring-amber-500/30' : 'text-gray-300 hover:bg-gray-800'}`}>
                <Heart size={20} className={hasLiked ? 'fill-current' : ''} />
                <span>{story.likes.length}</span>
                </button>
                <div className="flex items-center gap-2 text-gray-300 px-3 py-2">
                <MessageCircle size={20} />
                <span>{story.comments.length}</span>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-amber-400">
                    <Volume2 size={20} />
                </div>
                <div className="flex items-center gap-1 bg-gray-800 p-1 rounded-full">
                    <button onClick={play} disabled={isSpeaking && !isPaused} className="p-2 disabled:opacity-50 text-gray-300 hover:text-green-400 rounded-full hover:bg-gray-700 transition-colors"><Play size={20} /></button>
                    <button onClick={pause} disabled={!isSpeaking || isPaused} className="p-2 disabled:opacity-50 text-gray-300 hover:text-yellow-400 rounded-full hover:bg-gray-700 transition-colors"><Pause size={20} /></button>
                    <button onClick={stop} disabled={!isSpeaking} className="p-2 disabled:opacity-50 text-gray-300 hover:text-red-400 rounded-full hover:bg-gray-700 transition-colors"><StopCircle size={20} /></button>
                </div>
                <div className="w-px h-6 bg-gray-700 mx-2"></div>
                 {isAuthor && (
                    <>
                        <ReactRouterDOM.Link to={`/edit/${story.id}`} className="p-2 text-gray-300 hover:text-amber-400 rounded-full hover:bg-gray-700 transition-colors" title="تعديل القصة">
                            <Edit size={20} />
                        </ReactRouterDOM.Link>
                        <button onClick={handleDelete} className="p-2 text-gray-300 hover:text-red-500 rounded-full hover:bg-gray-700 transition-colors" title="حذف القصة">
                            <Trash2 size={20} />
                        </button>
                        <div className="w-px h-6 bg-gray-700 mx-2"></div>
                    </>
                )}
                <div className="dropdown dropdown-end">
                    <label tabIndex={0} className="p-2 cursor-pointer text-gray-300 hover:text-amber-400 rounded-full hover:bg-gray-700 transition-colors"><Share2 size={20} /></label>
                    <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-gray-800 border border-gray-700 rounded-box w-52 z-10">
                        <li><a href={`https://twitter.com/intent/tweet?url=${window.location.href}&text=${story.title}`} target="_blank" rel="noopener noreferrer"><Twitter size={16} className="me-2"/> تويتر</a></li>
                        <li><a href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`} target="_blank" rel="noopener noreferrer"><Facebook size={16} className="me-2"/> فيسبوك</a></li>
                        <li><button onClick={() => navigator.clipboard.writeText(window.location.href)}><LinkIcon size={16} className="me-2"/> نسخ الرابط</button></li>
                    </ul>
                </div>
            </div>
        </div>

        {/* Story Content */}
        <article ref={contentRef} className="prose prose-invert prose-lg max-w-none prose-p:my-6 prose-headings:my-8 prose-li:my-2 leading-loose whitespace-pre-wrap">
          {story.content}
        </article>

        {/* Comments Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <h3 className="text-2xl font-bold text-white mb-6">التعليقات ({story.comments.length})</h3>
          
          {/* Add Comment Form */}
          <div className="p-4 mb-8 bg-gray-900 rounded-lg border border-gray-800">
              <form onSubmit={handleCommentSubmit} className="flex gap-4 items-start">
                {currentUser ? <Avatar src={currentUser.avatar} alt={currentUser.name} size="md" /> : <div className="h-12 w-12 rounded-full bg-gray-800 flex items-center justify-center"><User className="text-gray-500"/></div> }
                <div className="flex-1">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder={currentUser ? "أضف تعليقك..." : "الرجاء تسجيل الدخول للتعليق"}
                      className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                      rows={3}
                      disabled={!currentUser}
                    ></textarea>
                    {currentUser &&
                        <button type="submit" disabled={!commentText.trim()} className="mt-2 bg-amber-500 text-gray-900 font-bold px-6 py-2 rounded-lg hover:bg-amber-400 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors">
                          إرسال
                        </button>
                    }
                </div>
              </form>
          </div>

          <div className="space-y-6">
            {story.comments.map(comment => {
              const commentAuthor = getUser(comment.authorId);
              if (!commentAuthor) return null;
              return (
                <div key={comment.id} className="flex gap-4">
                  <ReactRouterDOM.Link to={`/profile/${commentAuthor.id}`}>
                    <Avatar src={commentAuthor.avatar} alt={commentAuthor.name} size="md" />
                  </ReactRouterDOM.Link>
                  <div className="flex-1 bg-gray-900 p-4 rounded-lg border border-gray-800">
                    <div className="flex items-center justify-between mb-1">
                      <ReactRouterDOM.Link to={`/profile/${commentAuthor.id}`} className="font-bold text-amber-400 hover:underline">{commentAuthor.name}</ReactRouterDOM.Link>
                      <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString('ar-EG')}</span>
                    </div>
                    <p className="text-gray-300 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StoryPage;