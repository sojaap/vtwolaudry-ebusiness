'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/db/supabaseClient';

export default function FinancialReports() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [db, setDb] = useState(null);

  // Filters
  const [dateFilter, setDateFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  // Active filtered transactions
  const [filteredTrx, setFilteredTrx] = useState([]);

  // Summary Aggregates
  const [summary, setSummary] = useState({
    count: 0,
    revenue: 0,
    dpCollected: 0,
    outstanding: 0,
  });

  // 1. Sinkronisasi Sesi Terpusat dengan Peran Tunggal Admin
  useEffect(() => {
    async function syncReportSession() {
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

        // Eksekusi pengambilan data cloud setelah sesi terbukti valid
        loadCloudReports();

      } catch (err) {
        console.error("Gagal sinkronisasi sesi halaman laporan:", err);
        router.push('/admin-login');
      }
    }

    syncReportSession();
  }, [dateFilter, branchFilter, paymentFilter]);

  // 2. Tarik dan Normalisasi Data Langsung dari Cloud Supabase
  const loadCloudReports = async () => {
    try {
      // Ambil data master secara paralel dari database cloud
      const { data: cloudTrx } = await supabase.from('transaksi').select('*');
      const { data: cloudToko } = await supabase.from('toko').select('*');
      const { data: cloudPelanggan } = await supabase.from('pelanggan').select('*');

      // Siapkan fallback object terstruktur agar render UI tidak crash jika tabel kosong
      const structuredDb = {
        toko: cloudToko || [{ idToko: 'TKO001', nama_toko: 'VTwo Laundry Pusat' }],
        pelanggan: cloudPelanggan || [],
        trxLaundry: cloudTrx || []
      };

      setDb(structuredDb);

      let transactions = [...structuredDb.trxLaundry];

      // Filter Waktu (Date Range)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dateFilter === 'today') {
        transactions = transactions.filter((t) => {
          const tDate = new Date(t.tgl_transaksi || t.created_at);
          return tDate >= today;
        });
      } else if (dateFilter === 'week') {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        transactions = transactions.filter((t) => {
          const tDate = new Date(t.tgl_transaksi || t.created_at);
          return tDate >= oneWeekAgo;
        });
      } else if (dateFilter === 'month') {
        const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        transactions = transactions.filter((t) => {
          const tDate = new Date(t.tgl_transaksi || t.created_at);
          return tDate >= oneMonthAgo;
        });
      }

      // Filter Toko/Cabang
      if (branchFilter !== 'all') {
        transactions = transactions.filter((t) => t.idToko === branchFilter || t.id_toko === branchFilter);
      }

      // Filter Status Pembayaran
      if (paymentFilter === 'paid') {
        transactions = transactions.filter((t) => Number(t.sisa) === 0);
      } else if (paymentFilter === 'outstanding') {
        transactions = transactions.filter((t) => Number(t.sisa) > 0);
      }

      setFilteredTrx(transactions);

      // Kalkulasi Agregasi Finansial Ledger
      let totalRevenue = 0;
      let totalDp = 0;
      let totalOutstanding = 0;

      transactions.forEach((t) => {
        totalRevenue += Number(t.grand_total || 0);
        totalDp += Number(t.dp || 0);
        totalOutstanding += Number(t.sisa || 0);
      });

      setSummary({
        count: transactions.length,
        revenue: totalRevenue,
        dpCollected: totalDp,
        outstanding: totalOutstanding,
      });

    } catch (error) {
      console.error("Gagal kalkulasi data laporan keuangan:", error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!db || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 print:bg-white print:text-black">

      {/* Reports Header */}
      <div className="flex justify-between items-center border-b border-slate-700 pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-sky-400 block mb-1 print:hidden">
            REKAPITULASI TRANSAKSI
          </span>
          <h1 className="text-3xl font-extrabold text-white print:text-black">Financial Transaction Report</h1>
          <p className="text-slate-400 text-sm mt-1 print:hidden">
            Filter transaction logs, calculate balances, and export financial summaries.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-2xl text-sm shadow-md shadow-sky-500/10 transition-all flex items-center gap-2 print:hidden"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Report
        </button>
      </div>

      {/* Filters Card */}
      <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700/80 shadow-md grid grid-cols-1 sm:grid-cols-3 gap-6 print:hidden">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Time Period</label>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-600 bg-slate-900 text-slate-100 font-extrabold focus:border-sky-400 focus:outline-none"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Store Branch</label>
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-600 bg-slate-900 text-slate-100 font-extrabold focus:border-sky-400 focus:outline-none"
          >
            <option value="all">All Branches</option>
            {db.toko.map((t) => {
              const branchId = t.id_toko || t.idToko;
              return (
                <option key={branchId} value={branchId}>
                  {t.nama_toko}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Payment Status</label>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-600 bg-slate-900 text-slate-100 font-extrabold focus:border-sky-400 focus:outline-none"
          >
            <option value="all">All Payments</option>
            <option value="paid">Fully Paid</option>
            <option value="outstanding">Has Outstanding Balance</option>
          </select>
        </div>
      </div>

      {/* Aggregated Summaries Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700/80 shadow-md print:border-slate-300 print:bg-white">
          <span className="text-xs font-bold text-slate-400 block mb-1">Orders Count</span>
          <span className="text-3xl font-black text-white print:text-black">{summary.count} Orders</span>
        </div>

        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700/80 shadow-md print:border-slate-300 print:bg-white">
          <span className="text-xs font-bold text-slate-400 block mb-1">Revenue Total</span>
          <span className="text-3xl font-black text-sky-400 print:text-sky-600">IDR {summary.revenue.toLocaleString()}</span>
        </div>

        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700/80 shadow-md print:border-slate-300 print:bg-white">
          <span className="text-xs font-bold text-slate-400 block mb-1">Down Payments (DP)</span>
          <span className="text-3xl font-black text-emerald-400 print:text-emerald-600">IDR {summary.dpCollected.toLocaleString()}</span>
        </div>

        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700/80 shadow-md print:border-slate-300 print:bg-white">
          <span className="text-xs font-bold text-slate-400 block mb-1">Remaining Sisa</span>
          <span className="text-3xl font-black text-rose-400 print:text-rose-600">IDR {summary.outstanding.toLocaleString()}</span>
        </div>
      </div>

      {/* Detailed Transactions Table */}
      <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700/80 shadow-md print:border-slate-300 print:bg-white">
        <h3 className="text-base font-extrabold text-white border-b border-slate-700 pb-3 mb-4 print:text-black print:border-slate-200">
          Transaction Details Ledger
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 font-bold uppercase print:border-slate-200 print:text-slate-500">
                <th className="py-3 px-2">Date</th>
                <th className="py-3 px-2">Receipt</th>
                <th className="py-3 px-2">Store Branch</th>
                <th className="py-3 px-2">Customer</th>
                <th className="py-3 px-2">Total Amount</th>
                <th className="py-3 px-2">DP Paid</th>
                <th className="py-3 px-2">Sisa</th>
                <th className="py-3 px-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700 font-medium text-slate-300 print:text-slate-800 print:divide-slate-200">
              {filteredTrx.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400 font-semibold text-sm">
                    No matching records found.
                  </td>
                </tr>
              ) : (
                filteredTrx.map((trx) => {
                  const trxBranchId = trx.idToko || trx.id_toko;
                  const trxCustomerId = trx.idPelanggan || trx.id_pelanggan;

                  const shop = db.toko.find((t) => (t.id_toko || t.idToko) === trxBranchId);
                  const customer = db.pelanggan.find((p) => (p.id_pelanggan || p.idPelanggan) === trxCustomerId);
                  const dateString = trx.tgl_transaksi || trx.created_at;

                  return (
                    <tr key={trx.no_struk || trx.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="py-3 px-2">{dateString ? new Date(dateString).toLocaleDateString() : '-'}</td>
                      <td className="py-3 px-2 font-mono font-bold text-sky-400">{trx.no_struk || 'N/A'}</td>
                      <td className="py-3 px-2 text-slate-400 print:text-slate-500">{shop ? shop.nama_toko : 'Pusat'}</td>
                      <td className="py-3 px-2 font-bold text-white print:text-black">{customer ? customer.nama_pelanggan : 'Umum'}</td>
                      <td className="py-3 px-2 font-bold">IDR {Number(trx.grand_total || 0).toLocaleString()}</td>
                      <td className="py-3 px-2 text-emerald-400 print:text-emerald-600">IDR {Number(trx.dp || 0).toLocaleString()}</td>
                      <td className="py-3 px-2">
                        <span className={Number(trx.sisa || 0) > 0 ? 'text-rose-400 font-bold print:text-rose-600' : 'text-slate-500'}>
                          IDR {Number(trx.sisa || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${trx.status === 'Completed'
                          ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800 print:bg-emerald-100 print:text-emerald-800'
                          : 'bg-sky-950/50 text-sky-300 border border-sky-800 print:bg-sky-100 print:text-sky-800'
                          }`}>
                          {trx.status || 'Pickup'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}