'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/db/supabaseClient';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    async function syncAdminLayoutSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user || session.user.email !== 'admin@vtwolaundry.com') {
          router.push('/admin-login');
          return;
        }

        setCurrentUser({
          id: session.user.id,
          name: 'ADMIN VTWO',
          role: 'admin'
        });

      } catch (err) {
        console.error("Gagal sinkronisasi sesi layout admin:", err);
        router.push('/admin-login');
      }
    }

    syncAdminLayoutSession();
  }, [pathname, router]);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-400"></div>
      </div>
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin-login');
  };

  const getMenuItemClass = (path) => {
    const isActive = pathname === path;
    return `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${isActive
      ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`;
  };

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Left Sidebar */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between p-6 shrink-0">
        <div className="space-y-8">

          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-sky-400 to-sky-200 text-white font-bold shadow-md shadow-sky-200 group-hover:scale-105 transition-all duration-300">
              <span className="text-lg">V2</span>
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-white block">VTwo Laundry</span>
              <span className="text-[9px] font-bold text-sky-400 block uppercase tracking-wider">
                {currentUser.role} Mode
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="space-y-6">
            <div>
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-3">
                Main Menu
              </span>
              <nav className="space-y-1.5">
                {/* 3. Semua Menu Terbuka Khusus untuk Role 'admin' */}
                {currentUser.role === 'admin' && (
                  <>
                    <Link href="/admin" className={getMenuItemClass('/admin')}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
                      </svg>
                      Dashboard
                    </Link>

                    <Link href="/admin/transactions" className={getMenuItemClass('/admin/transactions')}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      Input Order
                    </Link>

                    <Link href="/admin/reports" className={getMenuItemClass('/admin/reports')}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Financial Reports
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="space-y-4">
          {/* User Info Card */}
          <div className="bg-slate-900 border border-slate-800/80 p-4 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center font-bold text-sky-400 uppercase text-sm">
              A
            </div>
            <div className="min-w-0">
              <span className="block text-xs font-bold text-white truncate">{currentUser.name}</span>
              <span className="block text-[10px] text-slate-500 tracking-wide font-medium">System Administrator</span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Keluar Akun
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col min-h-screen overflow-x-hidden print:bg-white print:text-black">
        <div className="flex-grow p-8 md:p-12 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}