import { NextRequest, NextResponse } from 'next/server';
import { verifySelfieWithGemini } from '@/lib/fraudDetection';
import { 
  saveSelfieVerification,
  markUserAsVerified,
  getUserFraudProfile 
} from '@/lib/fraudDatabase';
// W&B logging temporarily disabled due to browser compatibility issues
// import { logSelfieVerification, logFraudScore } from '@/lib/wandb';

export async function POST(request: NextRequest) {
  const startTime = Date.now(); // Track processing time for W&B
  
  try {
    console.log('🚀 Starting selfie verification...');
    const body = await request.json();
    const { walletAddress, imageBase64 } = body;

    console.log('📦 Received data:', { 
      walletAddress, 
      hasImage: !!imageBase64,
      imageLength: imageBase64?.length 
    });

    // Validate inputs
    if (!walletAddress || !imageBase64) {
      console.error('❌ Validation failed: Missing required fields');
      return NextResponse.json(
        { error: 'Missing walletAddress or image data' },
        { status: 400 }
      );
    }

    // Verify with Gemini AI
    console.log('🤖 Calling Gemini AI for verification...');
    const geminiResult = await verifySelfieWithGemini(imageBase64);
    console.log('✅ Gemini analysis complete:', geminiResult);
    
    const processingTime = Date.now() - startTime;

    // W&B logging temporarily disabled
    // await logSelfieVerification({
    //   walletAddress,
    //   isVerified: geminiResult.is_verified,
    //   qualityScore: geminiResult.quality_score,
    //   livenessScore: geminiResult.liveness_score,
    //   authenticityScore: geminiResult.authenticity_score,
    //   deepfakeProbability: geminiResult.deepfake_probability,
    //   processingTimeMs: processingTime,
    //   rejectionReasons: geminiResult.rejection_reasons,
    //   confidence: geminiResult.confidence,
    // });

    // Note: Skipping Firebase Storage upload to avoid billing
    // Selfie images are analyzed but not permanently stored
    const selfieUrl = 'verified-via-ai'; // Placeholder instead of actual URL

    // Determine verification status
    const isVerified = geminiResult.is_verified && 
                      geminiResult.verification_recommendation === 'approve';

    const status = isVerified ? 'verified' : 
                  geminiResult.verification_recommendation === 'manual_review' ? 'pending' : 
                  'rejected';

    // Save verification to database
    const verificationData: any = {
      walletAddress: walletAddress.toLowerCase(),
      selfieUrl,
      status,
      geminiScore: geminiResult.authenticity_score,
      isLivePhoto: geminiResult.is_live_photo,
      faceDetected: geminiResult.face_detected,
      deepfakeProbability: geminiResult.deepfake_probability,
      qualityScore: geminiResult.quality_score,
      analysisDetails: {
        isRealPerson: geminiResult.is_real_person,
        isLivePhoto: geminiResult.is_live_photo,
        aiConfidence: geminiResult.confidence,
        detectedIssues: geminiResult.rejection_reasons,
        geminiRawResponse: geminiResult,
      },
      uploadedAt: new Date(),
    };

    // Only add optional fields if they have values
    if (!isVerified && geminiResult.rejection_reasons.length > 0) {
      verificationData.rejectionReason = geminiResult.rejection_reasons.join(', ');
    }
    if (isVerified) {
      verificationData.verifiedAt = new Date();
      verificationData.expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days
    }

    const verificationId = await saveSelfieVerification(verificationData);

    // Get profile BEFORE verification to calculate actual improvement
    const profileBefore = await getUserFraudProfile(walletAddress);
    const oldIndividualScore = profileBefore?.fraudScore || 50;
    const oldTrustScore = profileBefore?.totalTrustScore || 0;

    // If verified, update user's fraud score
    if (isVerified) {
      console.log('🎉 User verified! Updating fraud score...');
      await markUserAsVerified(walletAddress, 20); // Updates to 60 points
    }

    // Get updated fraud profile
    const updatedProfile = await getUserFraudProfile(walletAddress);
    console.log('📊 Updated profile:', updatedProfile);

    const newIndividualScore = updatedProfile?.fraudScore || 50;
    const newTrustScore = updatedProfile?.totalTrustScore || 0;
    const actualScoreImprovement = newIndividualScore - oldIndividualScore;
    const trustScoreImprovement = newTrustScore - oldTrustScore;

    // W&B logging temporarily disabled
    // if (isVerified && updatedProfile) {
    //   await logFraudScore({
    //     walletAddress,
    //     oldScore: oldIndividualScore,
    //     newScore: newIndividualScore,
    //     scoreImprovement: actualScoreImprovement,
    //     trustScores: {
    //       selfieVerification: updatedProfile.selfieVerificationScore || 0,
    //       repaymentHistory: updatedProfile.repaymentHistoryScore || 0,
    //       walletAge: updatedProfile.walletAgeScore || 0,
    //       platformActivity: updatedProfile.platformActivityScore || 0,
    //       total: updatedProfile.totalTrustScore || 0,
    //     },
    //     riskLevel: updatedProfile.riskLevel || 'medium',
    //   });
    // }

    const response = {
      success: true,
      verified: isVerified,
      status,
      verificationId,
      geminiScore: geminiResult.authenticity_score,
      confidence: geminiResult.confidence,
      rejectionReasons: geminiResult.rejection_reasons,
      detailedAnalysis: geminiResult.detailed_analysis,
      
      // Real scores (not hardcoded)
      oldIndividualScore,
      newIndividualScore,
      updatedFraudScore: newIndividualScore, // Individual score
      scoreImprovement: actualScoreImprovement, // Actual improvement (10 for trust score)
      trustScoreImprovement, // +10 for selfie verification
      
      // Individual trust score breakdown
      walletAgeScore: updatedProfile?.walletAgeScore || 0,
      repaymentHistoryScore: updatedProfile?.repaymentHistoryScore || 0,
      selfieVerificationScore: updatedProfile?.selfieVerificationScore || 0,
      circleActivityScore: updatedProfile?.circleActivityScore || 0,
      platformActivityScore: updatedProfile?.platformActivityScore || 0,
      totalTrustScore: updatedProfile?.totalTrustScore || 0,
    };

    console.log('✅ Sending response:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Selfie verification error:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Stack trace:', error instanceof Error ? error.stack : '');
    return NextResponse.json(
      { 
        error: 'Failed to verify selfie',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
// Selfie verification API
