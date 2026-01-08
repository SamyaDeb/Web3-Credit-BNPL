import { NextRequest, NextResponse } from 'next/server';
import { analyzeFraudWithGemini } from '@/lib/fraudDetection';
import { 
  getUserFraudProfile, 
  createUserFraudProfile,
  updateFraudScore,
  saveLoanFraudCheck 
} from '@/lib/fraudDatabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      walletAddress,
      walletAge,
      totalTransactions,
      requestedAmount,
      maxEligible,
      loanPurpose,
      previousLoans,
      successfulRepayments,
      circleCount,
      loanRequestId
    } = body;

    // Validate required fields
    if (!walletAddress || !requestedAmount || !maxEligible) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get or create user fraud profile
    let userProfile = await getUserFraudProfile(walletAddress);
    if (!userProfile) {
      await createUserFraudProfile(walletAddress);
      userProfile = await getUserFraudProfile(walletAddress);
    }

    // Prepare data for Gemini analysis
    const loanData = {
      walletAddress,
      walletAge: walletAge || 0,
      totalTransactions: totalTransactions || 0,
      requestedAmount: Number(requestedAmount),
      maxEligible: Number(maxEligible),
      loanPurpose: loanPurpose || 'Not specified',
      previousLoans: previousLoans || 0,
      successfulRepayments: successfulRepayments || 0,
      hasVerification: userProfile?.isVerified || false,
      circleCount: circleCount || 0,
    };

    // Analyze with Gemini AI
    const fraudAnalysis = await analyzeFraudWithGemini(loanData);

    // Update fraud score in database
    await updateFraudScore(
      walletAddress, 
      fraudAnalysis.fraudScore,
      'Gemini AI fraud analysis'
    );

    // Save loan fraud check
    if (loanRequestId) {
      await saveLoanFraudCheck({
        loanRequestId,
        walletAddress,
        requestedAmount: Number(requestedAmount),
        maxEligible: Number(maxEligible),
        loanPurpose: loanPurpose || 'Not specified',
        fraudScore: fraudAnalysis.fraudScore,
        riskLevel: fraudAnalysis.riskLevel,
        approvalStatus: fraudAnalysis.recommendation === 'approve' ? 'approved' : 
                       fraudAnalysis.recommendation === 'block' ? 'denied' : 'review',
        denialReason: fraudAnalysis.recommendation === 'block' ? fraudAnalysis.explanation : undefined,
        geminiAnalysis: fraudAnalysis,
      });
    }

    return NextResponse.json({
      success: true,
      fraudScore: fraudAnalysis.fraudScore,
      riskLevel: fraudAnalysis.riskLevel,
      recommendation: fraudAnalysis.recommendation,
      explanation: fraudAnalysis.explanation,
      riskFactors: fraudAnalysis.riskFactors,
      trustFactors: fraudAnalysis.trustFactors,
      confidence: fraudAnalysis.confidence,
    });

  } catch (error) {
    console.error('Fraud check error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check fraud',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
// Fraud detection API
