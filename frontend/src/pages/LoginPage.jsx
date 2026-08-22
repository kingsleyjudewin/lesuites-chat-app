import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShaderBackground } from '../components/ShaderBackground';
import { ApiError } from '../lib/api';

export function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(username, email, password);
      }
      navigate('/', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        const detailMsg = err.details && Object.values(err.details).flat()[0];
        setError(detailMsg || err.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="text-on-background min-h-screen flex flex-col relative overflow-hidden">
      <ShaderBackground />

      <main className="flex-grow flex flex-col lg:flex-row w-full max-w-[1920px] mx-auto z-10">
