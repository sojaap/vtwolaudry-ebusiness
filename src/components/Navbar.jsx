'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/db/supabaseClient';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const assignedRole = session.user.email === 'admin@vtwolaundry.com' ? 'admin' : 'customer';

        setCurrentUser({
          name: session.user.user_metadata?.name || session.user.email.split('@')[0],
          role: assignedRole
        });
      } else {
        setCurrentUser(null);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const assignedRole = session.user.email === 'admin@vtwolaundry.com' ? 'admin' : 'customer';

        setCurrentUser({
          name: session.user.user_metadata?.name || session.user.email.split('@')[0],
          role: assignedRole
        });
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);

    if (pathname.startsWith('/admin')) {
      router.push('/admin-login');
    } else {
      router.push('/');
    }
  };

  const getActiveStyles = (path) => {
    return pathname === path
      ? 'border-sky-500 text-sky-600 font-semibold'
      : 'border-transparent text-slate-700 hover:text-sky-600 hover:border-sky-350 font-medium';
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">

          {/* Logo & Navigation Menu Links */}
          <div className="flex items-center gap-10">
            {/* Logo V2 bubble */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-sky-400 to-sky-200 text-white font-bold shadow-md shadow-sky-200 group-hover:scale-105 transition-all duration-300">
                <span className="text-lg">V2</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800 group-hover:text-sky-600 transition-colors">
                VTwo <span className="text-sky-500">Laundry</span>
              </span>
            </Link>

            {/* Navigation links matching Photo 3 layout */}
            <div className="hidden md:flex items-stretch h-full space-x-8">
              <Link
                href="/"
                className={`inline-flex items-center px-1 border-b-2 text-sm transition-all ${getActiveStyles('/')}`}
              >
                Home
              </Link>
              
               <Link
                href="/about"
                className={`inline-flex items-center px-1 border-b-2 text-sm transition-all ${getActiveStyles('/about')}`}
              >
                About Us
              </Link>
              <Link
                href="/#how-it-works"
                className={`inline-flex items-center px-1 border-b-2 text-sm transition-all ${getActiveStyles('/#how-it-works')}`}
              >
                How it works
              </Link>
              <Link
                href="/services"
                className={`inline-flex items-center px-1 border-b-2 text-sm transition-all ${getActiveStyles('/services')}`}
              >
                Services
              </Link>

              {/* Calculator is open to everyone */}
              <Link
                href="/order"
                className={`inline-flex items-center px-1 border-b-2 text-sm transition-all ${getActiveStyles('/order')}`}
              >
                Order Calculator
              </Link>

              {/* Order History is only visible to logged-in customers */}
              {currentUser && currentUser.role === 'customer' && (
                <Link
                  href="/history"
                  className={`inline-flex items-center px-1 border-b-2 text-sm transition-all ${getActiveStyles('/history')}`}
                >
                  Order History
                </Link>
              )}

              <Link
                href="/track"
                className={`inline-flex items-center px-1 border-b-2 text-sm transition-all ${getActiveStyles('/track')}`}
              >
                Track Order
              </Link>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-3">

            {currentUser ? (
              // Logged In Profile Widget & Logout
              <div className="flex items-center gap-3.5">
                <div className="flex flex-col items-end text-xs shrink-0">
                  <span className="font-semibold text-slate-800">{currentUser.name}</span>
                  <span className="px-2 py-0.5 mt-0.5 rounded-full text-[9px] font-bold bg-sky-50 text-sky-600 border border-sky-100 uppercase tracking-wide">
                    {currentUser.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 hover:text-slate-800 text-slate-500 rounded-xl text-xs font-semibold transition-all shadow-sm"
                >
                  Log Out
                </button>
              </div>
            ) : (
              // Guest Action links
              <div className="flex items-center gap-3">
                <Link
                  href="/admin-login"
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors mr-2"
                >
                  Staff Portal
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 border-2 border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-semibold transition-all shadow-sm"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-semibold shadow-md shadow-sky-100 hover:shadow-lg transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
}
