'use client';

import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#ECF9FF] font-sans">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-12 sm:px-6 lg:px-8 mb-24">
        
        {/* Banner header from Reference 2 */}
        <div className="relative rounded-3xl overflow-hidden h-[350px] mb-16 shadow-xl border border-slate-100 flex flex-col items-center justify-center text-center px-4 bg-sky-950">
          <Image
            src="/laundromat_interior.png"
            alt="Laundromat Machines"
            fill
            className="object-cover opacity-30"
            priority
          />
          <span className="text-xs font-bold uppercase tracking-widest text-sky-400 mb-2 relative z-10">GET TO KNOW US</span>
          <h1 className="text-4xl md:text-6xl font-black text-white relative z-10 tracking-widest">VTWO LAUNDRY</h1>
        </div>

        {/* Content layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center bg-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-sm">
          {/* Left Description Column */}
          <div className="flex flex-col items-start space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-extrabold text-slate-800">About US</h2>
              <span className="px-3.5 py-1 bg-sky-100 text-sky-700 rounded-full text-xs font-bold uppercase tracking-wider">
                Since 2023
              </span>
            </div>

            <div className="space-y-6 text-slate-600 leading-relaxed text-base">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              </p>
              <p>
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
              </p>
              <p className="font-semibold text-sky-600">
                At VTwo Laundry, we believe in providing top tier washing care. Our team operates standard, state of the art equipment ensuring each garment is pristine, fresh, and meticulously handled.
              </p>
            </div>
          </div>

          {/* Right Image Column */}
          <div className="relative h-[400px] lg:h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-50">
            <Image
              src="/laundromat_about.png"
              alt="Stacked washing machines"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
