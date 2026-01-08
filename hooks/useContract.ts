import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';

// Read user stats
export function useUserStats(address: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getUserStats',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

// Read circle details
export function useCircleDetails(circleId: bigint | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getCircleDetails',
    args: circleId !== undefined ? [circleId] : undefined,
    query: {
      enabled: circleId !== undefined && circleId > BigInt(0),
    },
  });
}

// Read user loans
export function useUserLoans(address: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getUserLoans',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

// Read loan details
export function useLoanDetails(loanId: bigint | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getLoanDetails',
    args: loanId !== undefined ? [loanId] : undefined,
    query: {
      enabled: loanId !== undefined && loanId > BigInt(0),
    },
  });
}

// Read contract balance (admin)
export function useContractBalance() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getContractBalance',
  });
}

// Read admin address
export function useAdmin() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'admin',
  });
}

// Read total counts
export function useLoanCount() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'loanCount',
  });
}

export function useCircleCount() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'circleCount',
  });
}

// Write functions
export function useCreateCircle() {
  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createCircle = (name: string, stake: string) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'createCircle',
      args: [name],
      value: parseEther(stake),
    });
  };

  return { createCircle, isPending, isConfirming, isSuccess, hash };
}

export function useJoinCircle() {
  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const joinCircle = (circleId: bigint, stake: string) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'joinCircle',
      args: [circleId],
      value: parseEther(stake),
    });
  };

  return { joinCircle, isPending, isConfirming, isSuccess, hash };
}

export function useRequestLoan() {
  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const requestLoan = (amount: string, purpose: string) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'requestLoan',
      args: [parseEther(amount), purpose],
    });
  };

  return { requestLoan, isPending, isConfirming, isSuccess, hash };
}

export function useRepayLoan() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const repayLoan = (loanId: bigint, amount: string) => {
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'repayLoan',
        args: [loanId],
        value: parseEther(amount),
      });
    } catch (err) {
      console.error('Repay loan error:', err);
    }
  };

  return { repayLoan, isPending, isConfirming, isSuccess, hash, error };
}

// Admin functions
export function useApproveLoan() {
  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const approveLoan = (loanId: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'approveLoan',
      args: [loanId],
    });
  };

  return { approveLoan, isPending, isConfirming, isSuccess, hash };
}

export function useDisburseLoan() {
  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const disburseLoan = (loanId: bigint, amount: string) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'disburseLoan',
      args: [loanId],
      value: parseEther(amount),
    });
  };

  return { disburseLoan, isPending, isConfirming, isSuccess, hash };
}

export function useDepositLiquidity() {
  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const depositLiquidity = (amount: string) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'depositLiquidity',
      value: parseEther(amount),
    });
  };

  return { depositLiquidity, isPending, isConfirming, isSuccess, hash };
}

export function useWithdraw() {
  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const withdraw = (amount: string) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'withdraw',
      args: [parseEther(amount)],
    });
  };

  return { withdraw, isPending, isConfirming, isSuccess, hash };
}

export function useSetDemoMode() {
  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const setDemoMode = (enabled: boolean) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'setDemoMode',
      args: [enabled],
    });
  };

  return { setDemoMode, isPending, isConfirming, isSuccess, hash };
}
// useContract hook
// useContract hook
