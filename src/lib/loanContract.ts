import {
  useReadContract,
  useWriteContract,
} from 'wagmi';
import { parseEther } from 'viem';
import type { Address } from 'viem';
import { useState, useEffect } from 'react';

/* ----------------------------------------------------
   Contract Address
---------------------------------------------------- */
export const CONTRACT_ADDRESS: Address =
  '0xa3f87b884347388f59edcc8e229C0BbC1AE821bC';

/* ----------------------------------------------------
   ABI (unchanged)
---------------------------------------------------- */
export const LOAN_CONTRACT_ABI = [
  {
		"inputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			}
		],
		"name": "approveLoan",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "depositLiquidity",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "admin",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "LiquidityDeposited",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "loanId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "borrower",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "LoanApproved",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "loanId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "borrower",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "pointsAwarded",
				"type": "uint256"
			}
		],
		"name": "LoanRepaid",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "loanId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "borrower",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "LoanRequested",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			}
		],
		"name": "repayLoan",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "requestLoan",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	},
	{
		"inputs": [],
		"name": "ADMIN",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getContractBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getLoanCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			}
		],
		"name": "getLoanDetails",
		"outputs": [
			{
				"internalType": "address",
				"name": "borrower",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "approved",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "disbursed",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "repaid",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "borrower",
				"type": "address"
			}
		],
		"name": "hasActiveLoan",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "loans",
		"outputs": [
			{
				"internalType": "address",
				"name": "borrower",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "approved",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "disbursed",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "repaid",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "points",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "REPAYMENT_REWARD_POINTS",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
] as const;

/* ----------------------------------------------------
   Type Definition
---------------------------------------------------- */
export interface Loan {
  borrower: Address;
  amount: bigint;
  approved: boolean;
  disbursed: boolean;
  repaid: boolean;
}

/* ----------------------------------------------------
   REQUEST LOAN
---------------------------------------------------- */
export function useRequestLoan() {
  const {
    writeContract,
    data: hash,
    isPending,
    error,
    isSuccess: isTxSuccess,
  } = useWriteContract();

  const requestLoan = (amount: string) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: LOAN_CONTRACT_ABI,
      functionName: 'requestLoan',
      args: [parseEther(amount)],
    });
  };

  return {
    requestLoan,
    isPending,
    isSuccess: isTxSuccess,
    error,
    hash,
  };
}

/* ----------------------------------------------------
   DEPOSIT LIQUIDITY (Admin Only)
---------------------------------------------------- */
export function useDepositLiquidity() {
  const {
    writeContract,
    data: hash,
    isPending,
    error,
    isSuccess: isTxSuccess,
  } = useWriteContract();

  const depositLiquidity = (amount: string) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: LOAN_CONTRACT_ABI,
      functionName: 'depositLiquidity',
      value: parseEther(amount),
    });
  };

  return {
    depositLiquidity,
    isPending,
    isSuccess: isTxSuccess,
    error,
    hash,
  };
}

/* ----------------------------------------------------
   APPROVE LOAN (Admin Only)
---------------------------------------------------- */
export function useApproveLoan() {
  const {
    writeContract,
    data: hash,
    isPending,
    error,
    isSuccess: isTxSuccess,
  } = useWriteContract();

  const approveLoan = (id: number) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: LOAN_CONTRACT_ABI,
      functionName: 'approveLoan',
      args: [BigInt(id)],
    });
  };

  return {
    approveLoan,
    isPending,
    isSuccess: isTxSuccess,
    error,
    hash,
  };
}

/* ----------------------------------------------------
   REPAY LOAN
---------------------------------------------------- */
export function useRepayLoan() {
  const {
    writeContract,
    data: hash,
    isPending,
    error,
    isSuccess: isTxSuccess,
  } = useWriteContract();

  const repayLoan = (id: number, amount: string) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: LOAN_CONTRACT_ABI,
      functionName: 'repayLoan',
      args: [BigInt(id)],
      value: parseEther(amount),
    });
  };

  return {
    repayLoan,
    isPending,
    isSuccess: isTxSuccess,
    error,
    hash,
  };
}

/* ----------------------------------------------------
   USER POINTS
---------------------------------------------------- */
export function useUserPoints(address: Address | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: LOAN_CONTRACT_ABI,
    functionName: 'points',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  return {
    points: data as bigint | undefined,
    isLoading,
    error,
    refetch,
  };
}

/* ----------------------------------------------------
   LOAN COUNT
---------------------------------------------------- */
export function useLoanCount() {
  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: LOAN_CONTRACT_ABI,
    functionName: 'getLoanCount',
    query: { refetchInterval: 5000 },
  });

  return {
    count: data as bigint | undefined,
    isLoading,
    error,
    refetch,
  };
}

/* ----------------------------------------------------
   GET LOAN DETAILS BY ID
---------------------------------------------------- */
export function useLoanById(id: number | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: LOAN_CONTRACT_ABI,
    functionName: 'getLoanDetails',
    args: id !== undefined ? [BigInt(id)] : undefined,
    query: { enabled: id !== undefined, refetchInterval: 5000 },
  });

  const loan: Loan | undefined = data
    ? {
        borrower: data[0] as Address,
        amount: data[1] as bigint,
        approved: data[2] as boolean,
        disbursed: data[3] as boolean,
        repaid: data[4] as boolean,
      }
    : undefined;

  return {
    loan,
    isLoading,
    error,
    refetch,
  };
}

/* ----------------------------------------------------
   CONTRACT BALANCE
---------------------------------------------------- */
export function useContractBalance() {
  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: LOAN_CONTRACT_ABI,
    functionName: 'getContractBalance',
  });

  return {
    balance: data as bigint | undefined,
    isLoading,
    error,
    refetch,
  };
}

/* ----------------------------------------------------
   USER HAS ACTIVE LOAN?
---------------------------------------------------- */
export function useHasActiveLoan(address: Address | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: LOAN_CONTRACT_ABI,
    functionName: 'hasActiveLoan',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  return {
    hasActiveLoan: data as boolean | undefined,
    isLoading,
    error,
    refetch,
  };
}

/* ----------------------------------------------------
   📌 NEW: GET ALL LOAN IDS
---------------------------------------------------- */
export function useAllLoanIds() {
  const { count } = useLoanCount();
  const total = Number(count || 0);
  
  // Return array of loan IDs
  return Array.from({ length: total }, (_, i) => i);
}

/* ----------------------------------------------------
   📌 NEW: GET USER'S OWN LOAN IDS
   Returns just the IDs - components will fetch loan details
---------------------------------------------------- */
export function useUserLoans(address: Address | undefined) {
  const allLoanIds = useAllLoanIds();
  const [userLoanIds, setUserLoanIds] = useState<number[]>([]);
  
  useEffect(() => {
    if (!address || allLoanIds.length === 0) {
      setUserLoanIds([]);
      return;
    }
    
    // We need to check each loan to see if it belongs to this user
    // For now, return all IDs and let UserLoanCard filter by checking borrower
    setUserLoanIds(allLoanIds);
  }, [address, allLoanIds.length]);
  
  // Return in the format expected by the component
  return userLoanIds.map(id => ({ id }));
}
