'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/db/supabaseClient';
import { fetchLayanan, createTransaction } from '@/db/laundryService';

export default function AdminTransactions() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [db, setDb] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Terminal Configuration
  const [activeKasir, setActiveKasir] = useState('');
  const [activeToko, setActiveToko] = useState('');
  const [activeParfum, setActiveParfum] = useState('');

  // Customer selection
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Selected Services List: { idLayanan, kuantitas }
  const [selectedItems, setSelectedItems] = useState([]);

  // Financial inputs
  const [dp, setDp] = useState(0);

  // Delivery preference
  const [deliveryType, setDeliveryType] = useState('Self Pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // Success Notification
  const [successMsg, setSuccessMsg] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');

  useEffect(() => {
    async function checkAdminSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user || session.user.email !== 'admin@vtwolaundry.com') {
          router.push('/admin-login');
          return;
        }

        const activeAdmin = {
          id: session.user.id,
          name: 'ADMIN VTWO',
          role: 'admin'
        };

        setCurrentUser(activeAdmin);
        setActiveKasir(activeAdmin.id);

        const cloudLayanan = await fetchLayanan().catch(() => []);
        const { data: cloudPelanggan, error: pelangganError } = await supabase
          .from('pelanggan')
          .select('id_pelanggan, nama_pelanggan, no_hp')
          .order('nama_pelanggan', { ascending: true });

        if (pelangganError) {
          console.error("Gagal mengambil data pelanggan dari cloud:", pelangganError);
        }

        const safePelanggan = cloudPelanggan || [];

        const normalizedLayanan = cloudLayanan && cloudLayanan.length > 0
          ? cloudLayanan.map(l => ({
            idLayanan: l.id_lay_laundry || l.id_layanan || l.idLayanan,
            nama_layanan: l.nama_layanan,
            harga: l.harga,
            satuan: l.satuan
          }))
          : [
            { idLayanan: 'LYN001', nama_layanan: 'Single Size Package (Reguler)', harga: 50000, satuan: 'Paket' },
            { idLayanan: 'LYN002', nama_layanan: 'Cuci Setrika Kiloan', harga: 7000, satuan: 'kg' }
          ];

        const fallbackDb = {
          layanan: normalizedLayanan,
          toko: [{ idToko: 'TKO001', nama_toko: 'VTwo Laundry Pusat' }],
          parfum: [{ idParfum: 'PRF001', nama_parfum: 'Downty Mist', stok_tersedia: 25 }],
          pelanggan: safePelanggan.length > 0
            ? safePelanggan.map(p => ({
              idPelanggan: p.id_pelanggan,
              nama_pelanggan: p.nama_pelanggan,
              no_hp: p.no_hp
            }))
            : [{ idPelanggan: 'CST-DEMO', nama_pelanggan: 'Pelanggan Umum / Guest', no_hp: '08123456789' }]
        };

        setActiveToko(fallbackDb.toko[0].idToko);
        setActiveParfum(fallbackDb.parfum[0].idParfum);

        const defaultServiceId = normalizedLayanan[0].idLayanan;
        setSelectedItems([{ idLayanan: defaultServiceId, kuantitas: 1 }]);

        setDb(fallbackDb);
        setLoadingAuth(false);

      } catch (globalError) {
        console.error("Gagal memuat struktur data dashboard admin:", globalError);
        setLoadingAuth(false);
      }
    }

    checkAdminSession();
  }, [router]);

  if (loadingAuth || !db || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-400"></div>
      </div>
    );
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...selectedItems];
    newItems[index][field] = value;
    setSelectedItems(newItems);
  };

  const addItemRow = () => {
    const defaultId = db.layanan[0].idLayanan;
    setSelectedItems([...selectedItems, { idLayanan: defaultId, kuantitas: 1 }]);
  };

  const removeItemRow = (index) => {
    if (selectedItems.length > 1) {
      setSelectedItems(selectedItems.filter((_, idx) => idx !== index));
    }
  };

  const calculatedItems = selectedItems.map((item) => {
    const serviceInfo = db.layanan.find((l) => l.idLayanan === item.idLayanan);
    const price = serviceInfo ? serviceInfo.harga : 0;
    return {
      ...item,
      nama_layanan: serviceInfo ? serviceInfo.nama_layanan : 'Layanan Tidak Diketahui',
      satuan: serviceInfo ? serviceInfo.satuan : '-',
      harga: price,
      total_harga: price * Number(item.kuantitas || 0)
    };
  });

  const grandTotal = calculatedItems.reduce((acc, curr) => acc + curr.total_harga, 0);
  const sisa = Math.max(0, grandTotal - Number(dp || 0));

  const handleCreateTransaction = async (e) => {
    e.preventDefault();

    if (grandTotal === 0) {
      alert('Please add at least one laundry service.');
      return;
    }

    let customerId = selectedCustomerId;

    if (isNewCustomer) {
      if (!customerName || !customerPhone) {
        alert('Please fill out customer name and phone number.');
        return;
      }

      const newUuid = crypto.randomUUID();
      const { data: newCust, error: custError } = await supabase
        .from('pelanggan')
        .insert([{ id_pelanggan: newUuid, nama_pelanggan: customerName, no_hp: customerPhone }])
        .select()
        .single();

      if (custError) {
        alert('Failed to register new customer in cloud.');
        return;
      }
      customerId = newCust.id_pelanggan;
    } else {
      if (!customerId) {
        alert('Please select a customer.');
        return;
      }
    }

    const transactionData = {
      idParfum: activeParfum,
      idPelanggan: customerId,
      idKasir: 'KSR001',
      idToko: activeToko,
      grand_total: grandTotal,
      dp: Number(dp || 0),
      sisa: sisa,
      status: 'Pickup',
      delivery_type: deliveryType,
      delivery_address: deliveryType === 'Home Delivery' ? deliveryAddress : '',
      delivery_status: 'Not Started'
    };

    const newTrx = await createTransaction(transactionData, calculatedItems);

    if (newTrx) {
      setReceiptNumber(newTrx.no_struk);
      setSuccessMsg('Transaction order logged successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      const defaultServiceId = db.layanan[0].idLayanan;
      setSelectedItems([{ idLayanan: defaultServiceId, kuantitas: 1 }]);
      setDp(0);
      setCustomerName('');
      setCustomerPhone('');
      setDeliveryAddress('');
      setIsNewCustomer(false);
      setSelectedCustomerId('');
    } else {
      alert('Failed to log transaction to cloud database.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Terminal Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-sky-400 block mb-1">
              ORDER ENTRY TERMINAL
            </span>
            <h1 className="text-3xl font-black text-white tracking-tight">VTwo Cashier Portal</h1>
            <p className="text-slate-400 text-sm mt-1">Logged in as: <span className="text-sky-400 font-mono font-bold">{currentUser.id.substring(0, 8)}...</span></p>
          </div>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/admin-login');
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-slate-700 hover:border-rose-900 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            Terminal Sign Out
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="bg-emerald-950/40 border-2 border-emerald-500 text-emerald-300 p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <p className="font-extrabold text-white">{successMsg}</p>
                <p className="text-xs text-slate-400">Receipt No: <span className="font-mono font-bold text-sky-400">{receiptNumber}</span></p>
              </div>
            </div>
            <button
              onClick={() => setSuccessMsg('')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs transition-all"
            >
              Dismiss
            </button>
          </div>
        )}

        <form onSubmit={handleCreateTransaction} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Inputs */}
          <div className="lg:col-span-8 space-y-6">

            {/* Active Configuration */}
            <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700/80 shadow-md grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Active Staff</label>
                <div className="w-full px-4 py-3 rounded-xl border-2 border-slate-700 bg-slate-900 text-sm font-extrabold text-white shadow-sm">
                  {currentUser.name}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Branch Store</label>
                <select
                  value={activeToko}
                  onChange={(e) => setActiveToko(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-700 bg-slate-900 text-sm font-extrabold text-white focus:border-sky-400 focus:outline-none shadow-sm"
                >
                  {db.toko.map((t) => (
                    <option key={t.idToko} value={t.idToko}>
                      {t.nama_toko}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Scent Selection</label>
                <select
                  value={activeParfum}
                  onChange={(e) => setActiveParfum(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-700 bg-slate-900 text-sm font-extrabold text-white focus:border-sky-400 focus:outline-none shadow-sm"
                >
                  {db.parfum.map((p) => (
                    <option key={p.idParfum} value={p.idParfum}>
                      {p.nama_parfum} (Stock: {p.stok_tersedia})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Customer Profile */}
            <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700/80 shadow-md space-y-4">
              <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                <h2 className="text-base font-black text-white">Customer Profile</h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewCustomer(false)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg border-2 transition-all ${!isNewCustomer ? 'bg-sky-500 border-sky-400 text-white' : 'border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                  >
                    Select Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsNewCustomer(true)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg border-2 transition-all ${isNewCustomer ? 'bg-sky-500 border-sky-400 text-white' : 'border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                  >
                    Create New
                  </button>
                </div>
              </div>

              {!isNewCustomer ? (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Choose Customer Profile</label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-700 bg-slate-900 text-sm text-white font-extrabold focus:border-sky-400 focus:outline-none shadow-sm"
                    required={!isNewCustomer}
                  >
                    <option value="">-- Choose Profile --</option>
                    {db.pelanggan.map((p) => (
                      <option key={p.idPelanggan} value={p.idPelanggan}>
                        {p.nama_pelanggan} ({p.no_hp})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Customer Full Name</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter customer name"
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-700 bg-slate-900 text-sm font-extrabold text-white placeholder-slate-500 focus:border-sky-400 focus:outline-none shadow-sm"
                      required={isNewCustomer}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Customer Phone Number</label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Enter phone number"
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-700 bg-slate-900 text-sm font-extrabold text-white placeholder-slate-500 focus:border-sky-400 focus:outline-none shadow-sm"
                      required={isNewCustomer}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Order Basket */}
            <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700/80 shadow-md space-y-4">
              <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                <h2 className="text-base font-black text-white">Order Basket</h2>
                <button
                  type="button"
                  onClick={addItemRow}
                  className="text-xs font-black text-sky-400 hover:text-sky-300"
                >
                  + Add Service
                </button>
              </div>

              <div className="space-y-4">
                {selectedItems.map((item, idx) => {
                  const service = db.layanan.find((l) => l.idLayanan === item.idLayanan);
                  return (
                    <div key={idx} className="flex flex-col sm:flex-row items-end gap-3 p-4 bg-slate-900/60 border border-slate-700 rounded-2xl">
                      <div className="flex-grow w-full">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Layanan / Package</label>
                        <select
                          value={item.idLayanan}
                          onChange={(e) => handleItemChange(idx, 'idLayanan', e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-700 bg-slate-900 text-sm text-white font-extrabold focus:border-sky-400 focus:outline-none"
                        >
                          {db.layanan.map((l) => (
                            <option key={l.idLayanan} value={l.idLayanan}>
                              {l.nama_layanan} (IDR {l.harga.toLocaleString()}/{l.satuan})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-full sm:w-28">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">
                          Qty ({service ? service.satuan : ''})
                        </label>
                        <input
                          type="number"
                          step="any"
                          min="0.1"
                          value={item.kuantitas}
                          onChange={(e) => handleItemChange(idx, 'kuantitas', e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-700 bg-slate-900 text-sm font-black text-white focus:border-sky-400 focus:outline-none"
                          required
                        />
                      </div>

                      {selectedItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          className="p-2.5 text-rose-400 hover:bg-rose-950/20 rounded-xl"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipping */}
            <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700/80 shadow-md space-y-4">
              <h2 className="text-base font-black text-white border-b border-slate-700 pb-2">Logistics Preferences</h2>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setDeliveryType('Self Pickup')}
                  className={`flex-1 py-3 rounded-xl border-2 font-extrabold text-xs transition-all ${deliveryType === 'Self Pickup' ? 'bg-sky-500 border-sky-400 text-white' : 'border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                >
                  Customer Self Pickup
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryType('Home Delivery')}
                  className={`flex-1 py-3 rounded-xl border-2 font-extrabold text-xs transition-all ${deliveryType === 'Home Delivery' ? 'bg-sky-500 border-sky-400 text-white' : 'border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                >
                  Home Delivery
                </button>
              </div>

              {deliveryType === 'Home Delivery' && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Destination Shipping Address</label>
                  <textarea
                    rows="2"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter complete address..."
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-700 bg-slate-900 text-sm font-semibold text-white placeholder-slate-500 focus:border-sky-400 focus:outline-none"
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {/* Pricing Calculations Sidebar */}
          <div className="lg:col-span-4 sticky top-6 bg-slate-800 rounded-3xl p-6 border border-slate-700/80 shadow-md space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-slate-700 pb-2">Invoice Calculations</h2>

            <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 text-xs text-slate-300">
              {calculatedItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="font-semibold truncate max-w-[120px]">{item.nama_layanan}</span>
                  <span className="font-bold text-white">
                    IDR {item.total_harga.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-700 pt-4 space-y-3.5 text-sm">
              <div className="flex justify-between items-center text-slate-400">
                <span>Grand Total</span>
                <span className="font-extrabold text-white">IDR {grandTotal.toLocaleString()}</span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Input Down Payment (DP)</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-bold">IDR</span>
                  <input
                    type="number"
                    min="0"
                    max={grandTotal}
                    value={dp}
                    onChange={(e) => setDp(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-700 bg-slate-900 text-xs font-black text-white focus:border-sky-400 focus:outline-none shadow-sm"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-slate-700 pt-3 text-base font-black text-white">
                <span>Remaining Sisa</span>
                <span className="text-rose-400">IDR {sisa.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-sky-500 hover:bg-sky-600 text-white font-black rounded-2xl shadow-lg shadow-sky-500/20 transition-all text-xs tracking-wider"
            >
              Generate Invoice & Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}