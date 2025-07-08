

import React, { useState, FormEvent } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const LoginPage: React.FC = () => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { login } = useAppContext();
  const navigate = ReactRouterDOM.useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('الرجاء إدخال اسم.');
      return;
    }
    setError('');
    login(name);
    navigate('/');
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md p-1 bg-gradient-to-br from-amber-500/50 via-gray-800 to-gray-800 rounded-xl"
      >
        <div className="w-full bg-gray-900 rounded-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-amber-400">أهلاً بك في حكايات</h1>
              <p className="text-gray-400 mt-2">أدخل اسمك للمتابعة أو لإنشاء حساب جديد.</p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-300 mb-2 font-medium">الاسم</label>
                <div className="relative">
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg py-3 ps-10 pe-4 text-white focus:outline-none focus:border-amber-500 transition-colors"
                      placeholder="مثال: شهريار"
                      required
                    />
                    <User className="absolute top-1/2 -translate-y-1/2 start-3 text-gray-400" size={20} />
                </div>

                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
              </div>
              <button
                type="submit"
                className="w-full bg-amber-500 text-gray-900 font-bold py-3 rounded-lg hover:bg-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-500/50 transition-all duration-300"
              >
                دخول
              </button>
            </form>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;