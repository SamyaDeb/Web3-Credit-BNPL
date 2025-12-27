// Fraud Detection Types for Zentra AI

export type RiskLevel = 'low' | 'medium' | 'high';
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected' | 'expired';
export type FraudEventType = 
  | 'new_wallet'
  | 'mixer_connection'
  | 'flagged_address'
  | 'max_amount_request'
  | 'multiple_requests'
  | 'generic_purpose'
  | 'failed_verification'
  | 'deepfake_detected'
  | 'screenshot_detected';

export interface UserFraudProfile {
  walletAddress: string;
  fraudScore: number; // 0-100
  riskLevel: RiskLevel;
  isVerified: boolean;
  isFlagged: boolean;
  verificationBonus: number; // Points reduced from fraud score
  
  // Individual trust score breakdown
  walletAgeScore: number; // 0-15 points
  repaymentHistoryScore: number; // 0-15 points
  selfieVerificationScore: number; // 0-10 points
  circleActivityScore: number; // 0-10 points
  platformActivityScore: number; // 0-10 points
  totalTrustScore: number; // Sum of all individual scores (0-60 max)
  
  lastFraudCheck: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FraudAnalysisResult {
  fraudScore: number;
  riskLevel: RiskLevel;
  riskFactors: RiskFactor[];
  trustFactors: TrustFactor[];
  recommendation: 'approve' | 'review' | 'block';
  explanation: string;
  confidence: number; // 0-100
}

export interface RiskFactor {
  type: FraudEventType;
  points: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  evidence: string;
  detectedAt: Date;
}

export interface TrustFactor {
  type: string;
  points: number;
  evidence: string;
}

export interface FraudEvent {
  id: string;
  walletAddress: string;
  eventType: FraudEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  evidence: Record<string, any>;
  fraudScoreImpact: number;
  detectionMethod: 'ai' | 'manual' | 'automated_rule';
  resolved: boolean;
  resolutionNotes?: string;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface LoanFraudCheck {
  loanRequestId: string;
  walletAddress: string;
  requestedAmount: number;
  maxEligible: number;
  loanPurpose: string;
  fraudScore: number;
  riskLevel: RiskLevel;
  approvalStatus: 'approved' | 'denied' | 'review';
  denialReason?: string;
  geminiAnalysis: FraudAnalysisResult;
  checkedAt: Date;
}

// Selfie Verification Types
export interface SelfieVerification {
  id: string;
  walletAddress: string;
  selfieUrl: string;
  status: VerificationStatus;
  geminiScore: number; // 0-100
  isLivePhoto: boolean;
  faceDetected: boolean;
  deepfakeProbability: number; // 0-100
  qualityScore: number; // 0-100
  rejectionReason?: string;
  analysisDetails: SelfieAnalysisDetails;
  uploadedAt: Date;
  verifiedAt?: Date;
  expiresAt?: Date;
}

export interface SelfieAnalysisDetails {
  isRealPerson: boolean;
  isLivePhoto: boolean;
  aiConfidence: number;
  detectedIssues: string[];
  geminiRawResponse: Record<string, any>;
}

// Gemini API Response Types
export interface GeminiFraudResponse {
  fraud_score: number;
  risk_level: RiskLevel;
  risk_factors: Array<{
    factor: string;
    points: number;
    severity: string;
    evidence: string;
  }>;
  trust_factors: Array<{
    factor: string;
    points: number;
  }>;
  recommendation: 'approve' | 'review' | 'block';
  explanation: string;
  confidence: number;
}

export interface GeminiSelfieResponse {
  is_verified: boolean;
  is_real_person: boolean;
  is_live_photo: boolean;
  face_detected: boolean;
  quality_score: number;
  liveness_score: number;
  authenticity_score: number;
  deepfake_probability: number;
  verification_recommendation: 'approve' | 'reject' | 'manual_review';
  rejection_reasons: string[];
  confidence: number;
  detailed_analysis: string;
}
