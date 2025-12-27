import { NextRequest, NextResponse } from 'next/server';
import { getUserFraudProfile } from '@/lib/fraudDatabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('address');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const fraudProfile = await getUserFraudProfile(walletAddress);

    if (!fraudProfile) {
      return NextResponse.json({
        exists: false,
        message: 'No fraud profile found for this address',
      });
    }

    return NextResponse.json({
      exists: true,
      fraudScore: fraudProfile.fraudScore,
      riskLevel: fraudProfile.riskLevel,
      isVerified: fraudProfile.isVerified,
      isFlagged: fraudProfile.isFlagged,
      verificationBonus: fraudProfile.verificationBonus,
      lastChecked: fraudProfile.lastFraudCheck,
    });

  } catch (error) {
    console.error('Get fraud profile error:', error);
    return NextResponse.json(
      { error: 'Failed to get fraud profile' },
      { status: 500 }
    );
  }
}
