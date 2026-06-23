'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/db/supabaseClient';
import { getDb } from '@/db/mockDb';
import Link from 'next/link';

export default function OrderHistoryPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [db, setDb] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessionAndOrders = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          router.push('/login');
          return;
        }

        const activeUser = {
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email.split('@')[0],
          role: 'customer'
        };
        setCurrentUser(activeUser);

        const database = getDb();
        setDb(database);

        const { data: transactionData, error: dbError } = await supabase
          .from('trx_laundry')
          .select('*')
          .eq('id_pelanggan', session.user.id)
          .order('tgl_transaksi', { ascending: false });

        if (!dbError && transactionData) {
          setOrders(transactionData);
        } else {
          const customerOrders = database.trxLaundry
            .filter((t) => t.idPelanggan === activeUser.id || t.idPelanggan === 'budi')
            .sort((a, b) => new Date(b.tgl_transaksi) - new Date(a.tgl_transaksi));
          setOrders(customerOrders);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionAndOrders();
  }, []);

  if (loading || !db) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#ECF9FF] font-sans">
      <Navbar />

      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-8 mb-24">
        {/* Header section */}
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-sky-600 block mb-1">
            CUSTOMER PORTAL
          </span>
          <h1 className="text-3xl font-extrabold text-slate-800">Your Order History</h1>
          <p className="text-slate-500 text-sm mt-1">
            View all your past and ongoing transactions, check laundry statuses, and print receipts.
          </p>
        </div>

        {/* Transactions Table Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-slate-200 shadow-xl space-y-6">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">
            Transaction Summary Ledger
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 text-slate-400 text-xs font-bold uppercase">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Receipt</th>
                  <th className="py-3.5 px-4">Branch Store</th>
                  <th className="py-3.5 px-4">Grand Total</th>
                  <th className="py-3.5 px-4">Sisa (Outstanding)</th>
                  <th className="py-3.5 px-4">Laundry Status</th>
                  <th className="py-3.5 px-4">Logistics Method</th>
                  <th className="py-3.5 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-400 text-sm">
                      You haven't placed any laundry orders yet.{' '}
                      <Link href="/order" className="text-sky-500 font-bold hover:underline">
                        Order now
                      </Link>
                    </td>
                  </tr>
                ) : (
                  orders.map((trx) => {
                    const branch = db.toko.find((t) => t.idToko === trx.idToko);
                    return (
                      <tr key={trx.no_struk} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-4 text-xs">
                          {new Date(trx.tgl_transaksi).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 font-mono font-bold text-sky-600">
                          {trx.no_struk}
                        </td>
                        <td className="py-4 px-4 text-xs font-normal text-slate-500">
                          {branch ? branch.nama_toko : ''}
                        </td>
                        <td className="py-4 px-4 text-xs">
                          IDR {trx.grand_total.toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-xs">
                          <span className={trx.sisa > 0 ? 'text-rose-500 font-extrabold' : 'text-slate-400'}>
                            IDR {trx.sisa.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${trx.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-sky-100 text-sky-800'
                            }`}>
                            {trx.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs font-normal text-slate-500">
                          {trx.delivery_type}
                          {trx.delivery_type === 'Home Delivery' && (
                            <span className="block text-[10px] font-bold text-sky-500">
                              ({trx.delivery_status})
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <Link
                            href={`/track?struk=${trx.no_struk}`}
                            className="px-3.5 py-1.5 bg-sky-50 hover:bg-sky-500 hover:text-white border border-sky-100 rounded-xl text-xs text-sky-600 font-bold transition-all shadow-sm"
                          >
                            Track Live
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
