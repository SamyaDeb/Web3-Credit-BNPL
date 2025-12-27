import { getUserFraudProfile } from './fraudDatabase';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { calculateTrustScoreBreakdown } from './fraudDetection';

// Collection names
const COLLECTIONS = {
  USERS_FRAUD: 'Profiles',
};

/**
 * Sync blockchain contract data with fraud profile
 * Call this whenever contract data changes (repayment, new loan, etc.)
 */
export async function syncContractScoreToFraudProfile(
  walletAddress: string,
  contractData: {
    individualScore: number;
    circleScore: number;
    finalScore: number;
    loansTaken?: number;
    loansRepaid?: number;
    totalBorrowed?: bigint;
    totalRepaid?: bigint;
    memberSince?: bigint;
  }
) {
  try {
    console.log('🔄 Syncing contract data to fraud profile for:', walletAddress);

    // Get existing fraud profile
    const existingProfile = await getUserFraudProfile(walletAddress);

    // Calculate wallet age in days
    const walletAgeDays = contractData.memberSince 
      ? Math.floor((Date.now() - Number(contractData.memberSince) * 1000) / (1000 * 60 * 60 * 24))
      : 0;

    // Calculate repayment success rate
    const loansTaken = contractData.loansTaken || 0;
    const loansRepaid = contractData.loansRepaid || 0;
    const repaymentSuccessRate = loansTaken > 0 ? loansRepaid / loansTaken : 0;

    // Calculate trust score breakdown
    const trustScores = calculateTrustScoreBreakdown({
      walletAge: walletAgeDays,
      previousLoans: loansTaken,
      successfulRepayments: loansRepaid,
      isVerified: existingProfile?.isVerified || false,
      circleCount: 0,
      platformActivityDays: walletAgeDays,
    });

    // Calculate new fraud score
    // If user just verified with no loans/activity, don't auto-add scores
    // Only add scores when there's actual activity
    let newFraudScore = 50;
    
    // Add selfie verification score (10 points if verified)
    if (existingProfile?.selfieVerificationScore) {
      newFraudScore += existingProfile.selfieVerificationScore;
    }
    
    // Only add other scores if user has actual activity
    // Add repayment history contribution (only if has loans)
    if (loansTaken > 0 && loansRepaid > 0) {
      newFraudScore += trustScores.repaymentHistoryScore;
    }
    
    // Add wallet age contribution (only if wallet is old enough)
    if (walletAgeDays >= 30) {
      newFraudScore += trustScores.walletAgeScore;
    }
    
    // Add platform activity contribution (only if has activity)
    if (walletAgeDays >= 7) {
      newFraudScore += trustScores.platformActivityScore;
    }

    // Update fraud profile with new scores
    if (existingProfile) {
      const docRef = doc(db, COLLECTIONS.USERS_FRAUD, walletAddress.toLowerCase());
      await updateDoc(docRef, {
        fraudScore: newFraudScore,
        walletAgeScore: trustScores.walletAgeScore,
        repaymentHistoryScore: trustScores.repaymentHistoryScore,
        platformActivityScore: trustScores.platformActivityScore,
        totalTrustScore: trustScores.totalTrustScore,
        updatedAt: new Date(),
      });
    }

    console.log('✅ Fraud profile synced successfully');
    console.log('📊 New scores:', {
      fraudScore: newFraudScore,
      walletAge: trustScores.walletAgeScore,
      repaymentHistory: trustScores.repaymentHistoryScore,
      selfieVerification: existingProfile?.selfieVerificationScore || 0,
      total: trustScores.totalTrustScore,
    });

    return {
      success: true,
      fraudScore: newFraudScore,
      trustScores,
    };

  } catch (error) {
    console.error('❌ Error syncing contract score:', error);
    throw error;
  }
}

/**
 * Get combined score (contract + fraud profile)
 */
export async function getCombinedUserScore(walletAddress: string) {
  try {
    const fraudProfile = await getUserFraudProfile(walletAddress);
    
    return {
      individualScore: fraudProfile?.fraudScore || 0,
      walletAgeScore: fraudProfile?.walletAgeScore || 0,
      repaymentHistoryScore: fraudProfile?.repaymentHistoryScore || 0,
      selfieVerificationScore: fraudProfile?.selfieVerificationScore || 0,
      circleActivityScore: fraudProfile?.circleActivityScore || 0,
      platformActivityScore: fraudProfile?.platformActivityScore || 0,
      totalTrustScore: fraudProfile?.totalTrustScore || 0,
      isVerified: fraudProfile?.isVerified || false,
      riskLevel: fraudProfile?.riskLevel || 'high',
    };
  } catch (error) {
    console.error('❌ Error getting combined score:', error);
    return null;
  }
}
