import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Footprints,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Globe,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Store,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, language, setLanguage, t, businessInfo } = useApp();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await login(username, password);
    setLoading(false);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 bg-slate-900 overflow-hidden select-none">
      {/* Background Graphic Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25 scale-105 filter blur-sm transition-transform duration-1000"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1600&q=80")',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-rose-950/40" />

      {/* Floating Fashion Glow Decor */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Language Switcher Top Bar */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-slate-800/80 backdrop-blur-md border border-slate-700/60 p-1.5 rounded-2xl">
        <Globe className="w-4 h-4 text-rose-400 ml-1" />
        <button
          onClick={() => setLanguage('si')}
          className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
            language === 'si' ? 'bg-rose-600 text-white shadow' : 'text-slate-300 hover:text-white'
          }`}
        >
          සිංහල
        </button>
        <button
          onClick={() => setLanguage('en')}
          className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
            language === 'en' ? 'bg-rose-600 text-white shadow' : 'text-slate-300 hover:text-white'
          }`}
        >
          English
        </button>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80">
        {/* Logo Area */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 text-white shadow-xl shadow-rose-600/30 mb-3 transform hover:scale-105 transition-transform duration-300">
            <Footprints className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">
            {businessInfo.name}
          </h1>
          <p className="text-xs text-rose-400 font-semibold tracking-wide mt-1">
            {t('loginSubtitle')}
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/50 text-[11px] text-slate-300">
            <Store className="w-3.5 h-3.5 text-rose-400" />
            <span>{businessInfo.branch} • Buttala, Sri Lanka</span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              {t('username')}
            </label>
            <div className="relative">
              <UserIcon className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              {t('password')}
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Remember Me & Role Badge */}
          <div className="flex items-center justify-between text-xs text-slate-300">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-rose-600 focus:ring-rose-500"
              />
              <span>{t('rememberMe')}</span>
            </label>

            <span className="flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Access
            </span>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-sm shadow-lg shadow-rose-600/30 transition-all duration-200 transform active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{t('loginBtn')}</span>
                <Sparkles className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Notice */}
        <div className="mt-6 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-center text-xs text-slate-400">
          <p>{t('demoNotice')}</p>
        </div>

        {/* Category Pills Decor */}
        <div className="mt-5 flex flex-wrap justify-center gap-1.5 text-[10px] text-slate-400 font-medium">
          <span className="px-2 py-0.5 bg-slate-800/80 rounded-md border border-slate-700/40">Shoes</span>
          <span className="px-2 py-0.5 bg-slate-800/80 rounded-md border border-slate-700/40">Bags</span>
          <span className="px-2 py-0.5 bg-slate-800/80 rounded-md border border-slate-700/40">Umbrellas</span>
          <span className="px-2 py-0.5 bg-slate-800/80 rounded-md border border-slate-700/40">Hats</span>
          <span className="px-2 py-0.5 bg-slate-800/80 rounded-md border border-slate-700/40">Perfumes</span>
          <span className="px-2 py-0.5 bg-slate-800/80 rounded-md border border-slate-700/40">Accessories</span>
        </div>
      </div>
    </div>
  );
};
