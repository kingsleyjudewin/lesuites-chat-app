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
        <div className="hidden lg:flex w-3/5 flex-col justify-center items-start px-[10%] relative">
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-transparent pointer-events-none" />
          <div className="relative z-10 space-y-8 max-w-2xl">
            <h1 className="font-display-lg text-display-lg text-surface-tint">
              The Private Circle
              <br />
              of Excellence.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md leading-relaxed border-l-[0.5px] border-primary/30 pl-4">
              Exclusive access for verified members. Enter the domain of uncompromised executive privacy and bespoke connection.
            </p>
          </div>
        </div>

        <div className="w-full lg:w-2/5 flex flex-col justify-center items-center px-margin-safe py-panel-padding lg:py-0 min-h-screen lg:min-h-0 relative">
          <div className="glass-panel rounded-xl w-full max-w-md p-panel-padding relative z-10 flex flex-col space-y-8">
            <div className="text-center space-y-4">
              <div className="space-y-1">
                <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface tracking-wide">
                  {mode === 'login' ? 'Welcome Back' : 'Request Access'}
                </h2>
                <p className="font-label-caps text-label-caps text-primary/80 uppercase tracking-widest">Private Executive Network</p>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {mode === 'register' && (
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant/50 group-focus-within:text-primary transition-colors pl-2">
                    badge
                  </span>
                  <input
                    className="glass-input w-full bg-transparent border-0 border-b border-outline-variant/30 text-on-surface font-body-lg text-body-lg py-3 pl-10 pr-4 focus:ring-0 placeholder-on-surface-variant/40"
                    placeholder="Executive Username"
                    required
                    minLength={3}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              )}
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant/50 group-focus-within:text-primary transition-colors pl-2">
                  mail
                </span>
                <input
