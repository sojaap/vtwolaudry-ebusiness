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

  // Cashier productivity
  const [cashierStats, setCashierStats] = useState([]);

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
      const { data: cloudTrx } = await supabase.from('transaksi').select('*');
      const { data: cloudPelanggan } = await supabase.from('pelanggan').select('*');
      const { data: cloudParfum } = await supabase.from('parfum').select('*');

      const structuredDb = {
        pelanggan: cloudPelanggan || [],
        parfum: cloudParfum || [],
        trxLaundry: cloudTrx || [],
        kasir: [
          { idKasir: 'KSR001', nama_kasir: 'Fitri' },
          { idKasir: 'KSR002', nama_kasir: 'Agus' }
        ]
      };

      setDb(structuredDb);

      let rev = 0;
      let outstanding = 0;
      let downPayment = 0;

      structuredDb.trxLaundry.forEach((t) => {
        rev += Number(t.grand_total || 0);
        outstanding += Number(t.sisa || 0);
        downPayment += Number(t.dp || 0);
      });

      setRevenue(rev);
      setSisaTotal(outstanding);
      setDpTotal(downPayment);
      setActiveOrders(structuredDb.trxLaundry);

      const stats = structuredDb.kasir.map((k) => {
        const cashierTrxs = structuredDb.trxLaundry.filter((t) => t.id_kasir === k.idKasir || t.idKasir === k.idKasir);
        const totalAmount = cashierTrxs.reduce((acc, curr) => acc + Number(curr.grand_total || 0), 0);
        const activeCount = cashierTrxs.filter((t) => t.status !== 'Completed').length;

        return {
          ...k,
          trxCount: cashierTrxs.length,
          totalAmount,
          activeCount,
          loadPercentage: Math.min(100, Math.round((activeCount / 5) * 100)),
        };
      });
      setCashierStats(stats);

    } catch (error) {
      console.error("Gagal memuat visualisasi data cloud:", error);
    }
  };

  const handleStatusChange = async (no_struk, newStatus) => {
    try {
      const currentTrx = activeOrders.find((t) => t.no_struk === no_struk);
      let updatePayload = { status: newStatus };

      if (currentTrx && (currentTrx.delivery_type === 'Home Delivery' || currentTrx.delivery_style === 'Home Delivery') && newStatus === 'Completed') {
        updatePayload.delivery_status = 'Delivered';
      }

      await supabase
        .from('transaksi')
        .update(updatePayload)
        .eq('no_struk', no_struk);

      loadCloudData();
    } catch (error) {
      console.error("Gagal memperbarui status order:", error);
    }
  };

  const handleDeliveryStatusChange = async (no_struk, newDelStatus) => {
    try {
      let updatePayload = { delivery_status: newDelStatus };
      if (newDelStatus === 'Delivered') {
        updatePayload.status = 'Completed';
      }

      await supabase
        .from('transaksi')
        .update(updatePayload)
        .eq('no_struk', no_struk);

      loadCloudData();
    } catch (error) {
      console.error("Gagal memperbarui status logistik:", error);
    }
  };

  if (!db || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-400"></div>
      </div>
    );
  }

  const recentDays = [
    { day: 'Mon', amount: 150000 },
    { day: 'Tue', amount: 280000 },
    { day: 'Wed', amount: 200000 },
    { day: 'Thu', amount: revenue },
  ];

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

      {/* Visual Charts & Productivity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700/80 shadow-sm lg:col-span-7 space-y-6">
          <h2 className="text-base font-bold text-white border-b border-slate-700 pb-2">Revenue Growth</h2>
          <div className="h-48 w-full flex items-end justify-between px-4 pt-4 border-b border-l border-slate-700">
            {recentDays.map((d, index) => {
              const max = Math.max(...recentDays.map(item => item.amount));
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

        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700/80 shadow-sm lg:col-span-5 space-y-4">
          <h2 className="text-base font-bold text-white border-b border-slate-700 pb-2">Staff Workload</h2>
          <div className="space-y-4">
            {cashierStats.map((c) => (
              <div key={c.idKasir} className="space-y-1.5 p-3.5 rounded-2xl border border-slate-700 bg-slate-900/50">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-extrabold text-white">{c.nama_kasir}</span>
                    <span className="text-[10px] text-slate-500 block">{c.trxCount} orders</span>
                  </div>
                  <span className="font-bold text-sky-400">{c.activeCount} active</span>
                </div>
                <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-400" style={{ width: `${c.loadPercentage}%` }}></div>
                </div>
              </div>
            ))}
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
              {activeOrders.map((trx) => {
                const trxCustomerId = trx.idPelanggan || trx.id_pelanggan;
                const customer = db.pelanggan.find((p) => (p.id_pelanggan || p.idPelanggan) === trxCustomerId);
                const isHomeDel = trx.delivery_type === 'Home Delivery' || trx.delivery_style === 'Home Delivery';

                return (
                  <tr key={trx.no_struk || trx.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-sky-400">{trx.no_struk || 'N/A'}</td>
                    <td className="py-3 px-4 text-xs">
                      <span className="font-bold text-white block">{customer ? customer.nama_pelanggan : 'Umum'}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-xs">IDR {Number(trx.grand_total || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 text-xs">
                      <span className={Number(trx.sisa || 0) > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                        IDR {Number(trx.sisa || 0).toLocaleString()}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={trx.status || 'Pickup'}
                        onChange={(e) => handleStatusChange(trx.no_struk, e.target.value)}
                        className="px-2.5 py-1.5 text-xs font-bold rounded-lg border-2 border-slate-600 bg-slate-900 text-white"
                      >
                        <option value="Pickup">Pickup</option>
                        <option value="Wash & Dry">Wash & Dry</option>
                        <option value="Fold">Fold</option>
                        <option value="Delivery">Delivery</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>

                    <td className="py-3 px-4 text-xs">{trx.delivery_type || 'Self Pickup'}</td>

                    <td className="py-3 px-4">
                      {isHomeDel ? (
                        <select
                          value={trx.delivery_status || 'Not Started'}
                          onChange={(e) => handleDeliveryStatusChange(trx.no_struk, e.target.value)}
                          className="px-2.5 py-1.5 text-xs font-bold rounded-lg border-2 bg-slate-900 border-slate-600 text-slate-300"
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
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}