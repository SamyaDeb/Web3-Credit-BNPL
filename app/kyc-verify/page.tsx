'use client';

import { useState, useRef, useEffect } from 'react';
import { useAccount } from 'wagmi';
import Webcam from 'react-webcam';
import { useSelfieVerification, useFraudProfile } from '@/hooks/useFraudDetection';
import { VerificationBadge } from '@/components/FraudScoreBadge';
import { ConnectButton } from '@/components/ConnectButton';

export default function KYCVerification() {
  const { address, isConnected } = useAccount();
  const [step, setStep] = useState<'connect' | 'verify' | 'capture' | 'processing' | 'complete'>('connect');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  const webcamRef = useRef<Webcam>(null);
  const { verifySelfie, isVerifying } = useSelfieVerification();
  const { getFraudProfile } = useFraudProfile();

  useEffect(() => {
    if (isConnected && address) {
      loadUserProfile().then(profile => {
        if (profile && profile.isVerified) {
          console.log('✅ User already verified, showing completion screen');
          setStep('complete');
          setVerificationResult({
            success: true,
            verified: true,
            status: 'verified',
            confidence: 95,
            fraudScore: profile.fraudScore,
            newIndividualScore: profile.fraudScore,
            oldIndividualScore: 50,
            scoreImprovement: profile.fraudScore - 50,
            walletAgeScore: profile.walletAgeScore || 0,
            repaymentHistoryScore: profile.repaymentHistoryScore || 0,
            selfieVerificationScore: profile.selfieVerificationScore || 0,
            circleActivityScore: profile.circleActivityScore || 0,
            platformActivityScore: profile.platformActivityScore || 0,
            totalTrustScore: profile.totalTrustScore || 0,
            detailedAnalysis: 'Your identity was verified previously and is permanently stored.'
          });
        } else {
          setStep('verify');
        }
      });
    } else {
      setStep('connect');
    }
  }, [isConnected, address]);

  const loadUserProfile = async () => {
    if (address) {
      const profile = await getFraudProfile(address);
      setUserProfile(profile);
      return profile;
    }
    return null;
  };

  const handleStartVerification = () => {
    setStep('capture');
  };

  const handleCapture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImage(imageSrc);
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleSubmit = async () => {
    if (!capturedImage || !address) {
      console.warn('⚠️ Cannot submit: missing data', { hasImage: !!capturedImage, hasAddress: !!address });
      return;
    }

    console.log('🚀 KYC Page: Starting submission...', { address, imageLength: capturedImage.length });
    setStep('processing');

    try {
      console.log('📞 KYC Page: Calling verifySelfie...');
      const result = await verifySelfie(address, capturedImage);
      console.log('✅ KYC Page: Got result:', result);
      
      setVerificationResult(result);
      setStep('complete');
      
      // Reload profile to get updated fraud score
      console.log('🔄 KYC Page: Reloading user profile...');
      await loadUserProfile();
      console.log('✅ KYC Page: Profile reloaded');
    } catch (error) {
      console.error('❌ KYC Page: Verification failed:', error);
      setStep('capture');
      setCapturedImage(null);
    }
  };

  const handleCancel = () => {
    setCapturedImage(null);
    setStep('verify');
  };

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
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
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
          {Array.from({ length: 50 }).map((_, i) => {
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

        <div className="max-w-2xl w-full px-4 relative" style={{ zIndex: 10 }}>
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🛡️ Zentra KYC Verification
          </h1>
          <p className="text-gray-400">
            Verify your identity with AI-powered selfie verification
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl hover:shadow-[0_0_30px_rgba(192,192,192,0.2)] transition-all min-h-[500px]">
          
          {/* Step 1: Connect Wallet */}
          {step === 'connect' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto border border-white/20">
                <span className="text-4xl">👛</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Connect Your Wallet
                </h2>
                <p className="text-gray-400 mb-6">
                  Connect your wallet to start the verification process
                </p>
              </div>
              <ConnectButton />
            </div>
          )}

          {/* Step 2: Verify KYC Button */}
          {step === 'verify' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
                  <span className="text-4xl">✓</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Wallet Connected
                </h2>
                <p className="text-sm text-gray-400 mb-4 font-mono">
                  {address}
                </p>
              </div>

              {/* Show current verification status if exists */}
              {userProfile?.exists && (
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 mb-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium text-gray-300">Current Status:</span>
                    <VerificationBadge isVerified={userProfile.isVerified} />
                  </div>
                  
                  {userProfile.isVerified ? (
                    <div className="text-sm text-green-400 bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                      ✓ You are already verified! Your wallet address is permanently verified.
                    </div>
                  ) : (
                    <div className="text-sm text-yellow-400 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                      ⚠️ Complete verification to improve your trust score and unlock better loan terms.
                    </div>
                  )}
                </div>
              )}

              {/* Benefits */}
              {!userProfile?.isVerified && (
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 space-y-3 border border-white/10">
                  <h3 className="font-semibold text-white mb-3">
                    Benefits of Verification:
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span className="text-gray-300">Increase individual score from 50 to 60</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span className="text-gray-300">Unlock higher loan amounts</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span className="text-gray-300">Faster loan approvals</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span className="text-gray-300">Lower interest rates</span>
                    </div>
                  </div>
                </div>
              )}

              {!userProfile?.isVerified ? (
                <button
                  onClick={handleStartVerification}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
                >
                  📸 Start Verification
                </button>
              ) : (
                <button
                  onClick={() => window.location.href = '/user'}
                  className="w-full py-4 bg-green-600 text-white rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  ✓ Go to Dashboard
                </button>
              )}
            </div>
          )}

          {/* Step 3: Capture Selfie */}
          {step === 'capture' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Take Your Selfie
                </h2>
                <p className="text-gray-400">
                  Position your face in the frame and capture
                </p>
              </div>

              {/* Tips */}
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
                <p className="font-semibold text-yellow-400 mb-2">📋 Tips for best results:</p>
                <ul className="text-sm text-yellow-300/90 space-y-1">
                  <li>• Face the camera directly</li>
                  <li>• Use good lighting</li>
                  <li>• Remove sunglasses or hats</li>
                  <li>• Keep a neutral expression</li>
                </ul>
              </div>

              {/* Webcam or Preview */}
              <div className="relative rounded-lg overflow-hidden bg-black/50 border border-white/10">
                {!capturedImage ? (
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    className="w-full rounded-lg"
                    videoConstraints={{
                      facingMode: "user"
                    }}
                  />
                ) : (
                  <img src={capturedImage} alt="Captured" className="w-full rounded-lg" />
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                {!capturedImage ? (
                  <>
                    <button
                      onClick={handleCapture}
                      className="flex-1 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                    >
                      📸 Capture Photo
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors border border-white/20"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSubmit}
                      disabled={isVerifying}
                      className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400"
                    >
                      {isVerifying ? 'Verifying...' : '✓ Submit for Verification'}
                    </button>
                    <button
                      onClick={handleRetake}
                      className="px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors border border-white/20"
                    >
                      ↻ Retake
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Processing */}
          {step === 'processing' && (
            <div className="text-center space-y-6 py-8">
              <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <span className="text-4xl">🔄</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Verifying with AI...
                </h2>
                <p className="text-gray-400">
                  Gemini is analyzing your selfie. This will take a few seconds.
                </p>
              </div>
              <div className="flex justify-center gap-2">
                <div className="w-3 h-3 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-3 h-3 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}

          {/* Step 5: Complete */}
          {step === 'complete' && verificationResult && (
            <div className="space-y-6">
              <div className="text-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border ${
                  verificationResult.verified ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
                }`}>
                  <span className="text-4xl">
                    {verificationResult.verified ? '✓' : '✗'}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {verificationResult.verified ? 'Verification Successful!' : 'Verification Failed'}
                </h2>
                <p className="text-gray-400">
                  {verificationResult.verified 
                    ? userProfile?.isVerified && !capturedImage 
                      ? 'Your identity was verified previously'
                      : 'Your identity has been verified'
                    : 'We could not verify your selfie'
                  }
                </p>
              </div>

              {/* Results */}
              <div className={`rounded-lg p-6 border ${
                verificationResult.verified ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
              }`}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-300">Verification Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      verificationResult.verified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {verificationResult.status?.toUpperCase() || 'VERIFIED'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-300">AI Confidence:</span>
                    <span className="text-lg font-bold text-white">{verificationResult.confidence}%</span>
                  </div>

                  {verificationResult.verified && (
                    <div className="space-y-3 pt-4 border-t border-green-500/30">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-300">Score Improvement:</span>
                        <span className="text-green-400 font-bold text-lg">
                          +{verificationResult.scoreImprovement || 10}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-300">New Individual Score:</span>
                        <span className="text-orange-400 font-bold text-2xl">
                          {verificationResult.newIndividualScore || 60}
                        </span>
                      </div>
                    </div>
                  )}

                  {!verificationResult.verified && verificationResult.rejectionReasons?.length > 0 && (
                    <div className="pt-4 border-t border-red-500/30">
                      <p className="font-semibold text-gray-300 mb-2">Issues Detected:</p>
                      <ul className="space-y-1">
                        {verificationResult.rejectionReasons.map((reason: string, idx: number) => (
                          <li key={idx} className="text-sm text-red-400">
                            • {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-4 border-t border-white/10">
                    <p className="text-sm text-gray-400">
                      {verificationResult.detailedAnalysis}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                {verificationResult.verified ? (
                  <button
                    onClick={() => window.location.href = '/user'}
                    className="flex-1 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                  >
                    Continue to Dashboard →
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setCapturedImage(null);
                        setVerificationResult(null);
                        setStep('capture');
                      }}
                      className="flex-1 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => setStep('verify')}
                      className="px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors border border-white/20"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-400">
          <p>🔒 Your selfie is securely stored in Firebase and verified with Google Gemini AI</p>
        </div>
      </div>
    </div>
    </>
  );
}
