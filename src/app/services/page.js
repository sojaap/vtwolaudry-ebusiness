'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ServicesPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPkgTab, setSelectedPkgTab] = useState('LYN001');

  const openPackageModal = (packageType) => {
    setSelectedPkgTab(packageType);
    setIsModalOpen(true);
  };

  const handleChoosePackage = (packageType) => {
    router.push(`/order?package=${packageType}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#ECF9FF] font-sans">
      <Navbar />

      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-16">
        
        {/* Banner Section */}
        <div className="text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-600 block">OUR SERVICES</span>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Services & Pricing Details</h1>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Choose from our structured weekly packages or kiloan laundry services. No hidden costs.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Single Size */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-sky-50 text-sky-500 rounded-2xl">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Single Size</h3>
                  <p className="text-xs text-slate-400">Perfect for single person laundry</p>
                </div>
              </div>
              <ul className="space-y-3.5 mb-8 text-sm text-slate-600 border-t border-slate-100 pt-4">
                <li className="flex items-center gap-2">✓ 2 loads per week</li>
                <li className="flex items-center gap-2">✓ Up to 10 lbs per load</li>
                <li className="flex items-center gap-2">✓ Standard wash, dry, fold</li>
              </ul>
            </div>
            <div>
              <span className="block text-2xl font-black text-slate-800">IDR 50.000,00</span>
              <span className="text-[10px] text-slate-400 block mb-4">Billed weekly</span>
            </div>
          </div>

          {/* Couples Size */}
          <div className="bg-white rounded-3xl p-8 border-2 border-sky-400 shadow-lg flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-sky-500 text-white px-3 py-1 rounded-bl-2xl text-[10px] font-bold uppercase tracking-wider">
              Popular
            </div>
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-sky-500 text-white rounded-2xl">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-850">Couples Size</h3>
                  <p className="text-xs text-sky-600">Great for couples size 2-3</p>
                </div>
              </div>
              <ul className="space-y-3.5 mb-8 text-sm text-slate-650 border-t border-sky-100 pt-4">
                <li className="flex items-center gap-2">✓ 4 loads per week</li>
                <li className="flex items-center gap-2">✓ Up to 12 lbs per load</li>
                <li className="flex items-center gap-2">✓ Special garments treatment</li>
                <li className="flex items-center gap-2">✓ Free pickup & drop off</li>
              </ul>
            </div>
            <div>
              <span className="block text-2xl font-black text-sky-600">IDR 80.000,00</span>
              <span className="text-[10px] text-slate-400 block mb-4">Billed weekly</span>
            </div>
          </div>

          {/* Family Size */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-sky-50 text-sky-500 rounded-2xl">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Family Size</h3>
                  <p className="text-xs text-slate-400">Excellent for families size 4-6</p>
                </div>
              </div>
              <ul className="space-y-3.5 mb-8 text-sm text-slate-650 border-t border-slate-100 pt-4">
                <li className="flex items-center gap-2">✓ 6 loads per week</li>
                <li className="flex items-center gap-2">✓ Up to 15 lbs per load</li>
                <li className="flex items-center gap-2">✓ Special garments & delicate wash</li>
                <li className="flex items-center gap-2">✓ Free detergent samples</li>
              </ul>
            </div>
            <div>
              <span className="block text-2xl font-black text-slate-800">IDR 250.000,00</span>
              <span className="text-[10px] text-slate-400 block mb-4">Billed weekly</span>
            </div>
          </div>
        </div>

        {/* How to Order: Cara Pemakaian Jasa */}
        <div className="bg-[#E0F7FF] rounded-3xl p-8 md:p-12 border border-sky-100 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-sky-600 block">CARA PEMESANAN</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">How to Use VTwo Laundry</h2>
            <p className="text-slate-500 text-sm">Follow these 4 simple steps to submit your laundry care request.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-sky-100 text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold mx-auto">1</div>
              <h3 className="font-bold text-slate-800 text-sm">Calculate Price</h3>
              <p className="text-xs text-slate-400">Select services, packages, and quantities to check costs instantly.</p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-sky-100 text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold mx-auto">2</div>
              <h3 className="font-bold text-slate-800 text-sm">Input Details</h3>
              <p className="text-xs text-slate-400">Provide customer name, contact phone number, and branch store location.</p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-sky-100 text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold mx-auto">3</div>
              <h3 className="font-bold text-slate-800 text-sm">Pick Scent & Deliver</h3>
              <p className="text-xs text-slate-400">Select perfume types and configure delivery option preferences.</p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-sky-100 text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold mx-auto">4</div>
              <h3 className="font-bold text-slate-800 text-sm">Submit & Track</h3>
              <p className="text-xs text-slate-400">Confirm order to generate receipt number, then track progress in real-time.</p>
            </div>
          </div>

          {/* CTA Link (No Login barrier) */}
          <div className="text-center pt-4">
            <Link
              href="/order"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-2xl shadow-md shadow-sky-100 hover:shadow-lg transition-all text-sm"
            >
              Start Order Now
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
