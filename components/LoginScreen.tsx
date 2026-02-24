"use client";

import { useState } from 'react';
import { Leaf, Mail, Lock, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export const LoginScreen = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setNotice('가입 확인 이메일을 보냈어요. 확인 후 로그인해 주세요.');
    }

    setLoading(false);
  };

  const switchMode = () => {
    setMode(m => m === 'signin' ? 'signup' : 'signin');
    setError(null);
    setNotice(null);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col justify-center px-8">
      <div className="mb-10 text-center">
        <div className="w-16 h-16 bg-brand-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-600/30">
          <Leaf size={28} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Freshpick</h1>
        <p className="text-slate-500 text-sm mt-1">Reduce waste, eat better.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="email"
            placeholder="이메일"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-white rounded-2xl py-4 pl-11 pr-4 text-sm ios-shadow focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="password"
            placeholder="비밀번호"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-white rounded-2xl py-4 pl-11 pr-4 text-sm ios-shadow focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-danger-500 text-sm bg-danger-50 px-4 py-3 rounded-2xl">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        {notice && (
          <div className="text-sm text-brand-600 bg-brand-50 px-4 py-3 rounded-2xl">
            {notice}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-600 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-brand-600/20 active:scale-[0.98] transition-transform disabled:opacity-60"
        >
          {loading ? '처리 중...' : mode === 'signin' ? '로그인' : '회원가입'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-400 mt-6">
        {mode === 'signin' ? '계정이 없으신가요? ' : '이미 계정이 있으신가요? '}
        <button onClick={switchMode} className="text-brand-600 font-semibold">
          {mode === 'signin' ? '회원가입' : '로그인'}
        </button>
      </p>
    </div>
  );
};
