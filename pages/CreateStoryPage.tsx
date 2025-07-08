

import React, { useState, useEffect, FormEvent } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { motion } from 'framer-motion';
import { Type, BookText, Tag, Image, Save } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { CATEGORIES } from '../constants';
import type { StoryCategory } from '../types';

const CreateStoryPage: React.FC = () => {
  const { storyId } = ReactRouterDOM.useParams<{ storyId?: string }>();
  const navigate = ReactRouterDOM.useNavigate();
  const { createStory, updateStory, getStory, currentUser } = useAppContext();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<StoryCategory>(CATEGORIES[0]);
  const [coverImage, setCoverImage] = useState<string | undefined>(undefined);
  const [error, setError] = useState('');

  const isEditing = Boolean(storyId);

  useEffect(() => {
    if (isEditing) {
      const storyToEdit = getStory(storyId);
      if (storyToEdit && currentUser?.id === storyToEdit.authorId) {
        setTitle(storyToEdit.title);
        setContent(storyToEdit.content);
        setCategory(storyToEdit.category);
        setCoverImage(storyToEdit.coverImage);
      } else {
        // Story not found or user is not the author
        navigate('/');
      }
    }
  }, [isEditing, storyId, getStory, currentUser, navigate]);
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setError("الرجاء اختيار ملف صورة صالح.");
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('العنوان والمحتوى حقول إلزامية.');
      return;
    }
    if (!currentUser) {
        setError('يجب أن تكون مسجلاً للدخول لنشر قصة.');
        return;
    }

    setError('');
    
    if (isEditing && storyId) {
        const storyToEdit = getStory(storyId);
        if(storyToEdit){
            updateStory({
                ...storyToEdit,
                title,
                content,
                category,
                coverImage
            });
            navigate(`/story/${storyId}`);
        }
    } else {
        const newStory = createStory({
          title,
          content,
          category,
          coverImage,
          authorId: currentUser.id,
        });
        navigate(`/story/${newStory.id}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-3xl mx-auto p-8 bg-gray-900 rounded-xl shadow-lg border border-gray-800"
    >
      <h1 className="text-3xl font-bold text-amber-400 mb-6">{isEditing ? 'تعديل القصة' : 'اكتب قصتك الجديدة'}</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-gray-300 mb-2 font-medium">العنوان</label>
          <div className="relative">
            <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg py-3 ps-10 pe-4 text-white focus:outline-none focus:border-amber-500 transition-colors" placeholder="عنوان جذاب لقصتك..." />
            <Type className="absolute top-1/2 -translate-y-1/2 start-3 text-gray-400" size={20} />
          </div>
        </div>
        <div>
          <label htmlFor="content" className="block text-gray-300 mb-2 font-medium">المحتوى</label>
           <div className="relative">
             <textarea id="content" value={content} onChange={e => setContent(e.target.value)} className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg py-3 ps-10 pe-4 text-white focus:outline-none focus:border-amber-500 transition-colors" rows={15} placeholder="اطلق العنان لخيالك..."></textarea>
             <BookText className="absolute top-4 start-3 text-gray-400" size={20} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-gray-300 mb-2 font-medium">التصنيف</label>
              <div className="relative">
                <select id="category" value={category} onChange={e => setCategory(e.target.value as StoryCategory)} className="appearance-none w-full bg-gray-800 border-2 border-gray-700 rounded-lg py-3 ps-10 pe-4 text-white focus:outline-none focus:border-amber-500 transition-colors">
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <Tag className="absolute top-1/2 -translate-y-1/2 start-3 text-gray-400" size={20} />
              </div>
            </div>
            <div>
              <label htmlFor="coverImage" className="block text-gray-300 mb-2 font-medium">صورة الغلاف (اختياري)</label>
               <div className="relative flex items-center justify-center w-full">
                <label htmlFor="coverImage" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Image className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">انقر للرفع</span> أو اسحب الصورة</p>
                        <p className="text-xs text-gray-500">SVG, PNG, JPG (بحد أقصى 2MB)</p>
                    </div>
                    <input id="coverImage" type="file" onChange={handleImageUpload} accept="image/*" className="hidden" />
                </label>
              </div> 
              {coverImage && <img src={coverImage} alt="Cover preview" className="mt-4 rounded-lg h-24 w-auto object-cover" />}
            </div>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex justify-end pt-4 border-t border-gray-800">
          <button type="submit" className="flex items-center gap-2 bg-amber-500 text-gray-900 font-bold px-6 py-3 rounded-lg hover:bg-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-500/50 transition-colors">
            <Save size={20} />
            <span>{isEditing ? 'حفظ التعديلات' : 'نشر القصة'}</span>
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default CreateStoryPage;