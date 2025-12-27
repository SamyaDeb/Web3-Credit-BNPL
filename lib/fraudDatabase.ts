import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  addDoc,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  UserFraudProfile, 
  FraudEvent, 
  SelfieVerification, 
  LoanFraudCheck,
  RiskLevel 
} from './types/fraud';

// Collection names
export const COLLECTIONS = {
  USERS_FRAUD: 'Profiles',
  FRAUD_EVENTS: 'fraud_events',
  SELFIE_VERIFICATIONS: 'selfie_verifications',
  LOAN_FRAUD_CHECKS: 'loan_fraud_checks',
};

// ==========================================
// USER FRAUD PROFILE FUNCTIONS
// ==========================================

export async function getUserFraudProfile(walletAddress: string): Promise<UserFraudProfile | null> {
  try {
    const docRef = doc(db, COLLECTIONS.USERS_FRAUD, walletAddress.toLowerCase());
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        lastFraudCheck: data.lastFraudCheck?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as UserFraudProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting fraud profile:', error);
    return null;
  }
}

export async function createUserFraudProfile(
  walletAddress: string,
  initialFraudScore: number = 50, // Users start at 50 points
  trustScores?: {
    walletAgeScore?: number;
    repaymentHistoryScore?: number;
    selfieVerificationScore?: number;
    circleActivityScore?: number;
    platformActivityScore?: number;
    totalTrustScore?: number;
  }
): Promise<void> {
  try {
    const profile: Partial<UserFraudProfile> = {
      walletAddress: walletAddress.toLowerCase(),
      fraudScore: initialFraudScore,
      riskLevel: getRiskLevel(initialFraudScore),
      isVerified: false,
      isFlagged: false,
      verificationBonus: 0,
      
      // Individual trust scores
      walletAgeScore: trustScores?.walletAgeScore || 0,
      repaymentHistoryScore: trustScores?.repaymentHistoryScore || 0,
      selfieVerificationScore: trustScores?.selfieVerificationScore || 0,
      circleActivityScore: trustScores?.circleActivityScore || 0,
      platformActivityScore: trustScores?.platformActivityScore || 0,
      totalTrustScore: trustScores?.totalTrustScore || 0,
      
      lastFraudCheck: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, COLLECTIONS.USERS_FRAUD, walletAddress.toLowerCase()), {
      ...profile,
      lastFraudCheck: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error creating fraud profile:', error);
    throw error;
  }
}

export async function updateFraudScore(
  walletAddress: string,
  newScore: number,
  reason?: string
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.USERS_FRAUD, walletAddress.toLowerCase());
    
    await updateDoc(docRef, {
      fraudScore: newScore,
      riskLevel: getRiskLevel(newScore),
      isFlagged: newScore >= 61,
      lastFraudCheck: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Log the fraud score change
    if (reason) {
      await logFraudEvent({
        walletAddress: walletAddress.toLowerCase(),
        eventType: 'max_amount_request', // Default, should be dynamic
        severity: newScore >= 70 ? 'high' : newScore >= 40 ? 'medium' : 'low',
        evidence: { reason, oldScore: 0, newScore },
        fraudScoreImpact: 0,
        detectionMethod: 'ai',
        resolved: false,
        createdAt: new Date(),
      });
    }
  } catch (error) {
    console.error('Error updating fraud score:', error);
    throw error;
  }
}

export async function markUserAsVerified(
  walletAddress: string,
  verificationBonus: number = 20
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.USERS_FRAUD, walletAddress.toLowerCase());
    let profile = await getUserFraudProfile(walletAddress);
    
    // Create profile if doesn't exist
    if (!profile) {
      console.log('📝 Creating new fraud profile for user...');
      await createUserFraudProfile(walletAddress, 50); // Start at 50
      profile = await getUserFraudProfile(walletAddress);
    }
    
    if (profile) {
      // Start: 50, After verification: 60 (adds 10 points)
      // Always set to 60 for verified users (50 base + 10 selfie)
      const newScore = 60;
      
      await updateDoc(docRef, {
        isVerified: true,
        verificationBonus,
        fraudScore: newScore,
        riskLevel: getRiskLevel(newScore),
        selfieVerificationScore: 10, // Add 10 points for selfie verification
        totalTrustScore: 10, // Only selfie score initially
        updatedAt: serverTimestamp(),
      });
      console.log('✅ User marked as verified with score:', newScore);
    }
  } catch (error) {
    console.error('Error marking user as verified:', error);
    throw error;
  }
}

// ==========================================
// FRAUD EVENTS FUNCTIONS
// ==========================================

export async function logFraudEvent(event: Omit<FraudEvent, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.FRAUD_EVENTS), {
      ...event,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error logging fraud event:', error);
    throw error;
  }
}

export async function getFraudEvents(walletAddress: string): Promise<FraudEvent[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.FRAUD_EVENTS),
      where('walletAddress', '==', walletAddress.toLowerCase())
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      resolvedAt: doc.data().resolvedAt?.toDate(),
    })) as FraudEvent[];
  } catch (error) {
    console.error('Error getting fraud events:', error);
    return [];
  }
}

// ==========================================
// SELFIE VERIFICATION FUNCTIONS
// ==========================================

export async function saveSelfieVerification(
  verification: Omit<SelfieVerification, 'id'>
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.SELFIE_VERIFICATIONS), {
      ...verification,
      uploadedAt: serverTimestamp(),
      verifiedAt: verification.status === 'verified' ? serverTimestamp() : null,
      expiresAt: verification.expiresAt || null,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving selfie verification:', error);
    throw error;
  }
}

export async function getSelfieVerification(
  walletAddress: string
): Promise<SelfieVerification | null> {
  try {
    const q = query(
      collection(db, COLLECTIONS.SELFIE_VERIFICATIONS),
      where('walletAddress', '==', walletAddress.toLowerCase()),
      where('status', '==', 'verified')
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        uploadedAt: doc.data().uploadedAt?.toDate(),
        verifiedAt: doc.data().verifiedAt?.toDate(),
        expiresAt: doc.data().expiresAt?.toDate(),
      } as SelfieVerification;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting selfie verification:', error);
    return null;
  }
}

// ==========================================
// LOAN FRAUD CHECK FUNCTIONS
// ==========================================

export async function saveLoanFraudCheck(
  check: Omit<LoanFraudCheck, 'checkedAt'>
): Promise<void> {
  try {
    await addDoc(collection(db, COLLECTIONS.LOAN_FRAUD_CHECKS), {
      ...check,
      checkedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error saving loan fraud check:', error);
    throw error;
  }
}

export async function getLoanFraudChecks(walletAddress: string): Promise<LoanFraudCheck[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.LOAN_FRAUD_CHECKS),
      where('walletAddress', '==', walletAddress.toLowerCase())
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      checkedAt: doc.data().checkedAt?.toDate(),
    })) as LoanFraudCheck[];
  } catch (error) {
    console.error('Error getting loan fraud checks:', error);
    return [];
  }
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

export function getRiskLevel(fraudScore: number): RiskLevel {
  if (fraudScore >= 61) return 'high';
  if (fraudScore >= 31) return 'medium';
  return 'low';
}

export function getRiskColor(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case 'low': return 'green';
    case 'medium': return 'yellow';
    case 'high': return 'red';
  }
}

export function getRiskBadge(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case 'low': return '🟢';
    case 'medium': return '🟡';
    case 'high': return '🔴';
  }
}
