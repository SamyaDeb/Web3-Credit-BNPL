import { useState } from 'react';
import { FraudAnalysisResult } from '@/lib/types/fraud';

interface UseFraudDetectionResult {
  checkFraud: (loanData: any) => Promise<FraudAnalysisResult | null>;
  isChecking: boolean;
  error: string | null;
}

export function useFraudDetection(): UseFraudDetectionResult {
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkFraud = async (loanData: {
    walletAddress: string;
    requestedAmount: number;
    maxEligible: number;
    loanPurpose?: string;
    walletAge?: number;
    totalTransactions?: number;
    previousLoans?: number;
    successfulRepayments?: number;
    circleCount?: number;
    loanRequestId?: string;
  }): Promise<FraudAnalysisResult | null> => {
    setIsChecking(true);
    setError(null);

    try {
      const response = await fetch('/api/check-fraud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loanData),
      });

      if (!response.ok) {
        throw new Error('Fraud check failed');
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      console.error('Fraud detection error:', err);
      return null;
    } finally {
      setIsChecking(false);
    }
  };

  return { checkFraud, isChecking, error };
}

interface UseSelfieVerificationResult {
  verifySelfie: (walletAddress: string, imageBase64: string) => Promise<any>;
  isVerifying: boolean;
  error: string | null;
}

export function useSelfieVerification(): UseSelfieVerificationResult {
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifySelfie = async (walletAddress: string, imageBase64: string) => {
    console.log('🎬 Frontend: Starting selfie verification...', { walletAddress, imageLength: imageBase64.length });
    setIsVerifying(true);
    setError(null);

    try {
      console.log('📡 Frontend: Sending request to /api/verify-selfie...');
      const response = await fetch('/api/verify-selfie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, imageBase64 }),
      });

      console.log('📥 Frontend: Received response:', { ok: response.ok, status: response.status });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Frontend: API error response:', errorText);
        throw new Error('Selfie verification failed');
      }

      const result = await response.json();
      console.log('✅ Frontend: Verification result:', result);
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      console.error('❌ Frontend: Selfie verification error:', err);
      return null;
    } finally {
      setIsVerifying(false);
      console.log('🏁 Frontend: Verification complete');
    }
  };

  return { verifySelfie, isVerifying, error };
}

interface UseFraudProfileResult {
  getFraudProfile: (walletAddress: string) => Promise<any>;
  isLoading: boolean;
  error: string | null;
}

export function useFraudProfile(): UseFraudProfileResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getFraudProfile = async (walletAddress: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/fraud-profile?address=${walletAddress}`);

      if (!response.ok) {
        throw new Error('Failed to get fraud profile');
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      console.error('Get fraud profile error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { getFraudProfile, isLoading, error };
}
// useFraudDetection hook
// useFraudDetection hook
