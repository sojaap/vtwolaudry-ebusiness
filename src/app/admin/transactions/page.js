'use client';

import { useState, useEffect } from 'react';
import { getDb, addTransaction, addPelanggan, getCurrentUser } from '@/db/mockDb';
import { useRouter } from 'next/navigation';

export default function AdminTransactions() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [db, setDb] = useState(null);
  
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

  // Authenticate Cashier/Owner
  useEffect(() => {
    const user = getCurrentUser();
    if (!user || (user.role !== 'cashier' && user.role !== 'owner')) {
      router.push('/admin-login');
      return;
    }
    setCurrentUser(user);

    const data = getDb();
    setDb(data);

    // Default configuration based on active user
    if (user.role === 'cashier') {
      setActiveKasir(user.id);
    } else if (data.kasir.length > 0) {
      setActiveKasir(data.kasir[0].idKasir);
    }

    if (data.toko.length > 0) setActiveToko(data.toko[0].idToko);
    if (data.parfum.length > 0) setActiveParfum(data.parfum[0].idParfum);
    
    if (data.layanan.length > 0) {
      setSelectedItems([{ idLayanan: data.layanan[0].idLayanan, kuantitas: 1 }]);
    }
  }, []);

  if (!db || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-400"></div>
      </div>
    );
  }

  // Handle item change
  const handleItemChange = (index, field, value) => {
    const newItems = [...selectedItems];
    newItems[index][field] = value;
    setSelectedItems(newItems);
  };

  // Add item row
  const addItemRow = () => {
    setSelectedItems([...selectedItems, { idLayanan: db.layanan[0].idLayanan, kuantitas: 1 }]);
  };

  // Remove item row
  const removeItemRow = (index) => {
    if (selectedItems.length > 1) {
      setSelectedItems(selectedItems.filter((_, idx) => idx !== index));
    }
  };

  // Calculate pricing breakdown
  const calculatedItems = selectedItems.map((item) => {
    const serviceInfo = db.layanan.find((l) => l.idLayanan === item.idLayanan);
    const price = serviceInfo ? serviceInfo.harga : 0;
    return {
      ...item,
      nama_layanan: serviceInfo ? serviceInfo.nama_layanan : '',
      satuan: serviceInfo ? serviceInfo.satuan : '',
      harga: price,
      total_harga: price * Number(item.kuantitas || 0)
    };
  });

  const grandTotal = calculatedItems.reduce((acc, curr) => acc + curr.total_harga, 0);
  const sisa = Math.max(0, grandTotal - Number(dp || 0));

  // Submit order
  const handleCreateTransaction = (e) => {
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
      const newCust = addPelanggan({
        nama_pelanggan: customerName,
        no_hp: Number(customerPhone)
      });
      customerId = newCust.idPelanggan;
    } else {
      if (!customerId) {
        alert('Please select a customer.');
        return;
      }
    }

    const transactionData = {
      idParfum: activeParfum,
      idPelanggan: customerId,
      idKasir: activeKasir,
      idToko: activeToko,
      grand_total: grandTotal,
      dp: Number(dp || 0),
      sisa: sisa,
      status: 'Pickup',
      delivery_type: deliveryType,
      delivery_address: deliveryType === 'Home Delivery' ? deliveryAddress : '',
      delivery_status: 'Not Started'
    };

    const newTrx = addTransaction(transactionData, calculatedItems);
    
    setReceiptNumber(newTrx.no_struk);
    setSuccessMsg('Transaction order logged successfully!');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Reset inputs
    setSelectedItems([{ idLayanan: db.layanan[0].idLayanan, kuantitas: 1 }]);
    setDp(0);
    setCustomerName('');
    setCustomerPhone('');
    setDeliveryAddress('');
    setIsNewCustomer(false);
    setSelectedCustomerId('');
  };

  return (
    <div className="space-y-8">
      {/* Terminal Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-sky-400 block mb-1">
          ORDER ENTRY
        </span>
        <h1 className="text-3xl font-extrabold text-white">Order Input Terminal</h1>
        <p className="text-slate-400 text-sm">Add laundry orders, select packages, and print invoices.</p>
      </div>

      {/* Success Alert */}
      {successMsg && (
        <div className="bg-emerald-950/40 border-2 border-emerald-500 text-emerald-300 p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-550 text-white flex items-center justify-center font-bold">
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
        
        {/* Main Inputs (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Configuration details */}
          <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700/80 shadow-md grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Active Cashier</label>
              {currentUser.role === 'owner' ? (
                <select
                  value={activeKasir}
                  onChange={(e) => setActiveKasir(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-650 bg-slate-900 text-sm font-extrabold text-white focus:border-sky-400 focus:outline-none shadow-sm"
                >
                  {db.kasir.map((k) => (
                    <option key={k.idKasir} value={k.idKasir}>
                      {k.nama_kasir} ({k.idKasir})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="w-full px-4 py-3 rounded-xl border-2 border-slate-650 bg-slate-900 text-sm font-extrabold text-white shadow-sm">
                  {currentUser.name} ({currentUser.id})
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Branch Store</label>
              <select
                value={activeToko}
                onChange={(e) => setActiveToko(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-650 bg-slate-900 text-sm font-extrabold text-white focus:border-sky-400 focus:outline-none shadow-sm"
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
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-650 bg-slate-900 text-sm font-extrabold text-white focus:border-sky-400 focus:outline-none shadow-sm"
              >
                {db.parfum.map((p) => (
                  <option key={p.idParfum} value={p.idParfum}>
                    {p.nama_parfum} (Stock: {p.stok_tersedia})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Customer selection */}
          <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700/80 shadow-md space-y-4">
            <div className="flex justify-between items-center border-b border-slate-700 pb-2">
              <h2 className="text-base font-black text-white">Customer Profile</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewCustomer(false)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg border-2 transition-all ${
                    !isNewCustomer ? 'bg-sky-500 border-sky-400 text-white' : 'border-slate-600 text-slate-400 hover:bg-slate-750'
                  }`}
                >
                  Select Account
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewCustomer(true)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg border-2 transition-all ${
                    isNewCustomer ? 'bg-sky-500 border-sky-400 text-white' : 'border-slate-600 text-slate-400 hover:bg-slate-750'
                  }`}
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
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-600 bg-slate-900 text-sm text-white font-extrabold focus:border-sky-400 focus:outline-none shadow-sm"
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
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-600 bg-slate-900 text-sm font-extrabold text-white placeholder-slate-500 focus:border-sky-400 focus:outline-none shadow-sm"
                    required={isNewCustomer}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Customer Phone Number</label>
                  <input
                    type="number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-600 bg-slate-900 text-sm font-extrabold text-white placeholder-slate-500 focus:border-sky-400 focus:outline-none shadow-sm"
                    required={isNewCustomer}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Services Basket */}
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
                      <label className="block text-[10px] font-bold text-slate-450 uppercase mb-2">Layanan / Package</label>
                      <select
                        value={item.idLayanan}
                        onChange={(e) => handleItemChange(idx, 'idLayanan', e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-600 bg-slate-900 text-sm text-white font-extrabold focus:border-sky-400 focus:outline-none"
                      >
                        {db.layanan.map((l) => (
                          <option key={l.idLayanan} value={l.idLayanan}>
                            {l.nama_layanan} (IDR {l.harga.toLocaleString()}/{l.satuan})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-full sm:w-28">
                      <label className="block text-[10px] font-bold text-slate-450 uppercase mb-2">
                        Qty ({service ? service.satuan : ''})
                      </label>
                      <input
                        type="number"
                        step="any"
                        min="0.1"
                        value={item.kuantitas}
                        onChange={(e) => handleItemChange(idx, 'kuantitas', e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-600 bg-slate-900 text-sm font-black text-white focus:border-sky-400 focus:outline-none"
                        required
                      />
                    </div>

                    {selectedItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItemRow(idx)}
                        className="p-2.5 text-rose-450 hover:bg-rose-950/20 rounded-xl"
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
                className={`flex-1 py-3 rounded-xl border-2 font-extrabold text-xs transition-all ${
                  deliveryType === 'Self Pickup'
                    ? 'bg-sky-500 border-sky-400 text-white'
                    : 'border-slate-650 text-slate-400 hover:bg-slate-750'
                }`}
              >
                Customer Self Pickup
              </button>
              <button
                type="button"
                onClick={() => setDeliveryType('Home Delivery')}
                className={`flex-1 py-3 rounded-xl border-2 font-extrabold text-xs transition-all ${
                  deliveryType === 'Home Delivery'
                    ? 'bg-sky-500 border-sky-400 text-white'
                    : 'border-slate-650 text-slate-400 hover:bg-slate-750'
                }`}
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
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-600 bg-slate-900 text-sm font-semibold text-white placeholder-slate-500 focus:border-sky-400 focus:outline-none"
                  required
                />
              </div>
            )}
          </div>
        </div>

        {/* Pricing calculations sidebar */}
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
                <span className="text-xs text-slate-450 font-bold">IDR</span>
                <input
                  type="number"
                  min="0"
                  max={grandTotal}
                  value={dp}
                  onChange={(e) => setDp(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-600 bg-slate-900 text-xs font-black text-white focus:border-sky-400 focus:outline-none shadow-sm"
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
  );
}
