'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';

export default function Home() {
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

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Hero */}
          <div className="flex flex-col items-start space-y-6">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-700 tracking-wide">
              20% Discount for 3 Times Transaction
            </span>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-800 leading-tight">
              Laundry today or <br />
              <span className="text-sky-500">Naked tomorrow.</span>
            </h1>

            <p className="text-slate-500 text-lg max-w-lg leading-relaxed">
              VTwo Laundry service will wash, dry, and fold your laundry at an affordable price. 
              Pickup and drop-off options available!
            </p>

            <Link
              href="/order"
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-bold rounded-full text-white bg-sky-400 hover:bg-sky-500 shadow-lg shadow-sky-200 transition-all hover:-translate-y-0.5"
            >
              Try Our Service Now!
            </Link>

            {/* Stats */}
            <div className="pt-8 flex items-center space-x-12 border-t border-slate-100 w-full sm:w-auto">
              <div>
                <span className="block text-3xl font-black text-slate-800">18m+</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-sky-500">Happy Customers</span>
              </div>
              <div className="border-l border-slate-200 h-10"></div>
              <div>
                <span className="block text-3xl font-black text-slate-800">10+</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-sky-500">Years of Experience</span>
              </div>
            </div>
          </div>

          {/* Right Hero Image */}
          <div className="relative h-[350px] md:h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl shadow-sky-100 border-4 border-white">
            <Image
              src="/laundromat_interior.png"
              alt="VTwo Laundry Interior"
              fill
              className="object-cover"
              priority
            />
            {/* Soft gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-sky-950/20 to-transparent"></div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="bg-[#E0F7FF] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-600 block mb-3">
            HOW IT WORKS
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-12">
            Get it done in 4 steps
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center group border border-sky-100/50">
              <div className="w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-500 font-bold mb-6 group-hover:bg-sky-500 group-hover:text-white transition-colors duration-300">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-2">Step 1</span>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Pickup</h3>
              <p className="text-sm text-slate-500">We collect your dirty clothes from your doorstep at your convenient time.</p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center group border border-sky-100/50">
              <div className="w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-500 font-bold mb-6 group-hover:bg-sky-500 group-hover:text-white transition-colors duration-300">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-2">Step 2</span>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Wash & Dry</h3>
              <p className="text-sm text-slate-500">Clothes are separated, treated, washed, and dried with premium products.</p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center group border border-sky-100/50">
              <div className="w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-500 font-bold mb-6 group-hover:bg-sky-500 group-hover:text-white transition-colors duration-300">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-2">Step 3</span>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Fold</h3>
              <p className="text-sm text-slate-500">Every garment is ironed, folded, and packaged meticulously.</p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center group border border-sky-100/50">
              <div className="w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-500 font-bold mb-6 group-hover:bg-sky-500 group-hover:text-white transition-colors duration-300">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-2">Step 4</span>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Delivery</h3>
              <p className="text-sm text-slate-500">We return your clothes fresh and clean back to your hands.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services & Packages Section */}
      <section id="services" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-sky-600 block mb-3">
              SERVICES
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800">
              Services & Packages
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Single Size */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-sky-50 text-sky-500 rounded-2xl">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Single Size</h3>
                    <p className="text-xs text-slate-500 font-medium">Perfect for people who live alone</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">What's Included</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm text-slate-750 text-slate-700 font-medium">
                      <svg className="w-5 h-5 text-sky-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      2 loads per week
                    </li>
                    <li className="flex items-center gap-3 text-sm text-slate-750 text-slate-700 font-medium">
                      <svg className="w-5 h-5 text-sky-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      Up to 10 lbs per load
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <div className="mb-6">
                  <span className="text-2xl font-black text-slate-800">IDR. 50.000,00</span>
                  <span className="text-xs text-slate-500 block mt-1 font-semibold">Billed weekly</span>
                </div>
                <button
                  onClick={() => openPackageModal('LYN001')}
                  className="w-full py-3 px-4 rounded-xl border border-sky-200 bg-sky-50 hover:bg-sky-500 hover:text-white text-sky-600 font-bold transition-all text-sm shadow-sm"
                >
                  Choose Package
                </button>
              </div>
            </div>

            {/* Couples Size (Selected) */}
            <div className="bg-gradient-to-b from-[#E5F7FF] to-white rounded-3xl p-8 border-2 border-sky-400 shadow-2xl hover:shadow-sky-100 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-sky-500 text-white px-4 py-1 rounded-bl-2xl text-xs font-bold uppercase tracking-wider">
                Featured
              </div>
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-sky-500 text-white rounded-2xl shadow-sm">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Couples Size</h3>
                    <p className="text-xs text-sky-700 font-semibold">Perfect for couples size 2-3</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-sky-700 border-b border-sky-100 pb-2">What's Included</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                      <svg className="w-5 h-5 text-sky-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      4 loads per week
                    </li>
                    <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                      <svg className="w-5 h-5 text-sky-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      Up to 12 lbs per load
                    </li>
                    <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                      <svg className="w-5 h-5 text-sky-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      Special garments treatment
                    </li>
                    <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                      <svg className="w-5 h-5 text-sky-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      Pickup & drop off included
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <div className="mb-6">
                  <span className="text-2xl font-black text-sky-600">IDR. 80.000,00</span>
                  <span className="text-xs text-slate-500 block mt-1 font-semibold">Billed weekly</span>
                </div>
                <button
                  onClick={() => openPackageModal('LYN002')}
                  className="w-full py-3.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold transition-all shadow-md shadow-sky-100 hover:shadow-lg text-sm"
                >
                  Choose Package
                </button>
              </div>
            </div>

            {/* Family Size */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-sky-50 text-sky-500 rounded-2xl">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Family Size</h3>
                    <p className="text-xs text-slate-500 font-medium">Perfect for families size 4-6</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">What's Included</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                      <svg className="w-5 h-5 text-sky-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      6 loads per week
                    </li>
                    <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                      <svg className="w-5 h-5 text-sky-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      Up to 15 lbs per load
                    </li>
                    <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                      <svg className="w-5 h-5 text-sky-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      Special garments treatment
                    </li>
                    <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                      <svg className="w-5 h-5 text-sky-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      Pickup & drop off included
                    </li>
                    <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                      <svg className="w-5 h-5 text-sky-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      Free detergent samples
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <div className="mb-6">
                  <span className="text-2xl font-black text-slate-800">IDR. 250.000,00</span>
                  <span className="text-xs text-slate-500 block mt-1 font-semibold">Billed weekly</span>
                </div>
                <button
                  onClick={() => openPackageModal('LYN003')}
                  className="w-full py-3 px-4 rounded-xl border border-sky-200 bg-sky-50 hover:bg-sky-500 hover:text-white text-sky-600 font-bold transition-all text-sm shadow-sm"
                >
                  Choose Package
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Decision Help Banner */}
      <section className="bg-[#E0F7FF] py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl border border-sky-100">
            <div className="flex items-center gap-6">
              {/* Custom CSS Illustration of Thinking Girl */}
              <div className="w-24 h-24 rounded-full bg-sky-50 flex-shrink-0 flex items-center justify-center border-2 border-sky-200 relative overflow-hidden">
                <div className="absolute top-2 w-12 h-12 rounded-full bg-sky-200 border-2 border-sky-400 flex items-center justify-center font-bold text-sky-700 text-2xl">?</div>
                <div className="absolute bottom-0 w-16 h-8 bg-sky-400 rounded-t-full"></div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Hard time deciding what’s best for you?</h3>
                <p className="text-sm text-slate-500">Calculate custom wash sizes and find the absolute best deal.</p>
              </div>
            </div>
            <Link
              href="/order"
              className="px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-2xl transition-all shadow-md flex-shrink-0 text-sm"
            >
              Learn more
            </Link>
          </div>
        </div>
      </section>

      {/* Details Banner: Easy to use */}
      <section className="bg-sky-50 py-20 border-t border-b border-sky-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* Photo side next to text (samping teksnya), keeping layout style */}
          <div className="relative h-[300px] md:h-[400px] w-full rounded-3xl overflow-hidden shadow-xl border-4 border-white">
            <Image
              src="/easy_to_use.png"
              alt="Clean folded laundry clothes"
              fill
              className="object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex flex-col items-start space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-sky-600">GET TO KNOW US</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-800 leading-none">
              EASY <br />
              <span className="text-sky-500">TO USE</span>
            </h2>
            <p className="text-slate-500 text-base max-w-sm leading-relaxed">
              Our streamlined workflows make ordering, drop-off, tracking, and delivery completely seamless. Try it out now.
            </p>
            <Link
              href="/order"
              className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-2xl shadow-md shadow-sky-100 text-sm"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      {/* Interactive Package Details Modal ("gantian sesuai yang dipencet") */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border-2 border-sky-200 text-left space-y-6 relative">
            
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Title */}
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-sky-600 block mb-1">Interactive Details</span>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Select Laundry Package</h3>
              <p className="text-xs text-slate-400 mt-1">Review size features and proceed to our order terminal.</p>
            </div>

            {/* Tabs Selector ("gantian sesuai yang dipencet") */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedPkgTab('LYN001')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  selectedPkgTab === 'LYN001'
                    ? 'bg-white text-sky-600 shadow-sm border border-sky-100'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Single Size
              </button>
              <button
                type="button"
                onClick={() => setSelectedPkgTab('LYN002')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  selectedPkgTab === 'LYN002'
                    ? 'bg-white text-sky-600 shadow-sm border border-sky-100'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Couples Size
              </button>
              <button
                type="button"
                onClick={() => setSelectedPkgTab('LYN003')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  selectedPkgTab === 'LYN003'
                    ? 'bg-white text-sky-600 shadow-sm border border-sky-100'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Family Size
              </button>
            </div>

            {/* Dynamic Package Details Card */}
            <div className="bg-[#E5F7FF] rounded-2xl p-6 border border-sky-100 space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h4 className="text-lg font-bold text-slate-800">
                    {selectedPkgTab === 'LYN001' ? 'Single Size Package' : selectedPkgTab === 'LYN002' ? 'Couples Size Package' : 'Family Size Package'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {selectedPkgTab === 'LYN001'
                      ? 'Ideal for individuals or students living alone. Simple, essential cleaning.'
                      : selectedPkgTab === 'LYN002'
                      ? 'Designed for couples or 2-3 members. Extra loads with premium wash cycles.'
                      : 'Perfect for households of 4-6 members. Comprehensive cleaning with baby-safe care.'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="block text-xl font-black text-sky-600">
                    {selectedPkgTab === 'LYN001' ? 'IDR 50.000' : selectedPkgTab === 'LYN002' ? 'IDR 80.000' : 'IDR 250.000'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase mt-0.5">Billed weekly</span>
                </div>
              </div>

              {/* What's Included Checklist (High contrast!) */}
              <div className="border-t border-sky-200/50 pt-4 space-y-3">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Features Included:</span>
                <ul className="space-y-2.5">
                  {(selectedPkgTab === 'LYN001'
                    ? ['2 loads per week', 'Up to 10 lbs per load', 'Standard wash, dry, and fold cycle']
                    : selectedPkgTab === 'LYN002'
                    ? ['4 loads per week', 'Up to 12 lbs per load', 'Special garments treatment (softener & fabric safeguard)', 'Pickup & home delivery drop-off service included']
                    : ['6 loads per week', 'Up to 15 lbs per load', 'Special garments & delicate wash for premium fabrics', 'Pickup & home delivery drop-off service included', 'Free hypoallergenic baby-friendly detergent samples']
                  ).map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-xs text-slate-800 font-semibold">
                      <svg className="w-4 h-4 text-sky-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => handleChoosePackage(selectedPkgTab)}
                className="flex-grow py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-2xl shadow-md shadow-sky-100 hover:shadow-lg transition-all text-xs text-center"
              >
                Confirm & Proceed to Checkout
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-all text-xs"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
