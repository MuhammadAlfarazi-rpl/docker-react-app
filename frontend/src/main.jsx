import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import App from './App.jsx';
import LoginPage from './LoginPage.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import ProfilePage from './ProfilePage.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute />, 
    children: [
      { path: '/', element: <App /> },
      { path: '/profile', element: <ProfilePage /> }
    ]
  },
  {
    path: '/login',
    element: <LoginPage />
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} /> 
    </AuthProvider>
  </React.StrictMode>,
)