'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getDb, addTransaction, addPelanggan, getCurrentUser } from '@/db/mockDb';

function OrderCalculatorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [db, setDb] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedToko, setSelectedToko] = useState('');
  const [selectedParfum, setSelectedParfum] = useState('');
  const [deliveryType, setDeliveryType] = useState('Self Pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  
  // Customer details inputs
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Selected Services List: { idLayanan, kuantitas }
  const [selectedItems, setSelectedItems] = useState([]);
  
  // Down Payment
  const [dp, setDp] = useState(0);

  // Success Modal State
  const [createdOrder, setCreatedOrder] = useState(null);

  // Load database & check if logged in
  useEffect(() => {
    const data = getDb();
    setDb(data);

    if (data.toko.length > 0) setSelectedToko(data.toko[0].idToko);
    if (data.parfum.length > 0) setSelectedParfum(data.parfum[0].idParfum);

    const user = getCurrentUser();
    if (user && user.role === 'customer') {
      setCurrentUser(user);
      const cust = data.pelanggan.find((p) => p.idPelanggan === user.id);
      if (cust) {
        setCustomerName(cust.nama_pelanggan);
        setCustomerPhone(String(cust.no_hp));
      }
    }

    // Initial selected package from query param
    const pkgParam = searchParams.get('package');
    if (pkgParam) {
      const match = data.layanan.find((l) => l.idLayanan === pkgParam);
      if (match) {
        setSelectedItems([{ idLayanan: match.idLayanan, kuantitas: 1 }]);
      }
    } else {
      if (data.layanan.length > 0) {
        setSelectedItems([{ idLayanan: data.layanan[0].idLayanan, kuantitas: 1 }]);
      }
    }
  }, [searchParams]);

  if (!db) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  // Handle service selection change
  const handleItemChange = (index, field, value) => {
    const newItems = [...selectedItems];
    newItems[index][field] = value;
    setSelectedItems(newItems);
  };

  // Add another service row
  const addItemRow = () => {
    setSelectedItems([...selectedItems, { idLayanan: db.layanan[0].idLayanan, kuantitas: 1 }]);
  };

  // Remove service row
  const removeItemRow = (index) => {
    if (selectedItems.length > 1) {
      setSelectedItems(selectedItems.filter((_, idx) => idx !== index));
    }
  };

  // Calculations
  const calculatedItems = selectedItems.map((item) => {
    const serviceInfo = db.layanan.find((l) => l.idLayanan === item.idLayanan);
    const price = serviceInfo ? serviceInfo.harga : 0;
    const total = price * Number(item.kuantitas || 0);
    return {
      ...item,
      nama_layanan: serviceInfo ? serviceInfo.nama_layanan : '',
      satuan: serviceInfo ? serviceInfo.satuan : '',
      harga: price,
      total_harga: total,
    };
  });

  const grandTotal = calculatedItems.reduce((acc, curr) => acc + curr.total_harga, 0);
  const sisa = Math.max(0, grandTotal - Number(dp || 0));

  // Submit Order
  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (grandTotal === 0) {
      alert('Please add at least one laundry service.');
      return;
    }

    let customerId = '';

    if (currentUser) {
      customerId = currentUser.id;
    } else {
      // Guest Checkout: Create a customer profile automatically
      if (!customerName.trim() || !customerPhone.trim()) {
        alert('Please provide your name and phone number for the order.');
        return;
      }
      const newCust = addPelanggan({
        nama_pelanggan: customerName,
        no_hp: Number(customerPhone),
      });
      customerId = newCust.idPelanggan;
    }

    const transactionData = {
      idParfum: selectedParfum,
      idPelanggan: customerId,
      idKasir: db.kasir[0].idKasir, // default
      idToko: selectedToko,
      grand_total: grandTotal,
      dp: Number(dp || 0),
      sisa: sisa,
      status: 'Pickup',
      delivery_type: deliveryType,
      delivery_address: deliveryType === 'Home Delivery' ? deliveryAddress : '',
      delivery_status: 'Not Started',
    };

    const newTrx = addTransaction(transactionData, calculatedItems);
    setCreatedOrder(newTrx);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#ECF9FF] font-sans">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-12 sm:px-6 lg:px-8 mb-24">
        
        {/* Page Header */}
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-600 block mb-2">ORDER TERMINAL</span>
          <h1 className="text-3xl font-extrabold text-slate-800">Transparent Price Calculator</h1>
          <p className="text-slate-500 mt-2 max-w-md mx-auto">
            Input your laundry details. You can order directly as a Guest without logging in!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form Column (7 cols) */}
          <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-6">
            
            {/* 1. Customer Details (High contrast with inline icons) */}
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-lg space-y-4">
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">
                1. Customer Details
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name input */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter full name"
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus:outline-none text-sm font-bold text-slate-800 placeholder:text-slate-400 bg-white shadow-sm disabled:bg-slate-50 disabled:text-slate-550"
                      disabled={!!currentUser}
                      required
                    />
                  </div>
                </div>

                {/* Phone Number input */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </span>
                    <input
                      type="number"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. 628123456"
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus:outline-none text-sm font-bold text-slate-800 placeholder:text-slate-400 bg-white shadow-sm disabled:bg-slate-50 disabled:text-slate-550"
                      disabled={!!currentUser}
                      required
                    />
                  </div>
                </div>
              </div>

              {currentUser && (
                <p className="text-[10px] text-sky-600 font-bold">
                  ✓ Profile autofilled from your active customer session.
                </p>
              )}
            </div>

            {/* 2. Toko & Parfum */}
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-lg grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Store Branch</label>
                <select
                  value={selectedToko}
                  onChange={(e) => setSelectedToko(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-300 focus:border-sky-500 focus:outline-none text-sm font-bold text-slate-700 bg-white shadow-sm"
                >
                  {db.toko.map((t) => (
                    <option key={t.idToko} value={t.idToko}>
                      {t.nama_toko}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Scent/Perfume</label>
                <select
                  value={selectedParfum}
                  onChange={(e) => setSelectedParfum(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-300 focus:border-sky-500 focus:outline-none text-sm font-bold text-slate-700 bg-white shadow-sm"
                >
                  {db.parfum.map((p) => (
                    <option key={p.idParfum} value={p.idParfum}>
                      {p.nama_parfum} (Stock: {p.stok_tersedia})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. Basket items */}
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-lg space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h2 className="text-lg font-bold text-slate-800">2. Laundry Services Needed</h2>
                <button
                  type="button"
                  onClick={addItemRow}
                  className="text-xs font-bold text-sky-500 hover:text-sky-600 flex items-center gap-1"
                >
                  + Add Service
                </button>
              </div>

              <div className="space-y-4">
                {selectedItems.map((item, idx) => {
                  const service = db.layanan.find((l) => l.idLayanan === item.idLayanan);
                  return (
                    <div key={idx} className="flex flex-col sm:flex-row items-end gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                      <div className="flex-grow w-full">
                        <label className="block text-xs font-bold text-slate-450 mb-1.5">Layanan</label>
                        <select
                          value={item.idLayanan}
                          onChange={(e) => handleItemChange(idx, 'idLayanan', e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-sm text-slate-800 font-bold focus:border-sky-500 focus:outline-none"
                        >
                          {db.layanan.map((l) => (
                            <option key={l.idLayanan} value={l.idLayanan}>
                              {l.nama_layanan} (IDR {l.harga.toLocaleString()}/{l.satuan})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-full sm:w-28">
                        <label className="block text-xs font-bold text-slate-450 mb-1.5">
                          Qty ({service ? service.satuan : ''})
                        </label>
                        <input
                          type="number"
                          step="any"
                          min="0.1"
                          value={item.kuantitas}
                          onChange={(e) => handleItemChange(idx, 'kuantitas', e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-sm font-black text-slate-805 focus:border-sky-500 focus:outline-none"
                          required
                        />
                      </div>

                      {selectedItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl"
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

            {/* 4. Delivery Preferences */}
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-lg space-y-4">
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">3. Pickup & Delivery Preferences</h2>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setDeliveryType('Self Pickup')}
                  className={`flex-1 py-3 text-sm font-extrabold rounded-xl border-2 transition-all ${
                    deliveryType === 'Self Pickup'
                      ? 'bg-sky-50 border-sky-400 text-sky-600 shadow-sm'
                      : 'border-slate-200 text-slate-450 hover:bg-slate-50'
                  }`}
                >
                  Self Pickup at Store
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryType('Home Delivery')}
                  className={`flex-1 py-3 text-sm font-extrabold rounded-xl border-2 transition-all ${
                    deliveryType === 'Home Delivery'
                      ? 'bg-sky-50 border-sky-400 text-sky-600 shadow-sm'
                      : 'border-slate-200 text-slate-455 hover:bg-slate-50'
                  }`}
                >
                  Home Delivery
                </button>
              </div>

              {deliveryType === 'Home Delivery' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Delivery Destination Address</label>
                  <textarea
                    rows="3"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Provide your complete shipping address..."
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 focus:border-sky-500 focus:outline-none text-sm bg-white font-medium text-slate-705 shadow-sm"
                    required
                  ></textarea>
                </div>
              )}
            </div>

            {/* 5. Down Payment */}
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-lg space-y-4">
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">4. Pay Down Payment (DP)</h2>
              <div className="flex items-center gap-3">
                <span className="text-sm font-black text-slate-500">IDR</span>
                <input
                  type="number"
                  min="0"
                  max={grandTotal}
                  value={dp}
                  onChange={(e) => setDp(e.target.value)}
                  placeholder="Enter down payment value"
                  className="flex-grow px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-sky-500 focus:outline-none text-sm font-bold text-slate-805 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setDp(grandTotal)}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
                >
                  Pay Full Amount
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-3xl shadow-lg shadow-sky-100 hover:shadow-sky-200 transition-all text-sm tracking-wide"
            >
              Simulate Placing Order
            </button>
          </form>

          {/* Sticky Price details */}
          <div className="lg:col-span-5 sticky top-28 bg-[#E0F7FF] rounded-3xl p-8 border border-sky-100 space-y-6">
            <h2 className="text-xl font-bold text-slate-800 border-b border-sky-200 pb-2">Summary Calculations</h2>

            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
              {calculatedItems.map((item, index) => (
                <div key={index} className="flex justify-between items-start gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-slate-800">{item.nama_layanan}</span>
                    <span className="block text-xs text-slate-500">
                      {item.kuantitas} x IDR {item.harga.toLocaleString()} / {item.satuan}
                    </span>
                  </div>
                  <span className="font-bold text-slate-800">
                    IDR {item.total_harga.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-sky-200 pt-4 space-y-3">
              <div className="flex justify-between items-center text-sm text-slate-600">
                <span>Subtotal</span>
                <span>IDR {grandTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-slate-600">
                <span>DP Paid</span>
                <span className="text-emerald-600 font-bold">- IDR {Number(dp || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-t border-sky-200 pt-3 text-lg font-black text-slate-800">
                <span>Remaining Sisa</span>
                <span className="text-rose-600">IDR {sisa.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Success Modal */}
      {createdOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-sky-100 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-md">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div>
              <h3 className="text-2xl font-extrabold text-slate-800">Order Confirmed!</h3>
              <p className="text-sm text-slate-500 mt-1">Receipt has been generated successfully.</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-left space-y-3 font-mono text-xs text-slate-700">
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-2">
                <span className="font-bold text-slate-500">RECEIPT NO</span>
                <span className="font-bold text-sky-600">{createdOrder.no_struk}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{new Date(createdOrder.tgl_transaksi).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Total:</span>
                <span>IDR {createdOrder.grand_total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>DP Paid:</span>
                <span>IDR {createdOrder.dp.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-rose-600 font-bold">
                <span>Sisa:</span>
                <span>IDR {createdOrder.sisa.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-700">
                  {createdOrder.status}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push(`/track?struk=${createdOrder.no_struk}`)}
                className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-2xl shadow-md transition-all text-sm"
              >
                Track this Laundry Live
              </button>
              <button
                onClick={() => {
                  setCreatedOrder(null);
                  setSelectedItems([{ idLayanan: db.layanan[0].idLayanan, kuantitas: 1 }]);
                  setDp(0);
                  setDeliveryAddress('');
                  if (!currentUser) {
                    setCustomerName('');
                    setCustomerPhone('');
                  }
                }}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold rounded-2xl transition-all text-sm"
              >
                Create Another Order
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function OrderCalculator() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    }>
      <OrderCalculatorContent />
    </Suspense>
  );
}
