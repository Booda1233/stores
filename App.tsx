

import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AppProvider } from './context/AppContext';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import StoryPage from './pages/StoryPage';
import CreateStoryPage from './pages/CreateStoryPage';
import GenerateStoryPage from './pages/GenerateStoryPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';

const App: React.FC = () => {
  return (
    <AppProvider>
      <ReactRouterDOM.HashRouter>
        <Layout>
          <AnimatePresence mode="wait">
            <ReactRouterDOM.Routes>
              <ReactRouterDOM.Route path="/" element={<HomePage />} />
              <ReactRouterDOM.Route path="/story/:storyId" element={<StoryPage />} />
              <ReactRouterDOM.Route path="/profile/:userId" element={<ProfilePage />} />
              <ReactRouterDOM.Route path="/login" element={<LoginPage />} />
              <ReactRouterDOM.Route 
                path="/create" 
                element={
                  <ProtectedRoute>
                    <CreateStoryPage />
                  </ProtectedRoute>
                } 
              />
              <ReactRouterDOM.Route 
                path="/edit/:storyId" 
                element={
                  <ProtectedRoute>
                    <CreateStoryPage />
                  </ProtectedRoute>
                } 
              />
              <ReactRouterDOM.Route 
                path="/generate" 
                element={
                  <ProtectedRoute>
                    <GenerateStoryPage />
                  </ProtectedRoute>
                } 
              />
            </ReactRouterDOM.Routes>
          </AnimatePresence>
        </Layout>
      </ReactRouterDOM.HashRouter>
    </AppProvider>
  );
};

export default App;