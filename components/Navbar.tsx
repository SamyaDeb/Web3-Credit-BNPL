'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { useState, useEffect } from 'react';

const ADMIN_ADDRESS = '0x74E36d4A7b33057e3928CE4bf4C8C53A93361C34';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const navbar = document.getElementById('floating-navbar');
      if (navbar) {
        const rect = navbar.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleDashboardClick = () => {
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    const isAdmin = address.toLowerCase() === ADMIN_ADDRESS.toLowerCase();
    router.push(isAdmin ? '/admin' : '/user');
  };

  const handleConnect = () => {
    connect({ connector: injected() });
  };

  const handleDisconnect = () => {
    disconnect();
    router.push('/');
  };

  const isActive = (path: string) => pathname === path;

  const tilt = {
    transform: `translateY(${mousePosition.y * 0.01}px) scale(${1 + Math.abs(mousePosition.y) * 0.00001}) rotate(${mousePosition.x * 0.01}deg)`
  };

  return (
    <div className="absolute top-[25px] left-0 right-0 z-50 py-4 pointer-events-none">
      <div 
        id="floating-navbar"
        className="flex max-w-4xl mx-auto border border-white/20 dark:border-gray-300/20 rounded-3xl bg-white/10 backdrop-blur-md shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(255,255,255,0.1),0px_0px_0px_1px_rgba(255,255,255,0.05)] px-4 py-2 items-center justify-between gap-[3px] relative pointer-events-auto"
      >
        {/* Animated Background */}
        <div 
          className="absolute inset-0 -z-10 bg-gradient-to-r from-white/5 via-gray-100/10 to-white/5 rounded-3xl pointer-events-none"
        />

        {/* Logo */}
        <div className="flex items-center space-x-2 w-[150px] ml-[5px]">
          <img 
            src="/images/Zentra.JPEG" 
            alt="Zentra" 
            width="32" 
            height="32" 
            className="rounded-full"
          />
          <span className="text-xl font-semibold text-white">Zentra</span>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-5 -ml-[10px] relative z-10">
          <button
            onClick={() => router.push('/')}
            className="relative text-white hover:text-white/80 items-center flex space-x-1 transition cursor-pointer"
          >
            <span className="block sm:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </span>
            <span className="hidden sm:block text-base text-white font-medium">Home</span>
          </button>

          <button
            onClick={() => {
              const aboutSection = document.getElementById('about');
              if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            className="relative text-white hover:text-white/80 items-center flex space-x-1 transition cursor-pointer"
            style={{ scrollBehavior: 'smooth' }}
          >
            <span className="block sm:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </span>
            <span className="hidden sm:block text-base text-white font-medium">About</span>
          </button>

          <button
            onClick={handleDashboardClick}
            className="relative text-white hover:text-white/80 items-center flex space-x-1 transition cursor-pointer"
          >
            <span className="block sm:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
              </svg>
            </span>
            <span className="hidden sm:block text-base text-white font-medium">Dashboard</span>
          </button>
        </div>

        {/* Connect Wallet Button */}
        <div className="flex items-center space-x-2 relative z-10">
          {isConnected ? (
            <button
              onClick={handleDisconnect}
              className="group relative flex cursor-pointer items-center justify-center whitespace-nowrap border border-white/10 px-6 py-3 text-white bg-black rounded-[100px] transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px w-[150px] overflow-visible"
            >
              <div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]">
                <div className="absolute aspect-square bg-gradient-to-l from-[#FF0000] to-transparent animate-border-orbit opacity-90" style={{ width: '51px', offsetPath: 'rect(0px auto auto 0px round 40px)' }}></div>
              </div>
              <span className="relative z-20">Disconnect</span>
              <div className="pointer-events-none insert-0 absolute size-full rounded-2xl px-4 py-1.5 text-sm font-medium shadow-[inset_0_-8px_10px_#ffffff1f] transform-gpu transition-all duration-300 ease-in-out group-hover:shadow-[inset_0_-6px_10px_#ffffff3f] group-active:shadow-[inset_0_-10px_10px_#ffffff3f]"></div>
              <div className="pointer-events-none absolute -z-10 bg-black rounded-[100px] inset-[0.05em]"></div>
            </button>
          ) : (
            <button
              onClick={handleConnect}
              className="group relative flex cursor-pointer items-center justify-center whitespace-nowrap border border-white/10 px-6 py-3 text-white bg-black rounded-[100px] transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px w-[150px] overflow-visible"
            >
              <div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]">
                <div className="absolute aspect-square bg-gradient-to-l from-[#FF0000] to-transparent animate-border-orbit opacity-90" style={{ width: '51px', offsetPath: 'rect(0px auto auto 0px round 40px)' }}></div>
              </div>
              <span className="relative z-20">Connect Wallet</span>
              <div className="pointer-events-none insert-0 absolute size-full rounded-2xl px-4 py-1.5 text-sm font-medium shadow-[inset_0_-8px_10px_#ffffff1f] transform-gpu transition-all duration-300 ease-in-out group-hover:shadow-[inset_0_-6px_10px_#ffffff3f] group-active:shadow-[inset_0_-10px_10px_#ffffff3f]"></div>
              <div className="pointer-events-none absolute -z-10 bg-black rounded-[100px] inset-[0.05em]"></div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
// Navbar component
