import React, { useState } from 'react';
import { supabase } from '../services/supabaseService';
// Fix: Import Loader2 from lucide-react
import { Box, User, Mail, Lock, LogIn, UserPlus, Loader2 } from 'lucide-react';

export const Auth: React.FC = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = isSignIn
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({
        type: 'success',
        text: isSignIn
          ? 'Signed in successfully!'
          : 'Signed up successfully! Please check your email for a confirmation link.',
      });
      // Clear form only on successful sign up, for sign in we wait for redirect
      if (!isSignIn) {
          setEmail('');
          setPassword('');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-slate-900 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Box size={24} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Nexus</h1>
          </div>
          <p className="text-slate-500">
            {isSignIn ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              <Mail size={14} className="inline-block mr-1 text-slate-400" />Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              <Lock size={14} className="inline-block mr-1 text-slate-400" />Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="••••••••"
              autoComplete={isSignIn ? "current-password" : "new-password"}
            />
          </div>

          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                message.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}
              role="alert"
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors shadow-md shadow-blue-200 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : isSignIn ? (
              <>
                <LogIn size={20} /> Sign In
              </>
            ) : (
              <>
                <UserPlus size={20} /> Sign Up
              </>
            )}
          </button>
        </form>

        <div className="text-center text-sm">
          {isSignIn ? (
            <p className="text-slate-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                    setIsSignIn(false);
                    setMessage(null);
                    setEmail('');
                    setPassword('');
                }}
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p className="text-slate-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                    setIsSignIn(true);
                    setMessage(null);
                    setEmail('');
                    setPassword('');
                }}
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};