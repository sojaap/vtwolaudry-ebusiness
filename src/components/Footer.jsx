import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#D0F6FF] text-slate-700 py-16 px-4 md:px-8 relative z-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Brand Col */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-sky-400 to-sky-200 text-white font-bold shadow-md shadow-sky-200 group-hover:scale-105 transition-all duration-300">
              <span className="text-lg">V2</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800 group-hover:text-sky-600 transition-colors">
              VTwo <span className="text-sky-500">Laundry</span>
            </span>
          </Link>
          <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
            Professional laundry, dry cleaning, and folding services. Helping you save time and look fresh every single day.
          </p>
          <p className="text-xs text-slate-400 mt-4 font-medium">
            &copy; {new Date().getFullYear()} VTwo Laundry. All rights reserved.
          </p>
        </div>

        {/* About Us Col */}
        <div>
          <h4 className="font-bold text-slate-800 mb-4 uppercase text-xs tracking-wider">About us</h4>
          <ul className="space-y-2.5 text-sm text-slate-600 font-medium">
            <li><Link href="/about" className="hover:text-sky-600">About us</Link></li>
            <li><span className="text-slate-400 cursor-not-allowed">Creators</span></li>
            <li><span className="text-slate-400 cursor-not-allowed">Philosophy</span></li>
            <li><span className="text-slate-450 text-slate-400 cursor-not-allowed font-normal">Contact us</span></li>
          </ul>
        </div>

        {/* Company Col */}
        <div>
          <h4 className="font-bold text-slate-800 mb-4 uppercase text-xs tracking-wider">Company</h4>
          <ul className="space-y-2.5 text-sm text-slate-600 font-medium">
            <li><span className="text-slate-400 cursor-not-allowed">Our team</span></li>
            <li><span className="text-slate-400 cursor-not-allowed">Terms</span></li>
            <li><Link href="/#how-it-works" className="hover:text-sky-600">How it works</Link></li>
            <li><span className="text-slate-400 cursor-not-allowed">Blog</span></li>
          </ul>
        </div>

        {/* Services & Socials */}
        <div>
          <h4 className="font-bold text-slate-800 mb-4 uppercase text-xs tracking-wider">Services</h4>
          <ul className="space-y-2.5 text-sm text-slate-600 font-medium mb-6">
            <li><Link href="/order" className="hover:text-sky-600">Pickup</Link></li>
            <li><Link href="/order" className="hover:text-sky-600">Drop off</Link></li>
            <li><Link href="/services" className="hover:text-sky-600">Laundry Packages</Link></li>
          </ul>
          
          <h4 className="font-bold text-slate-800 mb-3 uppercase text-[10px] tracking-widest">Check us out</h4>
          <div className="flex gap-4">
            <a href="#" className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-sky-655 text-sky-500 hover:bg-sky-600 hover:text-white transition-all shadow-sm">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
              </svg>
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-sky-655 text-sky-500 hover:bg-sky-600 hover:text-white transition-all shadow-sm">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-sky-655 text-sky-500 hover:bg-sky-600 hover:text-white transition-all shadow-sm">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
