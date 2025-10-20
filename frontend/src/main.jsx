import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import App from './App.jsx';
import LoginPage from './LoginPage.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute />, 
    children: [
      { path: '/', element: <App /> } 
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