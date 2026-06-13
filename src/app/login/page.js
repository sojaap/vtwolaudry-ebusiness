'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { login } from '@/db/mockDb';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const user = login(username, password, 'customer');
    if (user) {
      router.push('/history');
      router.refresh();
    } else {
      setErrorMsg('Invalid customer username or password. Please try again.');
    }
  };

  const handleQuickFill = (uname) => {
    setUsername(uname);
    setPassword('123');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#ECF9FF] font-sans">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-10 px-4">
        {/* Proper White Card with soft sky blue borders/shadows */}
        <div className="bg-white rounded-3xl p-10 max-w-lg w-full border-2 border-slate-200 shadow-xl space-y-6 my-8">
          <div className="text-center">
            {/* Logo V2 bubble */}
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-sky-400 to-sky-200 text-white font-bold mb-4 shadow-md shadow-sky-200 text-lg">
              V2
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Customer Login</h1>
            <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">
              Sign in to access your order history and track receipts.
            </p>
          </div>

          {errorMsg && (
            <div className="bg-rose-50 border-2 border-rose-200 text-rose-600 text-xs font-bold p-3.5 rounded-xl text-center shadow-sm">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* Username Field with Mail Icon */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus:outline-none text-sm font-bold text-slate-800 placeholder:text-slate-400 bg-white shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Password Field with Key Icon & Show/Hide Password Eye Button */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 rounded-2xl border-2 border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus:outline-none text-sm font-bold text-slate-800 placeholder:text-slate-400 bg-white shadow-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-450 hover:text-slate-700"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Blue Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-2xl shadow-md shadow-sky-100 hover:shadow-lg transition-all text-sm tracking-wide"
            >
              Sign In
            </button>
          </form>

          {/* Quick Fills */}
          <div className="border-t border-slate-100 pt-6 space-y-3">
            <span className="block text-[10px] font-bold text-slate-400 uppercase text-center tracking-widest">
              Demo Customer Account (Quick Fill)
            </span>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => handleQuickFill('budi')}
                className="px-4 py-2 border-2 border-slate-200 hover:bg-sky-50 hover:text-sky-600 rounded-xl text-xs font-bold text-slate-600 transition-all shadow-sm"
              >
                Budi (budi)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('siti')}
                className="px-4 py-2 border-2 border-slate-200 hover:bg-sky-50 hover:text-sky-600 rounded-xl text-xs font-bold text-slate-600 transition-all shadow-sm"
              >
                Siti (siti)
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500 pt-2">
            Don't have an account?{' '}
            <Link href="/register" className="text-sky-500 font-bold hover:underline">
              Sign Up
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
