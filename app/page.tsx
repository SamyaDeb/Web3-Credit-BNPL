'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useConnect, useAccount } from 'wagmi';
import { injected } from 'wagmi/connectors';
import Image from 'next/image';
import { getUserFraudProfile } from '@/lib/fraudDatabase';

export default function Home() {
  const pillars = [92, 84, 78, 70, 62, 54, 46, 34, 18, 34, 46, 54, 62, 70, 78, 84, 92];
  const [isMounted, setIsMounted] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { connect } = useConnect();
  const { address, isConnected } = useAccount();

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function checkVerification() {
      if (isConnected && address) {
        setIsLoading(true);
        try {
          const profile = await getUserFraudProfile(address);
          setIsVerified(profile?.isVerified || false);
        } catch (error) {
          console.error('Error checking verification:', error);
        } finally {
          setIsLoading(false);
        }
      }
    }
    checkVerification();
  }, [isConnected, address]);

  const handleGetStarted = () => {
    connect({ connector: injected() });
  };

  return (
    <>
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fadeInUpWithOffset {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(10px);
            }
          }

          @keyframes subtlePulse {
            0%, 100% {
              opacity: 0.8;
              transform: scale(1);
            }
            50% {
              opacity: 1;
              transform: scale(1.03);
            }
          }
          
          .animate-fadeInUp {
            animation: fadeInUp 0.8s ease-out forwards;
          }

          @keyframes floatDots {
            0% {
              transform: translate(0, 0) rotate(0deg);
              opacity: 0.3;
            }
            25% {
              transform: translate(var(--random-x-25), var(--random-y-25)) rotate(90deg);
              opacity: 0.4;
            }
            50% {
              transform: translate(var(--random-x-50), var(--random-y-50)) rotate(180deg);
              opacity: 0.45;
            }
            75% {
              transform: translate(var(--random-x-75), var(--random-y-75)) rotate(270deg);
              opacity: 0.35;
            }
            100% {
              transform: translate(var(--random-x-100), var(--random-y-100)) rotate(360deg);
              opacity: 0.3;
            }
          }

          .floating-dot {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.45);
            box-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
            pointer-events: none;
          }

          /* Hide scrollbar */
          ::-webkit-scrollbar {
            display: none;
          }
          
          html {
            scrollbar-width: none;
            -ms-overflow-style: none;
            scroll-behavior: smooth;
            scroll-padding-top: 0;
          }
          
          body {
            scroll-behavior: smooth;
            overflow-x: hidden;
          }
          
          * {
            scroll-behavior: smooth;
          }
          
          @media (prefers-reduced-motion: no-preference) {
            html {
              scroll-behavior: smooth;
            }
          }
        `}
      </style>

      <section className="relative isolate min-h-screen overflow-hidden bg-black text-white">
        {/* BACKGROUND */}
        <div
          aria-hidden
          className="absolute inset-0 -z-30"
          style={{
            backgroundImage: [
              "radial-gradient(circle at 50% 52%, rgba(255,100,60,0.85) 0%, rgba(255,80,40,0.75) 18%, rgba(240,70,30,0.6) 32%, rgba(200,60,25,0.45) 50%, rgba(150,50,20,0.25) 70%, rgba(0,0,0,0) 100%)",
              "radial-gradient(circle at 14% 0%, rgba(255,90,50,0.85) 0%, rgba(255,75,35,0.75) 15%, rgba(240,65,30,0.6) 30%, rgba(200,55,25,0.3) 50%, rgba(150,45,20,0) 70%)",
              "radial-gradient(circle at 86% 22%, rgba(255,95,55,0.75) 0%, rgba(255,80,40,0.6) 15%, rgba(240,70,35,0.4) 35%, rgba(200,60,30,0) 55%)",
              "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0) 50%)",
            ].join(","),
            backgroundColor: "#000",
            filter: "blur(60px)",
          }}
        />

        <div 
          aria-hidden 
          className="absolute inset-0 -z-20"
          style={{
            background: "radial-gradient(ellipse 100% 80% at 50% 0%, transparent 40%, rgba(0,0,0,0.9) 70%, rgba(0,0,0,1) 100%)",
          }}
        />

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 mix-blend-screen opacity-30"
          style={{
            backgroundImage: [
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.09) 0 1px, transparent 1px 96px)",
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 24px)",
              "repeating-radial-gradient(80% 55% at 50% 52%, rgba(255,255,255,0.08) 0 1px, transparent 1px 120px)"
            ].join(","),
            backgroundBlendMode: "screen",
          }}
        />

        {/* Floating Dots */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden z-5">
          {isMounted && Array.from({ length: 50 }).map((_, i) => {
            const size = Math.random() * 3 + 2.5; // Size between 2.5px and 5.5px
            // Generate random circular paths
            const angle = Math.random() * 360;
            const radius = Math.random() * 300 + 100; // Random radius between 100-400px
            const x25 = Math.cos((angle + 90) * Math.PI / 180) * radius * 0.25;
            const y25 = Math.sin((angle + 90) * Math.PI / 180) * radius * 0.25;
            const x50 = Math.cos((angle + 180) * Math.PI / 180) * radius * 0.5;
            const y50 = Math.sin((angle + 180) * Math.PI / 180) * radius * 0.5;
            const x75 = Math.cos((angle + 270) * Math.PI / 180) * radius * 0.75;
            const y75 = Math.sin((angle + 270) * Math.PI / 180) * radius * 0.75;
            const x100 = Math.cos((angle + 360) * Math.PI / 180) * radius;
            const y100 = Math.sin((angle + 360) * Math.PI / 180) * radius;
            
            return (
              <div
                key={i}
                className="floating-dot"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  '--random-x-25': `${x25}px`,
                  '--random-y-25': `${y25}px`,
                  '--random-x-50': `${x50}px`,
                  '--random-y-50': `${y50}px`,
                  '--random-x-75': `${x75}px`,
                  '--random-y-75': `${y75}px`,
                  '--random-x-100': `${x100}px`,
                  '--random-y-100': `${y100}px`,
                  animation: `floatDots ${Math.random() * 25 + 20}s linear infinite`,
                  animationDelay: `${-Math.random() * 45}s`,
                } as React.CSSProperties}
              />
            );
          })}
        </div>

        {/* NAVBAR */}
        <Navbar />

        {/* CONTENT */}
        <main className="relative z-10 mx-auto grid w-full max-w-5xl place-items-center px-6 py-16 md:py-24 lg:py-28 translate-y-[70px]">
          <div className={`mx-auto text-center ${isMounted ? 'animate-fadeInUp' : 'opacity-0'}`}>
            <h2
               style={{ animationDelay: '200ms' }}
               className={`text-4xl text-white/90 font-semibold tracking-tight md:text-7xl text-white mb-4 leading-tight ${isMounted ? 'animate-fadeInUp' : "opacity-0"}`}
            >
               Easy Loans For Everyone, Anywhere.
            </h2>

            <p 
              style={{ animationDelay: '300ms', fontSize: '3.5rem' }} 
              className={"md:text-5xl lg:text-[3.5rem] text-white/90 italic mb-8 max-w-4xl font-normal mx-auto -translate-x-[14px] translate-y-[15px]" }
            >
              Seamlesly On Polygon.
            </p>

            <p 
              style={{ animationDelay: '400ms', animation: isMounted ? 'fadeInUpWithOffset 0.8s ease-out forwards' : 'none' }} 
              className={`text-white/70 text-lg md:text-2xl mb-12 max-w-2xl leading-relaxed font-normal mx-auto ${isMounted ? '' : 'opacity-0'}`}
            >
              No Banks. No delays. Just instant,<br />on-chain transaction.
            </p>

            <a
              href={isVerified ? "/user" : "/kyc-verify"}
              style={{ animationDelay: '500ms' }}
              className={`group relative inline-flex items-center justify-center whitespace-nowrap bg-white text-black font-medium px-8 py-3 h-12 rounded-full transition-all duration-200 overflow-hidden mx-auto hover:scale-105 cursor-pointer ${isMounted ? 'animate-fadeInUp' : 'opacity-0'}`}
            >
              <div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]">
                <div className="absolute aspect-square bg-gradient-to-l from-[#FF0000] to-transparent animate-border-orbit opacity-90" style={{ width: '51px', offsetPath: 'rect(0px auto auto 0px round 40px)' }}></div>
              </div>
              <span className="relative z-10 text-lg font-medium flex items-center gap-2">
                {isLoading ? '⏳ Loading...' : isVerified ? '🚀 Get Started' : '📸 Verify KYC'}
              </span>
            </a>

            <h3 
              style={{ animationDelay: '450ms' }}
              className={`text-center text-sm font-semibold text-white/70 mt-[50px] ${isMounted ? 'animate-fadeInUp' : 'opacity-0'}`}
            >
              TRUSTED BY LEADING COMMUNITIES
            </h3>

            {/* Logos Section */}
            <div 
              style={{ animationDelay: '700ms' }}
              className={`flex items-center justify-center gap-[40px] mt-8 ${isMounted ? 'animate-fadeInUp' : 'opacity-0'}`}
            >
              <Image 
                src="/images/Polygon.png" 
                alt="Polygon" 
                width={45} 
                height={45}
                className="opacity-70 hover:opacity-100 transition-opacity duration-300"
              />
              <Image 
                src="/images/MetaMask.png" 
                alt="MetaMask" 
                width={45} 
                height={45}
                className="opacity-70 hover:opacity-100 transition-opacity duration-300"
              />
              <Image 
                src="/images/WalletConnect.png" 
                alt="WalletConnect" 
                width={45} 
                height={45}
                className="opacity-70 hover:opacity-100 transition-opacity duration-300"
              />
            </div>
          </div>
        </main>

        {/* FOREGROUND */}
        <div className="pointer-events-none absolute inset-x-0 bottom-[-70px] z-0 h-[54vh]">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex h-full items-end gap-px px-[2px]">
            {pillars.map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-black transition-all duration-1000 ease-in-out"
                style={{
                  height: isMounted ? `${h}%` : '0%',
                  transitionDelay: `${Math.abs(i - Math.floor(pillars.length / 2)) * 45}ms`
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* BLACK SECTION */}
      <section id="about" className="relative bg-black min-h-screen overflow-hidden">
        {/* Floating Dots for Black Section */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: 5 }}>
          {isMounted && Array.from({ length: 50 }).map((_, i) => {
            const size = Math.random() * 3 + 2.5;
            const angle = Math.random() * 360;
            const radius = Math.random() * 300 + 100;
            const x25 = Math.cos((angle + 90) * Math.PI / 180) * radius * 0.25;
            const y25 = Math.sin((angle + 90) * Math.PI / 180) * radius * 0.25;
            const x50 = Math.cos((angle + 180) * Math.PI / 180) * radius * 0.5;
            const y50 = Math.sin((angle + 180) * Math.PI / 180) * radius * 0.5;
            const x75 = Math.cos((angle + 270) * Math.PI / 180) * radius * 0.75;
            const y75 = Math.sin((angle + 270) * Math.PI / 180) * radius * 0.75;
            const x100 = Math.cos((angle + 360) * Math.PI / 180) * radius;
            const y100 = Math.sin((angle + 360) * Math.PI / 180) * radius;
            return (
              <div
                key={`black-section-${i}`}
                className="floating-dot"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  '--random-x-25': `${x25}px`,
                  '--random-y-25': `${y25}px`,
                  '--random-x-50': `${x50}px`,
                  '--random-y-50': `${y50}px`,
                  '--random-x-75': `${x75}px`,
                  '--random-y-75': `${y75}px`,
                  '--random-x-100': `${x100}px`,
                  '--random-y-100': `${y100}px`,
                  animation: `floatDots ${Math.random() * 25 + 20}s linear infinite`,
                  animationDelay: `${-Math.random() * 45}s`,
                } as React.CSSProperties}
              />
            );
          })}
        </div>
        
        {/* HOW IT WORKS SECTION */}
        <div className="relative text-white pt-[70px]" style={{ zIndex: 10 }}>
          <div className="mx-auto max-w-[1300px] px-6">
            <h1 
              style={{ animationDelay: '800ms', lineHeight: 'calc(1.2 - 3px)' }}
              className={`text-3xl md:text-4xl lg:text-5xl font-normal text-center mb-4 ${isMounted ? 'animate-fadeInUp' : 'opacity-0'}`}
            >
              <span className="text-5xl text-white/80">How It Works</span>
            </h1>
            
            <p 
              style={{ animationDelay: '900ms' }}
              className={`text-white/70 text-2xl font-normal text-center mt-[20px] ${isMounted ? 'animate-fadeInUp' : 'opacity-0'}`}
            >
              Experience seamless lending in simple steps on the Polygon blockchain.
            </p>

            {/* Three Cards Section */}
            <div className="grid md:grid-cols-3 gap-8 mt-[50px]">
              {/* Card 1 */}
              <div 
                style={{ animationDelay: '1000ms' }}
                className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col relative group overflow-hidden shadow-xl hover:shadow-[0_0_30px_rgba(192,192,192,0.2)] h-full ${isMounted ? 'animate-fadeInUp' : 'opacity-0'}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-[#C0C0C0]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-black/30 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-[#C0C0C0]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text w-8 h-8 text-[#C0C0C0] group-hover:text-white transition-colors duration-300">
                      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                      <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                      <path d="M10 9H8"></path>
                      <path d="M16 13H8"></path>
                      <path d="M16 17H8"></path>
                    </svg>
                  </div>
                  <span className="text-sm bg-gradient-to-r from-[#C0C0C0] to-white bg-clip-text text-transparent font-medium">Step 1</span>
                </div>
                <h3 className="text-2xl font-medium mb-4 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-t group-hover:from-white group-hover:to-[#C0C0C0] transition-colors duration-300">Connect Wallet</h3>
                <p className="text-white/70 leading-relaxed mb-6 font-normal text-sm">Start your journey by securely linking your Polygon wallet. Zentra uses your wallet as your identity-no sign-ups or passwords.</p>
                <ul className="space-y-3 mb-6 flex-grow">
                  <li className="flex items-center text-xs text-white/70">
                    <div className="w-1.5 h-1.5 bg-[#C0C0C0]/70 rounded-full mr-3 flex-shrink-0"></div>
                    <span className="font-normal">One-click wallet connect</span>
                  </li>
                  <li className="flex items-center text-xs text-white/70">
                    <div className="w-1.5 h-1.5 bg-[#C0C0C0]/70 rounded-full mr-3 flex-shrink-0"></div>
                    <span className="font-normal">Detects Polygon network</span>
                  </li>
                  <li className="flex items-center text-xs text-white/70">
                    <div className="w-1.5 h-1.5 bg-[#C0C0C0]/70 rounded-full mr-3 flex-shrink-0"></div>
                    <span className="font-normal">Instant identity setup</span>
                  </li>
                  <li className="flex items-center text-xs text-white/70">
                    <div className="w-1.5 h-1.5 bg-[#C0C0C0]/70 rounded-full mr-3 flex-shrink-0"></div>
                    <span className="font-normal">Secure on-chain access</span>
                  </li>
                  <li className="flex items-center text-xs text-white/70">
                    <div className="w-1.5 h-1.5 bg-[#C0C0C0]/70 rounded-full mr-3 flex-shrink-0"></div>
                    <span className="font-normal">Unlocks user dashboard</span>
                  </li>
                </ul>
                <div className="mt-auto pt-4">
                  <div className="flex items-center justify-center" style={{ opacity: 0.5 }}>
                    <div className="w-12 h-0.5 bg-gradient-to-r from-[#C0C0C0] to-transparent rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div 
                style={{ animationDelay: '1100ms' }}
                className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col relative group overflow-hidden shadow-xl hover:shadow-[0_0_30px_rgba(192,192,192,0.2)] h-full ${isMounted ? 'animate-fadeInUp' : 'opacity-0'}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-[#C0C0C0]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-black/30 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-[#C0C0C0]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield w-8 h-8 text-[#C0C0C0] group-hover:text-white transition-colors duration-300">
                      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
                    </svg>
                  </div>
                  <span className="text-sm bg-gradient-to-r from-[#C0C0C0] to-white bg-clip-text text-transparent font-medium">Step 2</span>
                </div>
                <h3 className="text-2xl font-medium mb-4 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-t group-hover:from-white group-hover:to-[#C0C0C0] transition-colors duration-300">Request Your Loan</h3>
                <p className="text-white/70 leading-relaxed mb-6 font-normal text-sm">Submit a loan request within seconds. No paperwork, no delays-just fast, transparent, blockchain-powered lending.</p>
                <ul className="space-y-3 mb-6 flex-grow">
                  <li className="flex items-center text-xs text-white/70">
                    <div className="w-1.5 h-1.5 bg-[#C0C0C0]/70 rounded-full mr-3 flex-shrink-0"></div>
                    <span className="font-normal">Enter loan amount</span>
                  </li>
                  <li className="flex items-center text-xs text-white/70">
                    <div className="w-1.5 h-1.5 bg-[#C0C0C0]/70 rounded-full mr-3 flex-shrink-0"></div>
                    <span className="font-normal">Submit on-chain request</span>
                  </li>
                  <li className="flex items-center text-xs text-white/70">
                    <div className="w-1.5 h-1.5 bg-[#C0C0C0]/70 rounded-full mr-3 flex-shrink-0"></div>
                    <span className="font-normal">No bank checks</span>
                  </li>
                  <li className="flex items-center text-xs text-white/70">
                    <div className="w-1.5 h-1.5 bg-[#C0C0C0]/70 rounded-full mr-3 flex-shrink-0"></div>
                    <span className="font-normal">Appears for review</span>
                  </li>
                  <li className="flex items-center text-xs text-white/70">
                    <div className="w-1.5 h-1.5 bg-[#C0C0C0]/70 rounded-full mr-3 flex-shrink-0"></div>
                    <span className="font-normal">Fully decentralized processing</span>
                  </li>
                </ul>
                <div className="mt-auto pt-4">
                  <div className="flex items-center justify-center" style={{ opacity: 0.5 }}>
                    <div className="w-12 h-0.5 bg-gradient-to-r from-[#C0C0C0] to-transparent rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div 
                style={{ animationDelay: '1200ms' }}
                className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col relative group overflow-hidden shadow-xl hover:shadow-[0_0_30px_rgba(192,192,192,0.2)] h-full ${isMounted ? 'animate-fadeInUp' : 'opacity-0'}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-[#C0C0C0]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-black/30 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-[#C0C0C0]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-square-pen w-8 h-8 text-[#C0C0C0] group-hover:text-white transition-colors duration-300">
                      <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"></path>
                    </svg>
                  </div>
                  <span className="text-sm bg-gradient-to-r from-[#C0C0C0] to-white bg-clip-text text-transparent font-medium">Step 3</span>
                </div>
                <h3 className="text-2xl font-medium mb-4 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-t group-hover:from-white group-hover:to-[#C0C0C0] transition-colors duration-300">Repay & Earn Rewards</h3>
                <p className="text-white/70 leading-relaxed mb-6 font-normal text-sm">Complete repayments with ease and earn reward points that grow your trust and help unlock better borrowing terms.</p>
                <ul className="space-y-3 mb-6 flex-grow">
                  <li className="flex items-center text-xs text-white/70">
                    <div className="w-1.5 h-1.5 bg-[#C0C0C0]/70 rounded-full mr-3 flex-shrink-0"></div>
                    <span className="font-normal">Repay anytime easily</span>
                  </li>
                  <li className="flex items-center text-xs text-white/70">
                    <div className="w-1.5 h-1.5 bg-[#C0C0C0]/70 rounded-full mr-3 flex-shrink-0"></div>
                    <span className="font-normal">On-chain confirmation</span>
                  </li>
                  <li className="flex items-center text-xs text-white/70">
                    <div className="w-1.5 h-1.5 bg-[#C0C0C0]/70 rounded-full mr-3 flex-shrink-0"></div>
                    <span className="font-normal">Earn +10 reward points</span>
                  </li>
                  <li className="flex items-center text-xs text-white/70">
                    <div className="w-1.5 h-1.5 bg-[#C0C0C0]/70 rounded-full mr-3 flex-shrink-0"></div>
                    <span className="font-normal">Grow borrowing score</span>
                  </li>
                  <li className="flex items-center text-xs text-white/70">
                    <div className="w-1.5 h-1.5 bg-[#C0C0C0]/70 rounded-full mr-3 flex-shrink-0"></div>
                    <span className="font-normal">Track progress instantly</span>
                  </li>
                </ul>
                <div className="mt-auto pt-4">
                  <div className="flex items-center justify-center" style={{ opacity: 0.5 }}>
                    <div className="w-12 h-0.5 bg-gradient-to-r from-[#C0C0C0] to-transparent rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
// Home page
