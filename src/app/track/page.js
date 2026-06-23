'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getDb } from '@/db/mockDb';
import { supabase } from '@/db/supabaseClient';

function TrackingContent() {
  const searchParams = useSearchParams();
  const [strukQuery, setStrukQuery] = useState('');
  const [db, setDb] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
  const [itemsResult, setItemsResult] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  // Delivery configuration states
  const [editDelivery, setEditDelivery] = useState(false);
  const [deliveryType, setDeliveryType] = useState('Self Pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState('Not Started');

  // Load DB
  useEffect(() => {
    setDb(getDb());

    // Auto-search if parameter exists
    const query = searchParams.get('struk');
    if (query) {
      setStrukQuery(query);
      handleSearch(query);
    }
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(strukQuery);
  };

  const handleSearch = async (receiptNo) => {
    setErrorMsg('');
    setSearchResult(null);
    setItemsResult([]);

    const cleanedReceipt = receiptNo.trim();

    const { data: trx, error: trxError } = await supabase
      .from('trx_laundry')
      .select('*')
      .ilike('no_struk', cleanedReceipt)
      .maybeSingle();

    if (trxError || !trx) {
      setErrorMsg(`No receipt found matching "${cleanedReceipt}". Please check the receipt number and try again.`);
      return;
    }

    const { data: trxItems, error: itemsError } = await supabase
      .from('trx_layanan')
      .select('*')
      .eq('no_struk', trx.no_struk);

    const localDb = getDb();
    let items = [];

    if (!itemsError && trxItems) {
      items = trxItems.map((item) => {
        const lay = localDb.layanan.find((l) => (l.id_lay_laundry || l.id_layanan || l.idLayanan) === item.id_layanan);
        return {
          ...item,
          nama_layanan: lay ? lay.nama_layanan : 'Laundry Service Item',
          satuan: lay ? lay.satuan : 'kg',
        };
      });
    }

    setSearchResult(trx);
    setItemsResult(items);

    // Set delivery states
    setDeliveryType(trx.delivery_type);
    setDeliveryAddress(trx.delivery_address || '');
    setDeliveryStatus(trx.delivery_status || 'Not Started');
    setEditDelivery(false);
  };

  const handleSaveDelivery = async () => {
    if (deliveryType === 'Home Delivery' && !deliveryAddress.trim()) {
      alert('Please fill out the delivery address.');
      return;
    }

    const { data: updatedTrx, error: updateError } = await supabase
      .from('trx_laundry')
      .update({
        delivery_type: deliveryType,
        delivery_address: deliveryType === 'Home Delivery' ? deliveryAddress : '',
        delivery_status: deliveryType === 'Home Delivery' ? deliveryStatus : 'Not Started'
      })
      .eq('no_struk', searchResult.no_struk)
      .select()
      .single();

    if (!updateError && updatedTrx) {
      setSearchResult(updatedTrx);
      setEditDelivery(false);
    } else {
      alert('Failed to update delivery settings on cloud database.');
    }
  };

  const trackingSteps = [
    { label: 'Pickup', desc: 'Clothes received by courier or cashier', statusKey: 'Pickup' },
    { label: 'Wash & Dry', desc: 'Garments washed and dried', statusKey: 'Wash & Dry' },
    { label: 'Fold', desc: 'Garments ironed and folded crisply', statusKey: 'Fold' },
    { label: 'Delivery / Ready', desc: 'Out for delivery or ready for pickup', statusKey: 'Delivery' },
    { label: 'Completed', desc: 'Order picked up or successfully delivered', statusKey: 'Completed' },
  ];

  const getStepStatus = (index) => {
    if (!searchResult) return 'upcoming';
    const statusOrder = ['Pickup', 'Wash & Dry', 'Fold', 'Delivery', 'Completed'];
    const currentIdx = statusOrder.indexOf(searchResult.status);

    if (index < currentIdx) return 'completed';
    if (index === currentIdx) return 'current';
    return 'upcoming';
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#ECF9FF] font-sans">
      <Navbar />

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 py-12 sm:px-6 lg:px-8 mb-24">

        {/* Search Bar section */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-sky-600 block mb-2">TRACKING PORTAL</span>
            <h1 className="text-3xl font-extrabold text-slate-800">Track Your Laundry Progress</h1>
            <p className="text-slate-500 mt-1 max-w-sm mx-auto text-sm">
              Enter your VTwo Laundry receipt number (e.g. TRX001, TRX002) below to view real-time status.
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto flex gap-3">
            <input
              type="text"
              value={strukQuery}
              onChange={(e) => setStrukQuery(e.target.value)}
              placeholder="e.g. TRX001"
              className="flex-grow px-5 py-3 rounded-2xl border-2 border-slate-200 focus:outline-none focus:border-sky-400 font-semibold tracking-wider placeholder:font-normal uppercase text-sm text-slate-900 bg-white"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-2xl shadow-md shadow-sky-100 hover:shadow-lg transition-all text-sm"
            >
              Track Order
            </button>
          </form>

          {errorMsg && (
            <p className="text-sm font-semibold text-rose-500 bg-rose-50 p-3 rounded-xl max-w-md mx-auto">
              {errorMsg}
            </p>
          )}
        </div>

        {/* Search Results section */}
        {searchResult && (
          <div className="mt-8 space-y-8">

            {/* 1. Progress Steps Timeline */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-6">
                Laundry Status - Receipt {searchResult.no_struk}
              </h2>

              <div className="relative">
                <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-slate-200 md:left-6 md:right-6 md:top-6 md:h-0.5 md:w-auto"></div>

                <div className="relative flex flex-col md:flex-row justify-between gap-8 md:gap-4 z-10">
                  {trackingSteps.map((step, idx) => {
                    const stepStatus = getStepStatus(idx);

                    return (
                      <div key={idx} className="flex md:flex-col items-start md:items-center text-left md:text-center md:flex-1 group">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-sm border-4 transition-all duration-300 md:mb-4 shrink-0 shadow-sm ${stepStatus === 'completed'
                          ? 'bg-sky-500 border-sky-200 text-white shadow-sky-100'
                          : stepStatus === 'current'
                            ? 'bg-white border-sky-400 text-sky-600 scale-110 shadow-lg shadow-sky-100 ring-4 ring-sky-50'
                            : 'bg-slate-100 border-slate-200 text-slate-400'
                          }`}>
                          {stepStatus === 'completed' ? (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            idx + 1
                          )}
                        </div>

                        <div className="ml-4 md:ml-0 md:px-2">
                          <h3 className={`font-extrabold text-sm ${stepStatus === 'current' ? 'text-sky-600' : 'text-slate-800'
                            }`}>
                            {step.label}
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 2. Order Breakdown and Delivery Option Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm md:col-span-7 space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-800">Order Items</h3>
                  <span className="text-xs font-semibold text-slate-400">
                    Transacted on {new Date(searchResult.tgl_transaksi).toLocaleString()}
                  </span>
                </div>

                <div className="space-y-4">
                  {itemsResult.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-50 pb-3">
                      <div>
                        <span className="font-semibold text-slate-800">{item.nama_layanan}</span>
                        <span className="block text-xs text-slate-400">
                          {item.kuantitas} {item.satuan}
                        </span>
                      </div>
                      <span className="font-bold text-slate-800">
                        IDR {item.total_harga ? item.total_harga.toLocaleString() : '0'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 border-t border-slate-100 pt-4 text-sm">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span>IDR {searchResult.grand_total ? searchResult.grand_total.toLocaleString() : '0'}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>DP Paid</span>
                    <span className="text-emerald-600 font-medium">- IDR {searchResult.dp ? searchResult.dp.toLocaleString() : '0'}</span>
                  </div>
                  <div className="flex justify-between text-lg font-black text-slate-800 border-t border-slate-100 pt-3">
                    <span>Remaining Balance</span>
                    <span className="text-rose-500">IDR {searchResult.sisa ? searchResult.sisa.toLocaleString() : '0'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#E0F7FF] rounded-3xl p-6 border border-sky-100 md:col-span-5 space-y-6">
                <div className="flex justify-between items-center border-b border-sky-200 pb-2">
                  <h3 className="text-base font-bold text-slate-800">Delivery Integration</h3>
                  {!editDelivery && (
                    <button
                      onClick={() => setEditDelivery(true)}
                      className="text-xs font-bold text-sky-600 hover:text-sky-700"
                    >
                      Configure
                    </button>
                  )}
                </div>

                {!editDelivery ? (
                  <div className="space-y-4 text-sm text-slate-700">
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-500">Method:</span>
                      <span className="font-bold text-slate-800">{searchResult.delivery_type}</span>
                    </div>

                    {searchResult.delivery_type === 'Home Delivery' ? (
                      <>
                        <div className="flex justify-between">
                          <span className="font-medium text-slate-500">Delivery Status:</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${searchResult.delivery_status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : searchResult.delivery_status === 'In Transit'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                            }`}>
                            {searchResult.delivery_status}
                          </span>
                        </div>
                        <div className="bg-white/60 p-3 rounded-xl border border-sky-100 text-xs">
                          <span className="font-semibold block text-slate-500 mb-1">Destination Address:</span>
                          <p className="text-slate-700 italic">{searchResult.delivery_address || 'No address provided'}</p>
                        </div>
                      </>
                    ) : (
                      <div className="bg-sky-50/50 p-4 rounded-xl border border-sky-100 text-xs text-sky-800">
                        <span className="font-bold block mb-1">Self Pickup Option</span>
                        You chose to pick up your laundry directly at the branch. We will notify you once it's ready.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4 text-sm">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Choose Delivery Method</label>
                      <select
                        value={deliveryType}
                        onChange={(e) => setDeliveryType(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-sky-200 bg-white text-sm text-slate-800"
                      >
                        <option value="Self Pickup">Self Pickup at Store</option>
                        <option value="Home Delivery">Home Delivery</option>
                      </select>
                    </div>

                    {deliveryType === 'Home Delivery' && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Delivery Address</label>
                          <textarea
                            rows="2"
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            placeholder="Enter delivery destination..."
                            className="w-full px-3 py-2 rounded-xl border border-sky-200 bg-white text-xs text-slate-800"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Simulate Status (Customer / Courier Demo)</label>
                          <select
                            value={deliveryStatus}
                            onChange={(e) => setDeliveryStatus(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-sky-200 bg-white text-sm text-slate-800"
                          >
                            <option value="Not Started">Not Started</option>
                            <option value="In Transit">In Transit (Shipping)</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </div>
                      </>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveDelivery}
                        className="flex-1 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-xs"
                      >
                        Save Configuration
                      </button>
                      <button
                        onClick={() => {
                          setEditDelivery(false);
                          setDeliveryType(searchResult.delivery_type);
                          setDeliveryAddress(searchResult.delivery_address || '');
                          setDeliveryStatus(searchResult.delivery_status || 'Not Started');
                        }}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    }>
      <TrackingContent />
    </Suspense>
  );
}