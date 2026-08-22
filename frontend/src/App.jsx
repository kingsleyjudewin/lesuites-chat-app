import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { MessagingPage } from './pages/MessagingPage';
import { BoardroomPage } from './pages/BoardroomPage';
import { MemberActivityPage } from './pages/MemberActivityPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/messages" element={<MessagingPage />} />
              <Route path="/boardrooms" element={<BoardroomPage />} />
              <Route path="/members" element={<MemberActivityPage />} />
            </Route>
