import { NextRequest, NextResponse } from 'next/server';
import { syncContractScoreToFraudProfile } from '@/lib/syncContractScore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { walletAddress, contractData } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const result = await syncContractScoreToFraudProfile(walletAddress, contractData);

    return NextResponse.json({
      success: true,
      fraudScore: result.fraudScore,
      trustScores: result.trustScores,
    });

  } catch (error: any) {
    console.error('❌ Sync score error:', error);
    return NextResponse.json(
      { error: 'Failed to sync score', details: error.message },
      { status: 500 }
    );
  }
}
