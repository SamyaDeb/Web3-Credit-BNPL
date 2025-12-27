'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useAccount } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import {
  useAdmin,
  useContractBalance,
  useLoanCount,
  useCircleCount,
  useLoanDetails,
  useApproveLoan,
  useDisburseLoan,
  useDepositLiquidity,
  useWithdraw,
} from '@/hooks/useContract';

export default function AdminPage() {
  const [isMounted, setIsMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { data: adminAddress } = useAdmin();
  const { data: contractBalance, refetch: refetchBalance } = useContractBalance();
  const { data: loanCount, refetch: refetchCount } = useLoanCount();
  const { data: circleCount } = useCircleCount();

  const isAdmin = address && adminAddress && address.toLowerCase() === adminAddress.toLowerCase();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      refetchCount();
      refetchBalance();
    }, 5000);
    return () => clearInterval(interval);
  }, [refetchCount, refetchBalance]);

  // Generate loan IDs for iteration
  const loanIds = loanCount ? Array.from({ length: Number(loanCount) }, (_, i) => i + 1) : [];

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Orange Glow from Upper Left */}
        <div
          className="absolute top-0 left-0 w-[800px] h-[800px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle at top left, rgba(255,100,40,0.3) 0%, rgba(255,80,30,0.15) 25%, transparent 60%)',
            filter: 'blur(80px)',
          }}
        />
        {/* Orange Glow from Upper Right */}
        <div
          className="absolute top-0 right-0 w-[800px] h-[800px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle at top right, rgba(255,100,40,0.3) 0%, rgba(255,80,30,0.15) 25%, transparent 60%)',
            filter: 'blur(80px)',
          }}
        />
        <Navbar />
        <div className="flex items-center justify-center relative z-10" style={{ minHeight: 'calc(100vh - 4rem)' }}>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 text-center border border-white/20 max-w-md">
            <h1 className="text-3xl font-bold text-white mb-4">Admin Panel</h1>
            <p className="text-white/80 mb-6">Connect your wallet to access the admin dashboard</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Orange Glow from Upper Left */}
        <div
          className="absolute top-0 left-0 w-[800px] h-[800px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle at top left, rgba(255,100,40,0.3) 0%, rgba(255,80,30,0.15) 25%, transparent 60%)',
            filter: 'blur(80px)',
          }}
        />
        {/* Orange Glow from Upper Right */}
        <div
          className="absolute top-0 right-0 w-[800px] h-[800px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle at top right, rgba(255,100,40,0.3) 0%, rgba(255,80,30,0.15) 25%, transparent 60%)',
            filter: 'blur(80px)',
          }}
        />
        <Navbar />
        <div className="flex items-center justify-center relative z-10" style={{ minHeight: 'calc(100vh - 4rem)' }}>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 text-center border border-white/20 max-w-md">
            <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-white/80 mb-6">You are not authorized to access this page.</p>
            <p className="text-sm text-white/60 mb-6">Connected: {address}</p>
          </div>
        </div>
      </div>
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
        {/* Orange Glows - Upper Left Corner */}
        <div
          className="absolute -top-32 -left-32 w-[700px] h-[700px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255,100,40,0.35) 0%, rgba(255,80,30,0.2) 20%, rgba(255,60,20,0.1) 40%, transparent 65%)',
            filter: 'blur(80px)',
            zIndex: 1,
          }}
        />
        {/* Orange Glows - Upper Right Corner */}
        <div
          className="absolute -top-32 -right-32 w-[700px] h-[700px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255,100,40,0.35) 0%, rgba(255,80,30,0.2) 20%, rgba(255,60,20,0.1) 40%, transparent 65%)',
            filter: 'blur(80px)',
            zIndex: 1,
          }}
        />
        {/* Random Glows Throughout Page */}
        <div
          className="absolute top-[25%] left-[15%] w-[450px] h-[450px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255,100,40,0.22) 0%, rgba(255,80,30,0.12) 25%, transparent 60%)',
            filter: 'blur(65px)',
            zIndex: 1,
          }}
        />
        <div
          className="absolute top-[40%] right-[10%] w-[550px] h-[550px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255,100,40,0.28) 0%, rgba(255,80,30,0.15) 25%, transparent 60%)',
            filter: 'blur(70px)',
            zIndex: 1,
          }}
        />
        <div
          className="absolute top-[60%] left-[5%] w-[380px] h-[380px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255,100,40,0.18) 0%, rgba(255,80,30,0.1) 25%, transparent 60%)',
            filter: 'blur(55px)',
            zIndex: 1,
          }}
        />
        <div
          className="absolute top-[15%] right-[35%] w-[420px] h-[420px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255,100,40,0.2) 0%, rgba(255,80,30,0.11) 25%, transparent 60%)',
            filter: 'blur(60px)',
            zIndex: 1,
          }}
        />
        <div
          className="absolute bottom-[15%] left-[45%] w-[500px] h-[500px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255,100,40,0.25) 0%, rgba(255,80,30,0.14) 25%, transparent 60%)',
            filter: 'blur(68px)',
            zIndex: 1,
          }}
        />
        <div
          className="absolute top-[75%] right-[20%] w-[350px] h-[350px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255,100,40,0.16) 0%, rgba(255,80,30,0.09) 25%, transparent 60%)',
            filter: 'blur(52px)',
            zIndex: 1,
          }}
        />
        <div
          className="absolute top-[50%] left-[30%] w-[480px] h-[480px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255,100,40,0.24) 0%, rgba(255,80,30,0.13) 25%, transparent 60%)',
            filter: 'blur(64px)',
            zIndex: 1,
          }}
        />
        <div
          className="absolute bottom-[5%] right-[8%] w-[400px] h-[400px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255,100,40,0.19) 0%, rgba(255,80,30,0.1) 25%, transparent 60%)',
            filter: 'blur(58px)',
            zIndex: 1,
          }}
        />

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

        <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative" style={{ paddingTop: '180px', zIndex: 10 }}>
        
        {/* Contract Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatCard 
            title="Contract Balance" 
            value={contractBalance ? `${formatEther(contractBalance)} POL` : '0 POL'}
            description="Available liquidity"
          />
          <StatCard 
            title="Total Loans" 
            value={loanCount ? Number(loanCount).toString() : '0'}
            description="All-time loan requests"
          />
          <StatCard 
            title="Trust Circles" 
            value={circleCount ? Number(circleCount).toString() : '0'}
            description="Active circles"
          />
        </div>

        {/* Liquidity Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <DepositLiquidityForm onSuccess={() => refetchBalance()} />
          <WithdrawForm onSuccess={() => refetchBalance()} />
        </div>

        {/* Loan Management */}
        <div className="mb-6">
          <PendingApprovals loanIds={loanIds} onSuccess={() => {
            refetchCount();
            refetchBalance();
          }} />
        </div>

        {/* All Loans Table */}
        <div className="mb-[100px]">
          <AllLoansTable loanIds={loanIds} />
        </div>

      </main>
      </div>
    </>
  );
}

// Stat Card Component
function StatCard({ title, value, description }: { title: string; value: string; description: string }) {
  // Map each card to a color
  const colorMap: { [key: string]: string } = {
    'Contract Balance': 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    'Total Loans': 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
    'Trust Circles': 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
  };

  const colorClass = colorMap[title] || 'from-blue-500/20 to-blue-600/20 border-blue-500/30';

  return (
    <div className={`bg-gradient-to-br ${colorClass} backdrop-blur-md rounded-lg p-6 border`}>
      <h3 className="text-white/70 text-base mb-2">{title}</h3>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-white/50 text-xs">{description}</p>
    </div>
  );
}

// Deposit Liquidity Form
function DepositLiquidityForm({ onSuccess }: { onSuccess: () => void }) {
  const [amount, setAmount] = useState('');
  const { depositLiquidity, isPending, isSuccess } = useDepositLiquidity();

  useEffect(() => {
    if (isSuccess) {
      setAmount('');
      onSuccess();
      alert('Liquidity deposited!');
    }
  }, [isSuccess, onSuccess]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    depositLiquidity(amount);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">Deposit Liquidity</h3>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter POL amount"
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
        />
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-white/90 hover:bg-white text-black py-3 rounded-lg font-semibold transition disabled:opacity-50"
        >
          {isPending ? 'Depositing...' : 'Deposit'}
        </button>
      </form>
    </div>
  );
}

// Withdraw Form
function WithdrawForm({ onSuccess }: { onSuccess: () => void }) {
  const [amount, setAmount] = useState('');
  const { withdraw, isPending, isSuccess } = useWithdraw();

  useEffect(() => {
    if (isSuccess) {
      setAmount('');
      onSuccess();
      alert('Withdrawal successful!');
    }
  }, [isSuccess, onSuccess]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    withdraw(amount);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">Withdraw Funds</h3>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter POL amount"
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
        />
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-red-500/90 hover:bg-red-500 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
        >
          {isPending ? 'Withdrawing...' : 'Withdraw'}
        </button>
      </form>
    </div>
  );
}

// Pending Approvals
function PendingApprovals({ loanIds, onSuccess }: { loanIds: number[]; onSuccess: () => void }) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">Pending Approvals</h3>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {loanIds.length === 0 ? (
          <p className="text-white/60 text-center py-8 text-sm">No loans yet</p>
        ) : (
          loanIds.map(id => <PendingLoanCard key={id} loanId={id} onSuccess={onSuccess} />)
        )}
      </div>
    </div>
  );
}

function PendingLoanCard({ loanId, onSuccess }: { loanId: number; onSuccess: () => void }) {
  const { data: loanDetails, refetch } = useLoanDetails(BigInt(loanId));
  const { approveLoan, isPending, isSuccess, isConfirming } = useApproveLoan();

  useEffect(() => {
    if (isSuccess) {
      // Wait a bit before refreshing to let blockchain update
      setTimeout(() => {
        refetch();
        onSuccess();
      }, 2000);
    }
  }, [isSuccess, onSuccess, refetch]);

  if (!loanDetails || loanDetails[4]) return null; // Skip if approved

  const handleApprove = () => {
    approveLoan(BigInt(loanId));
  };

  // Show approved state temporarily before component unmounts
  const showApproved = isSuccess || loanDetails[4];

  return (
    <div className="bg-white/5 p-3 rounded-lg border border-white/10">
      <div className="flex justify-between items-center mb-2">
        <p className="text-white font-semibold text-base">Loan {loanId}</p>
        <p className="text-white text-base">{formatEther(loanDetails[1])} POL</p>
      </div>
      <p className="text-white/60 text-sm mb-3 truncate">{loanDetails[7]}</p>
      <button
        onClick={handleApprove}
        disabled={isPending || isConfirming || showApproved}
        className={`w-full py-2 rounded-lg font-medium text-sm transition ${
          showApproved 
            ? 'bg-gray-500 text-white cursor-not-allowed' 
            : 'bg-green-500/90 hover:bg-green-500 text-white disabled:opacity-50'
        }`}
      >
        {showApproved ? '✓ Approved & Disbursed' : isPending || isConfirming ? 'Approving...' : 'Approve & Send'}
      </button>
    </div>
  );
}

// Approved Loans
function ApprovedLoans({ loanIds, onSuccess }: { loanIds: number[]; onSuccess: () => void }) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">Ready to Disburse</h3>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {loanIds.length === 0 ? (
          <p className="text-white/60 text-center py-8 text-sm">No loans yet</p>
        ) : (
          loanIds.map(id => <ApprovedLoanCard key={id} loanId={id} onSuccess={onSuccess} />)
        )}
      </div>
    </div>
  );
}

function ApprovedLoanCard({ loanId, onSuccess }: { loanId: number; onSuccess: () => void }) {
  const { data: loanDetails } = useLoanDetails(BigInt(loanId));
  const { disburseLoan, isPending, isSuccess } = useDisburseLoan();

  useEffect(() => {
    if (isSuccess) {
      onSuccess();
      alert(`Loan ${loanId} disbursed!`);
    }
  }, [isSuccess, onSuccess, loanId]);

  if (!loanDetails || !loanDetails[4] || loanDetails[5]) return null; // Skip if not approved or already disbursed

  const amount = formatEther(loanDetails[1]);

  return (
    <div className="bg-white/5 p-3 rounded-lg border border-white/10">
      <div className="flex justify-between items-center mb-2">
        <p className="text-white font-semibold text-sm">Loan {loanId}</p>
        <p className="text-white text-sm">{amount} POL</p>
      </div>
      <p className="text-white/60 text-xs mb-3 truncate">{loanDetails[7]}</p>
      <button
        onClick={() => disburseLoan(BigInt(loanId), amount)}
        disabled={isPending}
        className="w-full bg-blue-500/90 hover:bg-blue-500 text-white py-2 rounded-lg font-medium text-sm transition disabled:opacity-50"
      >
        {isPending ? 'Disbursing...' : 'Disburse'}
      </button>
    </div>
  );
}

// All Loans Table
function AllLoansTable({ loanIds }: { loanIds: number[] }) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">All Loans</h3>
      
      {loanIds.length === 0 ? (
        <p className="text-white/60 text-center py-8">No loans yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-white/60 pb-3">ID</th>
                <th className="text-left text-white/60 pb-3">Borrower</th>
                <th className="text-left text-white/60 pb-3">Amount</th>
                <th className="text-left text-white/60 pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loanIds.map(id => (
                <LoanRow key={id} loanId={id} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function LoanRow({ loanId }: { loanId: number }) {
  const { data: loanDetails } = useLoanDetails(BigInt(loanId));

  if (!loanDetails) return null;

  return (
    <tr className="border-b border-white/10">
      <td className="py-3 text-white">{loanId}</td>
      <td className="py-3 text-white font-mono text-sm">
        {loanDetails[0].slice(0, 6)}...{loanDetails[0].slice(-4)}
      </td>
      <td className="py-3 text-white">{formatEther(loanDetails[1])} POL</td>
      <td className="py-3 text-white text-sm">
        {loanDetails[6] ? '✓ Repaid' : loanDetails[5] ? '● Disbursed' : loanDetails[4] ? '✓ Approved' : '○ Pending'}
      </td>
    </tr>
  );
}
