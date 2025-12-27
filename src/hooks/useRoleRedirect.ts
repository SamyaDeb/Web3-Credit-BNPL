'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import type { Address } from 'viem';

const ADMIN_ADDRESS: Address = '0x74E36d4A7b33057e3928CE4bf4C8C53A93361C34';

/**
 * Custom hook to redirect users based on their role
 * - Admin users are redirected to /admin
 * - Regular users are redirected to /user
 * - Runs automatically on wallet connection
 * 
 * @example
 * ```tsx
 * function HomePage() {
 *   useRoleRedirect();
 *   return <div>Redirecting...</div>;
 * }
 * ```
 */
export function useRoleRedirect() {
  const router = useRouter();
  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (!isConnected || !address) {
      return;
    }

    const isAdmin = address.toLowerCase() === ADMIN_ADDRESS.toLowerCase();

    if (isAdmin) {
      router.push('/admin');
    } else {
      router.push('/user');
    }
  }, [address, isConnected, router]);

  return {
    address,
    isConnected,
    isAdmin: address?.toLowerCase() === ADMIN_ADDRESS.toLowerCase(),
  };
}
