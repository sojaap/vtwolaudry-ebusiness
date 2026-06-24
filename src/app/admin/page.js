'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/db/supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [db, setDb] = useState(null);

  // Dashboard metrics
  const [revenue, setRevenue] = useState(0);
  const [sisaTotal, setSisaTotal] = useState(0);
  const [dpTotal, setDpTotal] = useState(0);
  const [activeOrders, setActiveOrders] = useState([]);

  // State Grafis Dinamis
  const [graphData, setGraphData] = useState([]);

  useEffect(() => {
    async function syncDashboardSession() {
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

        loadCloudData();

      } catch (err) {
        console.error("Gagal verifikasi sesi dashboard:", err);
        router.push('/admin-login');
      }
    }

    syncDashboardSession();
  }, []);

  const loadCloudData = async () => {
    try {
      const { data: cloudTrx, error: trxError } = await supabase.from('trx_laundry').select('*');
      const { data: cloudPelanggan } = await supabase.from('pelanggan').select('*');
      const { data: cloudParfum } = await supabase.from('parfum').select('*');

      if (trxError) {
        console.error("❌ PESAN ERROR DATABASE:", trxError.message);
      }

      const normalizedTrx = (cloudTrx || []).map(t => {
        const grandTotalValue = Number(t.grand_total || 0);
        const dpValue = Number(t.dp || 0);
        const sisaValue = Number(t.sisa || 0);

        return {
          id: t.no_struk,
          no_struk: t.no_struk || 'N/A',
          grand_total: grandTotalValue,
          dp: dpValue,
          sisa: sisaValue,
          status: t.status || 'Pickup',
          delivery_type: t.delivery_type || 'Self Pickup',
          delivery_status: t.delivery_status || 'Not Started',
          id_pelanggan: t.id_pelanggan,
          created_at: t.tgl_transaksi
        };
      });

      const structuredDb = {
        pelanggan: cloudPelanggan || [],
        parfum: cloudParfum || [],
        trxLaundry: normalizedTrx
      };

      setDb(structuredDb);

      let rev = 0;
      let outstanding = 0;
      let downPayment = 0;

      structuredDb.trxLaundry.forEach((t) => {
        rev += t.grand_total;
        outstanding += t.sisa;
        downPayment += t.dp;
      });

      setRevenue(rev);
      setSisaTotal(outstanding);
      setDpTotal(downPayment);
      setActiveOrders(structuredDb.trxLaundry);

      const labelHari = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const penampungHari = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };

      normalizedTrx.forEach((trx) => {
        if (trx.created_at) {
          const hariIndex = new Date(trx.created_at).getDay();
          const namaHari = labelHari[hariIndex];
          if (penampungHari[namaHari] !== undefined) {
            penampungHari[namaHari] += trx.grand_total;
          }
        }
      });

      setGraphData(labelHari.map(h => ({ day: h, amount: penampungHari[h] })));

    } catch (error) {
      console.error("Gagal memuat visualisasi data cloud:", error);
    }
  };

  const handleStatusChange = async (primaryKey, newStatus) => {
    try {
      const currentTrx = activeOrders.find((t) => t.id === primaryKey || t.no_struk === primaryKey);
      if (!currentTrx) return;

      let updatePayload = { status: newStatus };
      if (currentTrx.delivery_type === 'Home Delivery' && newStatus === 'Completed') {
        updatePayload.delivery_status = 'Delivered';
      }

      const { error } = await supabase
        .from('trx_laundry')
        .update(updatePayload)
        .eq('no_struk', primaryKey);

      if (error) throw error;

      loadCloudData();
    } catch (error) {
      console.error("Gagal memperbarui status laundry ke Supabase:", error);
    }
  };

  const handleDeliveryStatusChange = async (primaryKey, newDelStatus) => {
    try {
      let updatePayload = { delivery_status: newDelStatus };
      if (newDelStatus === 'Delivered') {
        updatePayload.status = 'Completed';
      }

      const { error } = await supabase
        .from('trx_laundry')
        .update(updatePayload)
        .eq('no_struk', primaryKey);

      if (error) throw error;

      loadCloudData();
    } catch (error) {
      console.error("Gagal memperbarui status pengiriman ke Supabase:", error);
    }
  };

  if (!db || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Dashboard */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-sky-400 block mb-1">
            STATISTICS OVERVIEW
          </span>
          <h1 className="text-3xl font-extrabold text-white">Performance Dashboard</h1>
          <p className="text-slate-400 text-sm">Monitor business growth and transactional summaries.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/transactions"
            className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-2xl text-sm shadow-md shadow-sky-500/10 transition-all"
          >
            + Create Transaction
          </Link>
          <Link
            href="/admin/reports"
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-bold rounded-2xl text-sm transition-all"
          >
            Financial Reports
          </Link>
        </div>
      </div>

      {/* Core Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700/80 shadow-sm relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Income</span>
            <span className="block text-2xl font-black text-white">IDR {revenue.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700/80 shadow-sm relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Outstanding (Sisa)</span>
            <span className="block text-2xl font-black text-rose-400">IDR {sisaTotal.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700/80 shadow-sm relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Down Payments</span>
            <span className="block text-2xl font-black text-emerald-400">IDR {dpTotal.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700/80 shadow-sm relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Active Orders</span>
            <span className="block text-2xl font-black text-amber-400">
              {activeOrders.filter((t) => t.status !== 'Completed').length} Orders
            </span>
          </div>
        </div>
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700/80 shadow-sm lg:col-span-12 space-y-6">
          <h2 className="text-base font-bold text-white border-b border-slate-700 pb-2">Revenue Growth</h2>
          <div className="h-48 w-full flex items-end justify-between px-4 pt-4 border-b border-l border-slate-700">
            {graphData.map((d, index) => {
              const max = Math.max(...graphData.map(item => item.amount));
              const heightPercent = max > 0 ? (d.amount / max) * 100 : 0;
              return (
                <div key={index} className="flex flex-col items-center flex-1 space-y-2 group">
                  <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    IDR {d.amount.toLocaleString()}
                  </span>
                  <div
                    className="w-12 bg-sky-500 group-hover:bg-sky-400 rounded-t-lg transition-all duration-500 relative"
                    style={{ height: `${Math.max(10, heightPercent * 1.2)}px` }}
                  ></div>
                  <span className="text-xs font-bold text-slate-300">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Logistics Tracker Table */}
      <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700/80 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-white border-b border-slate-700 pb-3">Logistics & Transaction Records</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-xs font-bold uppercase">
                <th className="py-3 px-4">Receipt</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Grand Total</th>
                <th className="py-3 px-4">Outstanding</th>
                <th className="py-3 px-4">Laundry Status</th>
                <th className="py-3 px-4">Delivery</th>
                <th className="py-3 px-4">Delivery Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/80 text-slate-300">
              {activeOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500 font-medium">
                    No transactions found in cloud database.
                  </td>
                </tr>
              ) : (
                activeOrders.map((trx) => {
                  const trxCustomerId = trx.id_pelanggan;
                  const customer = db.pelanggan.find((p) => (p.id_pelanggan === trxCustomerId || p.id === trxCustomerId));
                  const isHomeDel = trx.delivery_type === 'Home Delivery' || trx.delivery_status !== 'Not Started';
                  const primaryKey = trx.no_struk;

                  return (
                    <tr key={primaryKey} className="hover:bg-slate-700/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-sky-400">{trx.no_struk}</td>
                      <td className="py-3 px-4 text-xs">
                        <span className="font-bold text-white block">
                          {customer ? (customer.nama_pelanggan || customer.nama || customer.nama_customer) : 'Umum'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-xs">IDR {trx.grand_total.toLocaleString()}</td>
                      <td className="py-3 px-4 text-xs">
                        <span className={trx.sisa > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                          IDR {trx.sisa.toLocaleString()}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={trx.status}
                          onChange={(e) => handleStatusChange(primaryKey, e.target.value)}
                          className="px-2.5 py-1.5 text-xs font-bold rounded-lg border-2 border-slate-600 bg-slate-900 text-white focus:outline-none focus:border-sky-400"
                        >
                          <option value="Pickup">Pickup</option>
                          <option value="Wash & Dry">Wash & Dry</option>
                          <option value="Fold">Fold</option>
                          <option value="Delivery">Delivery</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>

                      <td className="py-3 px-4 text-xs">{trx.delivery_type}</td>

                      <td className="py-3 px-4">
                        {isHomeDel ? (
                          <select
                            value={trx.delivery_status}
                            onChange={(e) => handleDeliveryStatusChange(primaryKey, e.target.value)}
                            className="px-2.5 py-1.5 text-xs font-bold rounded-lg border-2 bg-slate-900 border-slate-600 text-slate-300 focus:outline-none focus:border-sky-400"
                          >
                            <option value="Not Started">Not Started</option>
                            <option value="In Transit">In Transit</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        ) : (
                          <span className="text-xs text-slate-500">-</span>
                        )}
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