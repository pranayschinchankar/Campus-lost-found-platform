import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Browse from './pages/Browse';
import PostItem from './pages/PostItem';
import ItemDetail from './pages/ItemDetail';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';

// wrapper to protect routes that need a logged-in user
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  return user ? children : <Navigate to="/login" replace />;
};

// only admins get through this one
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => {
  const { loading } = useAuth();
  if (loading) return <div className="spinner" />;

  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/items/:id" element={<ItemDetail />} />

          <Route path="/post-item" element={
            <PrivateRoute><PostItem /></PrivateRoute>
          } />

          <Route path="/dashboard" element={
            <PrivateRoute><Dashboard /></PrivateRoute>
          } />

          <Route path="/admin" element={
            <AdminRoute><Admin /></AdminRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1e1e30',
              color: '#f0f0f8',
              border: '1px solid #2e2e48',
              fontFamily: "'DM Sans', sans-serif"
            },
            success: { iconTheme: { primary: '#43e97b', secondary: '#0d0d14' } },
            error: { iconTheme: { primary: '#ff6b6b', secondary: '#0d0d14' } }
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
