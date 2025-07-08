

import React, { ReactNode } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser } = useAppContext();

  if (!currentUser) {
    return <ReactRouterDOM.Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;