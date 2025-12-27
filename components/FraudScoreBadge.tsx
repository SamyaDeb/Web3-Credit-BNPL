'use client';

import { RiskLevel } from '@/lib/types/fraud';

interface FraudScoreBadgeProps {
  score: number;
  riskLevel: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function FraudScoreBadge({ 
  score, 
  riskLevel, 
  size = 'md',
  showLabel = true 
}: FraudScoreBadgeProps) {
  const colors = {
    low: 'bg-green-100 text-green-800 border-green-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    high: 'bg-red-100 text-red-800 border-red-300',
  };

  const icons = {
    low: '🟢',
    medium: '🟡',
    high: '🔴',
  };

  const sizes = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border-2 font-medium ${colors[riskLevel]} ${sizes[size]}`}>
      <span>{icons[riskLevel]}</span>
      <span>{score}/100</span>
      {showLabel && (
        <span className="capitalize">
          {riskLevel} Risk
        </span>
      )}
    </div>
  );
}

interface VerificationBadgeProps {
  isVerified: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function VerificationBadge({ isVerified, size = 'md' }: VerificationBadgeProps) {
  const sizes = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  if (isVerified) {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-full bg-blue-100 text-blue-800 border-2 border-blue-300 font-medium ${sizes[size]}`}>
        <span>✓</span>
        <span>Verified</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full bg-gray-100 text-gray-600 border-2 border-gray-300 font-medium ${sizes[size]}`}>
      <span>⚠</span>
      <span>Unverified</span>
    </div>
  );
}

interface FraudScoreDisplayProps {
  score: number;
  riskLevel: RiskLevel;
  isVerified: boolean;
  verificationBonus?: number;
  showDetails?: boolean;
}

export function FraudScoreDisplay({
  score,
  riskLevel,
  isVerified,
  verificationBonus = 0,
  showDetails = true,
}: FraudScoreDisplayProps) {
  return (
    <div className="p-4 bg-white rounded-lg border-2 border-gray-200 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Fraud Risk Score</h3>
        <FraudScoreBadge score={score} riskLevel={riskLevel} />
      </div>

      {showDetails && (
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Identity Status:</span>
            <VerificationBadge isVerified={isVerified} size="sm" />
          </div>

          {verificationBonus > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Verification Bonus:</span>
              <span className="text-green-600 font-medium">-{verificationBonus} points</span>
            </div>
          )}

          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Risk Threshold:</span>
              <div className="flex gap-2">
                <span className="text-green-600">0-30: Low</span>
                <span className="text-yellow-600">31-60: Med</span>
                <span className="text-red-600">61-100: High</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
