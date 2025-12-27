import { NextRequest, NextResponse } from 'next/server';
import { getUserFraudProfile } from '@/lib/fraudDatabase';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const COLLECTIONS = {
  USERS_FRAUD: 'Profiles',
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { walletAddress } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const profile = await getUserFraudProfile(walletAddress);

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // If user is verified, reset their score to exactly 60
    if (profile.isVerified) {
      const docRef = doc(db, COLLECTIONS.USERS_FRAUD, walletAddress.toLowerCase());
      await updateDoc(docRef, {
        fraudScore: 60, // 50 base + 10 selfie
        selfieVerificationScore: 10,
        repaymentHistoryScore: 0,
        walletAgeScore: 0,
        platformActivityScore: 0,
        totalTrustScore: 10,
        updatedAt: new Date(),
      });

      return NextResponse.json({
        success: true,
        message: 'Score fixed to 60',
        oldScore: profile.fraudScore,
        newScore: 60,
      });
    }

    return NextResponse.json({
      success: false,
      message: 'User is not verified',
    });

  } catch (error: any) {
    console.error('❌ Fix score error:', error);
    return NextResponse.json(
      { error: 'Failed to fix score', details: error.message },
      { status: 500 }
    );
  }
}
