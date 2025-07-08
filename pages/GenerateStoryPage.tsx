

import React, { useState, FormEvent } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Save, BrainCircuit, Type, BookText, Tag } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { generateStory } from '../services/geminiService';
import { CATEGORIES } from '../constants';
import type { StoryCategory } from '../types';
import Spinner from '../components/Spinner';

const LoadingOverlay: React.FC = () => (
    <div className="absolute inset-0 bg-gray-800/80 backdrop-blur-sm flex flex-col justify-center items-center z-20 rounded-xl">
        <Spinner />
        <p className="text-amber-400 text-lg mt-4 font-semibold">جاري كتابة قصتك، لحظات من فضلك...</p>
    </div>
);

const GenerateStoryPage: React.FC = () => {
  const navigate = ReactRouterDOM.useNavigate();
  const { createStory, currentUser } = useAppContext();
  
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedStory, setGeneratedStory] = useState<{ title: string; content: string; category: StoryCategory } | null>(null);

  const handleGeneration = async () => {
    if (!prompt.trim()) {
      setError('الرجاء إدخال فكرة للقصة.');
      return;
    }
    setError('');
    setIsLoading(true);
    setGeneratedStory(null);
    try {
      const result = await generateStory(prompt);
      if (result) {
        setGeneratedStory(result);
      }
    } catch (e: any) {
      setError(e.message || 'حدث خطأ غير متوقع.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = (e: FormEvent) => {
    e.preventDefault();
    if (!generatedStory || !currentUser) return;
    
    const newStory = createStory({
        ...generatedStory,
        authorId: currentUser.id
    });
    navigate(`/story/${newStory.id}`);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto"
    >
      <div className="relative p-8 bg-gray-900 rounded-xl shadow-lg border border-gray-800 mb-8">
        <AnimatePresence>
            {isLoading && <LoadingOverlay />}
        </AnimatePresence>
        <h1 className="text-3xl font-bold text-amber-400 mb-2 flex items-center gap-3"><BrainCircuit size={32} /> توليد قصة بالذكاء الاصطناعي</h1>
        <p className="text-gray-400 mb-6">أدخل فكرة بسيطة، ودع السحر يبدأ. سيقوم الذكاء الاصطناعي بكتابة قصة فريدة من أجلك.</p>
        
        <div className="space-y-4">
            <div>
              <label htmlFor="prompt" className="block text-gray-300 mb-2 font-medium">فكرتك</label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="مثال: قطة فضائية تائهة على كوكب المريخ تبحث عن طريق العودة إلى مجرتها..."
                className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-amber-500 transition-colors"
                rows={3}
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
                onClick={handleGeneration}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-amber-500 text-gray-900 font-bold px-6 py-3 rounded-lg hover:bg-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-500/50 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                <Sparkles size={20} />
                <span>ولّد القصة</span>
            </button>
        </div>
      </div>

      <AnimatePresence>
        {generatedStory && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-8 bg-gray-900 rounded-xl shadow-lg border border-gray-800"
            >
              <h2 className="text-2xl font-bold text-white mb-6">مراجعة ونشر</h2>
              <form onSubmit={handlePublish} className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-gray-300 mb-2 font-medium">العنوان</label>
                  <div className="relative">
                    <input id="title" type="text" value={generatedStory.title} onChange={e => setGeneratedStory({...generatedStory, title: e.target.value})} className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg py-3 ps-10 pe-4 text-white focus:outline-none focus:border-amber-500" />
                    <Type className="absolute top-1/2 -translate-y-1/2 start-3 text-gray-400" size={20} />
                  </div>
                </div>
                <div>
                  <label htmlFor="content" className="block text-gray-300 mb-2 font-medium">المحتوى</label>
                   <div className="relative">
                     <textarea id="content" value={generatedStory.content} onChange={e => setGeneratedStory({...generatedStory, content: e.target.value})} className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg py-3 ps-10 pe-4 text-white focus:outline-none focus:border-amber-500" rows={15}></textarea>
                     <BookText className="absolute top-4 start-3 text-gray-400" size={20} />
                  </div>
                </div>
                <div>
                  <label htmlFor="category" className="block text-gray-300 mb-2 font-medium">التصنيف</label>
                  <div className="relative">
                    <select id="category" value={generatedStory.category} onChange={e => setGeneratedStory({...generatedStory, category: e.target.value as StoryCategory})} className="appearance-none w-full bg-gray-800 border-2 border-gray-700 rounded-lg py-3 ps-10 pe-4 text-white focus:outline-none focus:border-amber-500">
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <Tag className="absolute top-1/2 -translate-y-1/2 start-3 text-gray-400" size={20} />
                  </div>
                </div>
                <div className="flex justify-end pt-4 border-t border-gray-800">
                  <button type="submit" className="flex items-center gap-2 bg-green-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/50 transition-colors">
                    <Save size={20} />
                    <span>نشر القصة</span>
                  </button>
                </div>
              </form>
            </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GenerateStoryPage;