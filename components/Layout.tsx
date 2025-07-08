
import React, { ReactNode } from 'react';
import Header from './Header';

const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
