'use client';

import { UserFraudProfile } from '@/lib/types/fraud';

interface TrustScoreBreakdownProps {
  profile: UserFraudProfile;
}

export function TrustScoreBreakdown({ profile }: TrustScoreBreakdownProps) {
  const scoreCategories = [
    {
      name: 'Wallet Age',
      score: profile.walletAgeScore || 0,
      max: 15,
      icon: '⏰',
      description: 'Account maturity and history'
    },
    {
      name: 'Repayment History',
      score: profile.repaymentHistoryScore || 0,
      max: 15,
      icon: '💰',
      description: 'Past loan repayment performance'
    },
    {
      name: 'Selfie Verification',
      score: profile.selfieVerificationScore || 0,
      max: 10,
      icon: '📸',
      description: 'AI-verified identity confirmation'
    },
    {
      name: 'Circle Activity',
      score: profile.circleActivityScore || 0,
      max: 10,
      icon: '👥',
      description: 'Community engagement and participation'
    },
    {
      name: 'Platform Activity',
      score: profile.platformActivityScore || 0,
      max: 10,
      icon: '📊',
      description: 'Regular platform usage and engagement'
    }
  ];

  const totalScore = profile.totalTrustScore || 0;
  const maxScore = 60;
  const percentage = (totalScore / maxScore) * 100;

  const getRiskColor = () => {
    if (totalScore >= 40) return 'text-green-600 bg-green-50';
    if (totalScore >= 20) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getRiskBadge = () => {
    if (totalScore >= 40) return '🟢 Low Risk';
    if (totalScore >= 20) return '🟡 Medium Risk';
    return '🔴 High Risk';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Trust Score Breakdown</h2>
        <div className={`px-4 py-2 rounded-full font-semibold ${getRiskColor()}`}>
          {getRiskBadge()}
        </div>
      </div>

      {/* Total Score */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-600 font-medium">Total Trust Score</span>
          <span className="text-3xl font-bold text-blue-600">
            {totalScore} / {maxScore}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <p className="text-sm text-gray-600 mt-2">
          {percentage.toFixed(0)}% of maximum trust score achieved
        </p>
      </div>

      {/* Individual Scores */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Score Components</h3>
        
        {scoreCategories.map((category) => {
          const categoryPercentage = (category.score / category.max) * 100;
          const isComplete = category.score === category.max;
          
          return (
            <div key={category.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <p className="font-medium text-gray-800">{category.name}</p>
                    <p className="text-xs text-gray-500">{category.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-bold ${isComplete ? 'text-green-600' : 'text-gray-700'}`}>
                    {category.score} / {category.max}
                  </span>
                  {isComplete && <span className="ml-2">✅</span>}
                </div>
              </div>
              
              {/* Individual Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    isComplete 
                      ? 'bg-green-500' 
                      : categoryPercentage >= 50 
                        ? 'bg-blue-500' 
                        : 'bg-gray-400'
                  }`}
                  style={{ width: `${categoryPercentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Tips to Improve */}
      {totalScore < 60 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">💡 How to Improve Your Score</h4>
          <ul className="space-y-1 text-sm text-blue-800">
            {profile.walletAgeScore < 15 && (
              <li>• Keep your wallet active to increase age score</li>
            )}
            {profile.selfieVerificationScore === 0 && (
              <li>• Complete selfie verification to earn +10 points</li>
            )}
            {profile.circleActivityScore < 10 && (
              <li>• Join more trust circles to boost your community score</li>
            )}
            {profile.repaymentHistoryScore < 15 && (
              <li>• Maintain 100% repayment rate on your loans</li>
            )}
            {profile.platformActivityScore < 10 && (
              <li>• Stay active on the platform regularly</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
