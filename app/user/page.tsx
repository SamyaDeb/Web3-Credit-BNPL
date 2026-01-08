'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { getUserFraudProfile } from '@/lib/fraudDatabase';
import { syncContractScoreToFraudProfile } from '@/lib/syncContractScore';
import { UserFraudProfile } from '@/lib/types/fraud';

import {
  useUserStats,
  useCircleDetails,
  useUserLoans,
  useRequestLoan,
  useRepayLoan,
  useCreateCircle,
  useJoinCircle,
  useLoanDetails,
  useCircleCount,
} from '@/hooks/useContract';

export default function UserPage() {
  const [isMounted, setIsMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const [fraudProfile, setFraudProfile] = useState<UserFraudProfile | null>(null);
  
  // Fetch user stats
  const { data: userStats, refetch: refetchStats } = useUserStats(address);
  const { data: userLoansData, refetch: refetchLoans } = useUserLoans(address);
  const { data: circleCount } = useCircleCount();
  
  // Get circle ID from user stats
  const userCircleId = userStats && Number(userStats[0]) > 0 ? BigInt(userStats[0]) : undefined;
  
  // Fetch circle details for real-time circle score
  const { data: circleDetails, refetch: refetchCircle } = useCircleDetails(userCircleId);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch fraud profile (without auto-sync to preserve selfie verification score)
  useEffect(() => {
    async function loadProfile() {
      if (address) {
        const profile = await getUserFraudProfile(address);
        setFraudProfile(profile);
      }
    }
    loadProfile();
  }, [address]);

  // Auto refresh with circle details
  useEffect(() => {
    const interval = setInterval(() => {
      refetchStats();
      refetchLoans();
      if (userCircleId) {
        refetchCircle();
      }
      // Refresh fraud profile
      if (address) {
        getUserFraudProfile(address).then(setFraudProfile);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [refetchStats, refetchLoans, refetchCircle, userCircleId, address]);

  // Extract user stats from contract response with real-time circle score
  const stats = userStats ? {
    circleId: Number(userStats[0]),
    individualScore: fraudProfile?.fraudScore || Number(userStats[1]), // Use fraud profile score if available
    finalScore: Number(userStats[2]),
    maxLoanAmount: Number(userStats[3]),
    interestRate: Number(userStats[4]),
    totalBorrowed: userStats[5],
    totalRepaid: userStats[6],
    loansCompleted: Number(userStats[7]),
    hasActiveLoan: userStats[8],
    isActive: userStats[9],
    circleScore: circleDetails && circleDetails[3] ? Number(circleDetails[3]) : 50, // Real-time from circle details
    activeLoan: 0, // Will get from loans
  } : null;

  const loanIds = userLoansData ? userLoansData.map(id => Number(id)) : [];

  if (!isConnected) {
    return (
      <>
        <style>
          {`
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
          `}
        </style>
        <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
          {/* Orange Glows */}
          <div className="absolute -top-32 -left-32 w-[700px] h-[700px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,100,40,0.35) 0%, rgba(255,80,30,0.2) 20%, rgba(255,60,20,0.1) 40%, transparent 65%)', filter: 'blur(80px)', zIndex: 1 }} />
          <div className="absolute -top-32 -right-32 w-[700px] h-[700px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,100,40,0.35) 0%, rgba(255,80,30,0.2) 20%, rgba(255,60,20,0.1) 40%, transparent 65%)', filter: 'blur(80px)', zIndex: 1 }} />
          <div className="absolute top-[25%] left-[15%] w-[450px] h-[450px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,100,40,0.22) 0%, rgba(255,80,30,0.12) 25%, transparent 60%)', filter: 'blur(65px)', zIndex: 1 }} />
          <div className="absolute top-[40%] right-[10%] w-[550px] h-[550px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,100,40,0.28) 0%, rgba(255,80,30,0.15) 25%, transparent 60%)', filter: 'blur(70px)', zIndex: 1 }} />
          <div className="absolute top-[60%] left-[5%] w-[380px] h-[380px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,100,40,0.18) 0%, rgba(255,80,30,0.1) 25%, transparent 60%)', filter: 'blur(55px)', zIndex: 1 }} />
          <div className="absolute top-[15%] right-[35%] w-[420px] h-[420px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,100,40,0.2) 0%, rgba(255,80,30,0.11) 25%, transparent 60%)', filter: 'blur(60px)', zIndex: 1 }} />
          <div className="absolute bottom-[15%] left-[45%] w-[500px] h-[500px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,100,40,0.25) 0%, rgba(255,80,30,0.14) 25%, transparent 60%)', filter: 'blur(68px)', zIndex: 1 }} />
          <div className="absolute top-[75%] right-[20%] w-[350px] h-[350px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,100,40,0.16) 0%, rgba(255,80,30,0.09) 25%, transparent 60%)', filter: 'blur(52px)', zIndex: 1 }} />
          <div className="absolute top-[50%] left-[30%] w-[480px] h-[480px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,100,40,0.24) 0%, rgba(255,80,30,0.13) 25%, transparent 60%)', filter: 'blur(64px)', zIndex: 1 }} />
          <div className="absolute bottom-[5%] right-[8%] w-[400px] h-[400px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,100,40,0.19) 0%, rgba(255,80,30,0.1) 25%, transparent 60%)', filter: 'blur(58px)', zIndex: 1 }} />
          {/* Floating Dots */}
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
                <div key={i} className="floating-dot" style={{ width: `${size}px`, height: `${size}px`, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, '--random-x-25': `${x25}px`, '--random-y-25': `${y25}px`, '--random-x-50': `${x50}px`, '--random-y-50': `${y50}px`, '--random-x-75': `${x75}px`, '--random-y-75': `${y75}px`, '--random-x-100': `${x100}px`, '--random-y-100': `${y100}px`, animation: `floatDots ${Math.random() * 25 + 20}s linear infinite`, animationDelay: `${-Math.random() * 45}s` } as React.CSSProperties} />
              );
            })}
          </div>
          <Navbar />
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 text-center border border-white/20 max-w-md" style={{ zIndex: 10 }}>
            <h1 className="text-3xl font-bold text-white mb-4">User Dashboard</h1>
            <p className="text-white/80 mb-6">Connect your wallet to access your loans</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>
        {`
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
        `}
      </style>
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Orange Glows */}
        <div className="absolute -top-32 -left-32 w-[700px] h-[700px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,100,40,0.35) 0%, rgba(255,80,30,0.2) 20%, rgba(255,60,20,0.1) 40%, transparent 65%)', filter: 'blur(80px)', zIndex: 1 }} />
        <div className="absolute -top-32 -right-32 w-[700px] h-[700px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,100,40,0.35) 0%, rgba(255,80,30,0.2) 20%, rgba(255,60,20,0.1) 40%, transparent 65%)', filter: 'blur(80px)', zIndex: 1 }} />
        <div className="absolute top-[25%] left-[15%] w-[450px] h-[450px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,100,40,0.22) 0%, rgba(255,80,30,0.12) 25%, transparent 60%)', filter: 'blur(65px)', zIndex: 1 }} />
        <div className="absolute top-[40%] right-[10%] w-[550px] h-[550px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,100,40,0.28) 0%, rgba(255,80,30,0.15) 25%, transparent 60%)', filter: 'blur(70px)', zIndex: 1 }} />
        <div className="absolute top-[60%] left-[5%] w-[380px] h-[380px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,100,40,0.18) 0%, rgba(255,80,30,0.1) 25%, transparent 60%)', filter: 'blur(55px)', zIndex: 1 }} />
        <div className="absolute top-[15%] right-[35%] w-[420px] h-[420px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,100,40,0.2) 0%, rgba(255,80,30,0.11) 25%, transparent 60%)', filter: 'blur(60px)', zIndex: 1 }} />
        <div className="absolute bottom-[15%] left-[45%] w-[500px] h-[500px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,100,40,0.25) 0%, rgba(255,80,30,0.14) 25%, transparent 60%)', filter: 'blur(68px)', zIndex: 1 }} />
        <div className="absolute top-[75%] right-[20%] w-[350px] h-[350px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,100,40,0.16) 0%, rgba(255,80,30,0.09) 25%, transparent 60%)', filter: 'blur(52px)', zIndex: 1 }} />
        <div className="absolute top-[50%] left-[30%] w-[480px] h-[480px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,100,40,0.24) 0%, rgba(255,80,30,0.13) 25%, transparent 60%)', filter: 'blur(64px)', zIndex: 1 }} />
        <div className="absolute bottom-[5%] right-[8%] w-[400px] h-[400px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,100,40,0.19) 0%, rgba(255,80,30,0.1) 25%, transparent 60%)', filter: 'blur(58px)', zIndex: 1 }} />
        {/* Floating Dots */}
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
              <div key={i} className="floating-dot" style={{ width: `${size}px`, height: `${size}px`, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, '--random-x-25': `${x25}px`, '--random-y-25': `${y25}px`, '--random-x-50': `${x50}px`, '--random-y-50': `${y50}px`, '--random-x-75': `${x75}px`, '--random-y-75': `${y75}px`, '--random-x-100': `${x100}px`, '--random-y-100': `${y100}px`, animation: `floatDots ${Math.random() * 25 + 20}s linear infinite`, animationDelay: `${-Math.random() * 45}s` } as React.CSSProperties} />
            );
          })}
        </div>
        <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative" style={{ paddingTop: '180px', zIndex: 10 }}>
        
        {/* Trust Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <ScoreCard 
            title="Individual Score" 
            score={stats?.individualScore || 0} 
            color="blue"
            description="Your personal credit score"
          />
          <ScoreCard 
            title="Circle Score" 
            score={stats?.circleScore || 0} 
            color="purple"
            description="Your circle's average"
          />
          <ScoreCard 
            title="Final Trust Score" 
            score={stats?.finalScore || 0} 
            color="orange"
            description="Individual×60% + Circle×40%"
          />
        </div>

        {/* Circle Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <CircleManagement 
            stats={stats}
            circleDetails={circleDetails}
            circleCount={circleCount ? Number(circleCount) : 0}
            onSuccess={() => {
              refetchStats();
              refetchCircle();
            }}
          />
          
          <LoanEligibility stats={stats} />
        </div>

        {/* Loan Request */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <RequestLoanForm
            stats={stats}
            onSuccess={() => {
              refetchStats();
              refetchLoans();
            }}
          />
          
          <ActiveLoan 
            loanIds={loanIds}
            onRepaySuccess={() => {
              refetchStats();
              refetchLoans();
            }}
          />
        </div>

        {/* Loan History */}
        <div className="mb-[100px]">
          <LoanHistory loanIds={loanIds} userAddress={address} />
        </div>

      </main>
      </div>
    </>
  );
}

// Score Card Component
function ScoreCard({ title, score, color, description }: { title: string; score: number; color: string; description: string }) {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} backdrop-blur-md rounded-lg p-6 border`}>
      <h3 className="text-white/70 text-base mb-2">{title}</h3>
      <p className="text-4xl font-bold text-white mb-1">{score}</p>
      <p className="text-white/50 text-xs">{description}</p>
    </div>
  );
}

// Circle Management Component  
function CircleManagement({ stats, circleDetails, circleCount, onSuccess }: any) {
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [circleName, setCircleName] = useState('');
  const [circleIdToJoin, setCircleIdToJoin] = useState('');
  
  const { createCircle, isPending: isCreating, isSuccess: createSuccess } = useCreateCircle();
  const { joinCircle, isPending: isJoining, isSuccess: joinSuccess } = useJoinCircle();

  useEffect(() => {
    if (createSuccess || joinSuccess) {
      onSuccess();
      setShowCreate(false);
      setShowJoin(false);
      setCircleName('');
      setCircleIdToJoin('');
      alert(createSuccess ? 'Circle created!' : 'Joined circle!');
    }
  }, [createSuccess, joinSuccess, onSuccess]);

  const handleCreate = () => {
    if (!circleName.trim()) {
      alert('Please enter a circle name');
      return;
    }
    createCircle(circleName, '0.5');
  };

  const handleJoin = () => {
    if (!circleIdToJoin || Number(circleIdToJoin) <= 0) {
      alert('Please enter a valid circle ID');
      return;
    }
    joinCircle(BigInt(circleIdToJoin), '0.5');
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 h-[220px] flex flex-col">
      <h3 className="text-lg font-bold text-white mb-3">Trust Circle</h3>
      
      {stats?.circleId > 0 ? (
        <>
          <div className="bg-white/5 p-3 rounded-lg flex-1 grid grid-cols-2 gap-3">
            <div>
              <p className="text-white/60 text-sm mb-1">Circle ID</p>
              <p className="text-white text-xl font-bold">{stats.circleId}</p>
            </div>
            
            {circleDetails && (
              <>
                <div>
                  <p className="text-white/60 text-sm mb-1">Circle Score</p>
                  <p className="text-white text-xl font-bold">{Number(circleDetails[3])}</p>
                </div>
                
                <div>
                  <p className="text-white/60 text-sm mb-1">Name</p>
                  <p className="text-white text-base truncate">{circleDetails[0]}</p>
                </div>
                
                <div>
                  <p className="text-white/60 text-sm mb-1">Members</p>
                  <p className="text-white text-base">{Number(circleDetails[2])} / 3</p>
                </div>
              </>
            )}
          </div>
        </>
      ) : (
        <>
          <p className="text-white/60 text-sm mb-3">Join or create a Trust Circle to unlock loans</p>
          
          {!showCreate && !showJoin && (
            <div className="space-y-2 flex-1 flex flex-col justify-center">
              <button
                onClick={() => setShowCreate(true)}
                className="w-full bg-white/90 hover:bg-white text-black py-2 text-sm rounded-lg font-semibold transition"
              >
                Create Circle (0.5 POL)
              </button>
              <button
                onClick={() => setShowJoin(true)}
                className="w-full bg-white/10 hover:bg-white/20 text-white py-2 text-sm rounded-lg font-semibold transition border border-white/20"
              >
                Join Existing Circle
              </button>
              <p className="text-xs text-white/40 text-center mt-1">Total Circles: {circleCount}</p>
            </div>
          )}

          {showCreate && (
            <div className="space-y-2 flex-1 flex flex-col justify-center">
              <input
                type="text"
                value={circleName}
                onChange={(e) => setCircleName(e.target.value)}
                placeholder="Enter circle name"
                className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreate}
                  disabled={isCreating}
                  className="flex-1 bg-white/90 hover:bg-white text-black py-2 text-sm rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
                <button
                  onClick={() => setShowCreate(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 text-sm rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {showJoin && (
            <div className="space-y-2 flex-1 flex flex-col justify-center">
              <input
                type="number"
                value={circleIdToJoin}
                onChange={(e) => setCircleIdToJoin(e.target.value)}
                placeholder="Enter circle ID"
                className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleJoin}
                  disabled={isJoining}
                  className="flex-1 bg-white/90 hover:bg-white text-black py-2 text-sm rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {isJoining ? 'Joining...' : 'Join'}
                </button>
                <button
                  onClick={() => setShowJoin(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 text-sm rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Loan Eligibility Component
function LoanEligibility({ stats }: any) {
  const hasCircle = stats?.circleId > 0;
  
  // Use values directly from contract
  const maxLoan = stats?.maxLoanAmount || 0;
  const interestRate = stats?.interestRate || 0;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 h-[220px] flex flex-col">
      <h3 className="text-lg font-bold text-white mb-3">Loan Eligibility</h3>
      
      {hasCircle ? (
        <>
          <div className="bg-white/5 p-3 rounded-lg flex-1 grid grid-cols-3 gap-3">
            <div>
              <p className="text-white/60 text-sm mb-1">Max Loan</p>
              <p className="text-white text-xl font-bold">{formatEther(BigInt(maxLoan))} POL</p>
            </div>
            
            <div>
              <p className="text-white/60 text-sm mb-1">Interest</p>
              <p className="text-white text-xl font-bold">{interestRate}%</p>
            </div>

            <div>
              <p className="text-white/60 text-sm mb-1">Duration</p>
              <p className="text-white text-base">7 days</p>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white/60 text-sm text-center">Join a Trust Circle to see your eligibility</p>
        </div>
      )}
    </div>
  );
}

// Request Loan Form
function RequestLoanForm({ stats, onSuccess }: any) {
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const { requestLoan, isPending, isSuccess } = useRequestLoan();

  useEffect(() => {
    if (isSuccess) {
      setAmount('');
      setPurpose('');
      onSuccess();
      alert('Loan request submitted!');
    }
  }, [isSuccess, onSuccess]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (!purpose.trim()) {
      alert('Please provide a loan purpose');
      return;
    }
    requestLoan(amount, purpose);
  };

  const hasCircle = stats?.circleId > 0;
  const hasActiveLoan = stats?.hasActiveLoan;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">Request Loan</h3>
      
      {!hasCircle ? (
        <p className="text-white/60 text-center py-8">Join a Trust Circle first</p>
      ) : hasActiveLoan ? (
        <p className="text-white/60 text-center py-8">Repay active loan before requesting new one</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-white/60 mb-2 block">Amount (POL)</label>
            <input
              type="number"
              step="1"
              min="10"
              max="200"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount (10-200)"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
            />
          </div>

          <div>
            <label className="text-sm text-white/60 mb-2 block">Purpose</label>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Why do you need this loan?"
              rows={3}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-white/90 hover:bg-white text-black py-3 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {isPending ? 'Submitting...' : 'Request Loan'}
          </button>
        </form>
      )}
    </div>
  );
}

// Active Loan Component - shows first active loan
function ActiveLoan({ loanIds, onRepaySuccess }: { loanIds: number[]; onRepaySuccess: () => void }) {
  const [activeLoanId, setActiveLoanId] = useState<number | null>(null);

  // Check each loan to find active one
  useEffect(() => {
    if (loanIds.length === 0) {
      setActiveLoanId(null);
      return;
    }
    
    // Start with most recent loan
    const checkLoans = async () => {
      for (const id of [...loanIds].reverse()) {
        // We'll check this in the render
        setActiveLoanId(id);
        break; // Check first one, component will filter
      }
    };
    checkLoans();
  }, [loanIds]);

  const { data: loanDetails, refetch: refetchLoan } = useLoanDetails(activeLoanId ? BigInt(activeLoanId) : undefined);
  const { repayLoan, isPending, isConfirming, isSuccess, error } = useRepayLoan();

  // If this loan isn't active (disbursed but not repaid), don't show it
  const isActiveLoan = loanDetails && loanDetails[4] && loanDetails[5] && !loanDetails[6];

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        refetchLoan();
        onRepaySuccess();
        alert('Loan repaid successfully!');
      }, 2000);
    }
  }, [isSuccess, onRepaySuccess, refetchLoan]);

  useEffect(() => {
    if (error) {
      console.error('Repay loan error:', error);
      alert('Failed to repay loan. Please try again.');
    }
  }, [error]);

  if (!activeLoanId || !loanDetails || !isActiveLoan) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Active Loan</h3>
        <p className="text-white/60 text-center py-8">No active loan</p>
      </div>
    );
  }

  const handleRepay = () => {
    const totalRepayment = formatEther(loanDetails[2]); // totalRepayment includes principal + interest
    
    if (window.confirm(`Repay ${totalRepayment} POL?`)) {
      repayLoan(BigInt(activeLoanId), totalRepayment);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">Active Loan #{activeLoanId}</h3>
      
      <div className="bg-white/5 p-4 rounded-lg mb-4">
        <p className="text-white/60 text-sm mb-1">Loan Amount</p>
        <p className="text-white text-2xl font-bold mb-3">{formatEther(loanDetails[1])} POL</p>
        
        <p className="text-white/60 text-sm mb-1">Total Repayment</p>
        <p className="text-white mb-3 font-bold">{formatEther(loanDetails[2])} POL</p>

        <p className="text-white/60 text-sm mb-1">Purpose</p>
        <p className="text-white text-sm mb-3">{loanDetails[7]}</p>

        <p className="text-white/60 text-sm mb-1">Status</p>
        <p className="text-white text-sm">
          {loanDetails[6] ? '✓ Repaid' : loanDetails[5] ? '● Disbursed' : loanDetails[4] ? '○ Approved' : '○ Pending'}
        </p>
      </div>

      {loanDetails[5] && !loanDetails[6] && (
        <button
          onClick={handleRepay}
          disabled={isPending || isConfirming}
          className="w-full bg-green-500/90 hover:bg-green-500 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isConfirming ? 'Confirming...' : isPending ? 'Processing...' : 'Repay Loan'}
        </button>
      )}
    </div>
  );
}

// Loan History Component
function LoanHistory({ loanIds, userAddress }: { loanIds: number[]; userAddress: `0x${string}` | undefined }) {
  const [refreshKey, setRefreshKey] = useState(0);

  // Auto-refresh loan statuses every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">Loan History</h3>
      
      {loanIds.length === 0 ? (
        <p className="text-white/60 text-center py-8">No loan history</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-white/60 pb-3">ID</th>
                <th className="text-left text-white/60 pb-3">Amount</th>
                <th className="text-left text-white/60 pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loanIds.map(id => (
                <LoanHistoryRow key={`${id}-${refreshKey}`} loanId={id} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function LoanHistoryRow({ loanId }: { loanId: number }) {
  const { data: loanDetails } = useLoanDetails(BigInt(loanId));
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  // Update current time every second to check due status
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!loanDetails) return null;

  // Extract loan data
  const amount = loanDetails[1];
  const dueDate = Number(loanDetails[3]);
  const approved = loanDetails[4];
  const disbursed = loanDetails[5];
  const repaid = loanDetails[6];

  // Determine status with real-time due date checking
  let status = '';
  let statusColor = '';

  if (repaid) {
    status = '✓ Paid';
    statusColor = 'text-green-400';
  } else if (disbursed) {
    // Check if loan is overdue
    if (currentTime > dueDate) {
      status = '⚠ Due';
      statusColor = 'text-red-400';
    } else {
      status = '● Active';
      statusColor = 'text-yellow-400';
    }
  } else if (approved) {
    status = '✓ Approved';
    statusColor = 'text-blue-400';
  } else {
    status = '○ Pending';
    statusColor = 'text-gray-400';
  }

  return (
    <tr className="border-b border-white/10">
      <td className="py-3 text-white">{loanId}</td>
      <td className="py-3 text-white">{formatEther(amount)} POL</td>
      <td className={`py-3 text-sm font-semibold ${statusColor}`}>
        {status}
      </td>
    </tr>
  );
}
// User dashboard
