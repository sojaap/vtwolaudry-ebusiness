'use client';

import { useState, useEffect } from 'react';
import { getDb, updateTransactionStatus, saveDb, getCurrentUser } from '@/db/mockDb';
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

  // Load database state & verify Owner auth
  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== 'owner') {
      router.push('/admin-login');
      return;
    }
    setCurrentUser(user);
    loadData();
  }, []);

  const loadData = () => {
    const data = getDb();
    setDb(data);

    // Calculate core financial metrics
    let rev = 0;
    let outstanding = 0;
    let downPayment = 0;
    data.trxLaundry.forEach((t) => {
      rev += Number(t.grand_total || 0);
      outstanding += Number(t.sisa || 0);
      downPayment += Number(t.dp || 0);
    });

    setRevenue(rev);
    setSisaTotal(outstanding);
    setDpTotal(downPayment);
    setActiveOrders(data.trxLaundry);

    // Cashier productivity calculation
    const stats = data.kasir.map((k) => {
      const cashierTrxs = data.trxLaundry.filter((t) => t.idKasir === k.idKasir);
      const totalAmount = cashierTrxs.reduce((acc, curr) => acc + Number(curr.grand_total), 0);
      const activeCount = cashierTrxs.filter((t) => t.status !== 'Completed').length;

      return {
        ...k,
        trxCount: cashierTrxs.length,
        totalAmount,
        activeCount,
        // calculate productivity load percentage
        loadPercentage: Math.min(100, Math.round((activeCount / 5) * 100)),
      };
    });
    setCashierStats(stats);
  };

  // Change order status
  const handleStatusChange = (no_struk, newStatus) => {
    const trxs = getDb();
    const trx = trxs.trxLaundry.find((t) => t.no_struk === no_struk);
    let delStatus = null;
    if (trx && trx.delivery_type === 'Home Delivery' && newStatus === 'Completed') {
      delStatus = 'Delivered';
    }

    updateTransactionStatus(no_struk, newStatus, delStatus);
    loadData();
  };

  // Change delivery status
  const handleDeliveryStatusChange = (no_struk, newDelStatus) => {
    const trxs = getDb();
    const idx = trxs.trxLaundry.findIndex((t) => t.no_struk === no_struk);
    if (idx !== -1) {
      trxs.trxLaundry[idx].delivery_status = newDelStatus;
      if (newDelStatus === 'Delivered') {
        trxs.trxLaundry[idx].status = 'Completed';
      }
      saveDb(trxs);
      loadData();
    }
  };

  if (!db || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-400"></div>
      </div>
    );
  }

  // Pre-calculate values for daily summary chart
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

      {/* 1. Core Financial Metrics Cards (Slate themed) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Income Card */}
        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-bl-full -z-0"></div>
          <div className="relative z-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Income</span>
            <span className="block text-2xl font-black text-white">IDR {revenue.toLocaleString()}</span>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold pt-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              <span>+12.5% vs last week</span>
            </div>
          </div>
        </div>

        {/* Outstanding Card */}
        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full -z-0"></div>
          <div className="relative z-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Outstanding (Sisa)</span>
            <span className="block text-2xl font-black text-rose-400">IDR {sisaTotal.toLocaleString()}</span>
            <p className="text-slate-500 text-xs pt-1">Awaiting collections</p>
          </div>
        </div>

        {/* Down Payment Card */}
        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full -z-0"></div>
          <div className="relative z-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Down Payments</span>
            <span className="block text-2xl font-black text-emerald-400">IDR {dpTotal.toLocaleString()}</span>
            <p className="text-slate-500 text-xs pt-1">Advance cash collections</p>
          </div>
        </div>

        {/* Active Orders Card */}
        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full -z-0"></div>
          <div className="relative z-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Active Orders</span>
            <span className="block text-2xl font-black text-amber-400">
              {activeOrders.filter((t) => t.status !== 'Completed').length} Orders
            </span>
            <p className="text-slate-500 text-xs pt-1">Currently being processed</p>
          </div>
        </div>
      </div>

      {/* 2. Visual Charts & Productivity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Revenue Performance Graph */}
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
                  >
                    <div className="absolute -top-1 left-0 right-0 h-1 bg-sky-300 rounded-t-lg"></div>
                  </div>
                  <span className="text-xs font-bold text-slate-300">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Productivity Table */}
        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700/80 shadow-sm lg:col-span-5 space-y-4">
          <h2 className="text-base font-bold text-white border-b border-slate-700 pb-2">Staff Workload</h2>
          
          <div className="space-y-4">
            {cashierStats.map((c) => (
              <div key={c.idKasir} className="space-y-1.5 p-3.5 rounded-2xl border border-slate-700 bg-slate-900/50">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-extrabold text-white">{c.nama_kasir}</span>
                    <span className="text-[10px] text-slate-500 block">ID: {c.idKasir} | {c.trxCount} orders</span>
                  </div>
                  <span className="font-bold text-sky-400">{c.activeCount} active</span>
                </div>

                <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      c.loadPercentage > 80 
                        ? 'bg-rose-500' 
                        : c.loadPercentage > 40 
                        ? 'bg-amber-400' 
                        : 'bg-emerald-400'
                    }`}
                    style={{ width: `${c.loadPercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Workload status</span>
                  <span className="font-bold uppercase text-slate-300">
                    {c.loadPercentage > 80 ? 'Heavy' : c.loadPercentage > 40 ? 'Moderate' : 'Light'} ({c.loadPercentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Transaction Logistics Tracker */}
      <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700/80 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-slate-700 pb-3">
          <h2 className="text-lg font-bold text-white">Logistics & Transaction Records</h2>
          <span className="text-xs font-semibold text-slate-400">Updates sync in real-time</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-xs font-bold uppercase">
                <th className="py-3 px-4">Receipt</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Perfume</th>
                <th className="py-3 px-4">Grand Total</th>
                <th className="py-3 px-4">Outstanding</th>
                <th className="py-3 px-4">Laundry Status</th>
                <th className="py-3 px-4">Delivery Method</th>
                <th className="py-3 px-4">Delivery Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/80 font-medium text-slate-300">
              {activeOrders.map((trx) => {
                const customer = db.pelanggan.find((p) => p.idPelanggan === trx.idPelanggan);
                const perfume = db.parfum.find((p) => p.idParfum === trx.idParfum);

                return (
                  <tr key={trx.no_struk} className="hover:bg-slate-700/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-sky-400">{trx.no_struk}</td>
                    <td className="py-3 px-4 text-xs">
                      <span className="font-bold text-white block">{customer ? customer.nama_pelanggan : 'Unknown'}</span>
                      <span className="text-[10px] text-slate-500">{customer ? customer.no_hp : ''}</span>
                    </td>
                    <td className="py-3 px-4 text-xs">{perfume ? perfume.nama_parfum : ''}</td>
                    <td className="py-3 px-4 font-bold text-xs">IDR {trx.grand_total.toLocaleString()}</td>
                    <td className="py-3 px-4 text-xs">
                      <span className={trx.sisa > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                        IDR {trx.sisa.toLocaleString()}
                      </span>
                    </td>
                    
                    <td className="py-3 px-4">
                      <select
                        value={trx.status}
                        onChange={(e) => handleStatusChange(trx.no_struk, e.target.value)}
                        className="px-2.5 py-1.5 text-xs font-bold rounded-lg border-2 border-slate-600 focus:outline-none focus:border-sky-400 bg-slate-900 text-white"
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
                      {trx.delivery_type === 'Home Delivery' ? (
                        <select
                          value={trx.delivery_status}
                          onChange={(e) => handleDeliveryStatusChange(trx.no_struk, e.target.value)}
                          className={`px-2 py-1.5 text-xs font-bold rounded-lg border-2 focus:outline-none bg-slate-900 ${
                            trx.delivery_status === 'Delivered'
                              ? 'border-emerald-700/60 text-emerald-400'
                              : trx.delivery_status === 'In Transit'
                              ? 'border-amber-700/60 text-amber-400'
                              : 'border-slate-600 text-slate-400'
                          }`}
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
