'use client';

import { useState } from 'react';
import { useFraudDetection, useSelfieVerification, useFraudProfile } from '@/hooks/useFraudDetection';
import { FraudScoreDisplay, FraudScoreBadge } from '@/components/FraudScoreBadge';
import Webcam from 'react-webcam';
import { useRef } from 'react';

export default function FraudDetectionDemo() {
  const [walletAddress, setWalletAddress] = useState('');
  const [fraudResult, setFraudResult] = useState<any>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [showWebcam, setShowWebcam] = useState(false);
  
  const webcamRef = useRef<Webcam>(null);
  const { checkFraud, isChecking } = useFraudDetection();
  const { verifySelfie, isVerifying } = useSelfieVerification();
  const { getFraudProfile, isLoading } = useFraudProfile();

  const handleCheckFraud = async () => {
    const result = await checkFraud({
      walletAddress,
      requestedAmount: 500,
      maxEligible: 1000,
      loanPurpose: 'Business expansion',
      walletAge: 30,
      totalTransactions: 10,
      previousLoans: 2,
      successfulRepayments: 2,
      circleCount: 1,
    });
    setFraudResult(result);
  };

  const handleCaptureSelfie = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        const result = await verifySelfie(walletAddress, imageSrc);
        setVerificationResult(result);
        setShowWebcam(false);
      }
    }
  };

  const handleGetProfile = async () => {
    const profile = await getFraudProfile(walletAddress);
    setProfileData(profile);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🛡️ AI Fraud Detection Demo
          </h1>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wallet Address
            </label>
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="0x..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleCheckFraud}
              disabled={!walletAddress || isChecking}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isChecking ? 'Checking...' : '🔍 Check Fraud Score'}
            </button>

            <button
              onClick={() => setShowWebcam(true)}
              disabled={!walletAddress || isVerifying}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isVerifying ? 'Verifying...' : '📸 Verify Selfie'}
            </button>

            <button
              onClick={handleGetProfile}
              disabled={!walletAddress || isLoading}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Loading...' : '👤 Get Profile'}
            </button>
          </div>
        </div>

        {/* Webcam Modal */}
        {showWebcam && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full">
              <h3 className="text-xl font-bold mb-4">Take Your Selfie</h3>
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                className="w-full rounded-lg mb-4"
              />
              <div className="flex gap-4">
                <button
                  onClick={handleCaptureSelfie}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  📸 Capture
                </button>
                <button
                  onClick={() => setShowWebcam(false)}
                  className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {fraudResult && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Fraud Analysis Results</h2>
              
              <div className="mb-4">
                <FraudScoreBadge 
                  score={fraudResult.fraudScore} 
                  riskLevel={fraudResult.riskLevel}
                  size="lg"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Recommendation:</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    fraudResult.recommendation === 'approve' ? 'bg-green-100 text-green-800' :
                    fraudResult.recommendation === 'block' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {fraudResult.recommendation.toUpperCase()}
                  </span>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Explanation:</h3>
                  <p className="text-gray-700 text-sm">{fraudResult.explanation}</p>
                </div>

                {fraudResult.riskFactors && fraudResult.riskFactors.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Risk Factors:</h3>
                    <ul className="space-y-2">
                      {fraudResult.riskFactors.map((factor: any, idx: number) => (
                        <li key={idx} className="text-sm text-red-600 flex items-start gap-2">
                          <span className="mt-0.5">⚠️</span>
                          <span>{factor.evidence} (+{factor.points} points)</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {fraudResult.trustFactors && fraudResult.trustFactors.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Trust Factors:</h3>
                    <ul className="space-y-2">
                      {fraudResult.trustFactors.map((factor: any, idx: number) => (
                        <li key={idx} className="text-sm text-green-600 flex items-start gap-2">
                          <span className="mt-0.5">✓</span>
                          <span>{factor.evidence} ({factor.points} points)</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    AI Confidence: {fraudResult.confidence}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {verificationResult && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Selfie Verification Results</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    verificationResult.verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {verificationResult.verified ? '✓ VERIFIED' : '✗ REJECTED'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Gemini Score:</span>
                  <span className="text-lg font-bold">{verificationResult.geminiScore}/100</span>
                </div>

                {verificationResult.scoreImprovement > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-green-800 font-medium">
                      🎉 Fraud Score Improved!
                    </p>
                    <p className="text-green-700 text-sm mt-1">
                      Your fraud score decreased by {verificationResult.scoreImprovement} points
                    </p>
                    <p className="text-green-600 text-sm mt-1">
                      New Score: {verificationResult.updatedFraudScore}/100
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">AI Analysis:</h3>
                  <p className="text-gray-700 text-sm">{verificationResult.detailedAnalysis}</p>
                </div>

                {verificationResult.rejectionReasons && verificationResult.rejectionReasons.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Issues Detected:</h3>
                    <ul className="space-y-1">
                      {verificationResult.rejectionReasons.map((reason: string, idx: number) => (
                        <li key={idx} className="text-sm text-red-600">
                          • {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    AI Confidence: {verificationResult.confidence}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {profileData && profileData.exists && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">User Fraud Profile</h2>
              
              <FraudScoreDisplay
                score={profileData.fraudScore}
                riskLevel={profileData.riskLevel}
                isVerified={profileData.isVerified}
                verificationBonus={profileData.verificationBonus}
              />

              {profileData.isFlagged && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-red-800 font-medium">
                    ⚠️ Account Flagged for Review
                  </p>
                  <p className="text-red-600 text-sm mt-1">
                    This account has been flagged due to high-risk indicators.
                  </p>
                </div>
              )}

              <div className="mt-4 text-xs text-gray-500">
                Last checked: {new Date(profileData.lastChecked).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
