import * as wandb from 'wandb';

let wandbRun: any = null;
let isInitializing = false;

/**
 * Initialize Weights & Biases for ML monitoring
 */
export async function initWandB() {
  // Return existing run if already initialized
  if (wandbRun) return wandbRun;
  
  // Prevent multiple simultaneous initializations
  if (isInitializing) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return wandbRun;
  }

  try {
    isInitializing = true;

    wandbRun = await wandb.init({
      project: process.env.WANDB_PROJECT || 'zentra-fraud-detection',
      entity: process.env.WANDB_ENTITY,
      config: {
        // AI Model Configuration
        model: 'gemini-2.0-flash-exp',
        model_version: '2.0',
        verification_threshold: 80,
        
        // Trust Score Weights
        trust_score_weights: {
          selfie_verification: 10,
          repayment_history: 15,
          wallet_age: 15,
          platform_activity: 10,
        },
        
        // Risk Level Thresholds
        risk_thresholds: {
          low: 70,
          medium: 40,
          high: 0,
        },
        
        // Contract Details
        contract_address: '0xa3f87b884347388f59edcc8e229C0BbC1AE821bC',
        blockchain: 'polygon-amoy',
      },
    });

    console.log('✅ W&B initialized successfully');
    return wandbRun;

  } catch (error) {
    console.error('❌ W&B initialization error:', error);
    wandbRun = null;
    return null;
  } finally {
    isInitializing = false;
  }
}

/**
 * Log selfie verification metrics to W&B
 */
export async function logSelfieVerification(data: {
  walletAddress: string;
  isVerified: boolean;
  qualityScore: number;
  livenessScore: number;
  authenticityScore: number;
  deepfakeProbability: number;
  processingTimeMs: number;
  rejectionReasons?: string[];
  confidence: number;
}) {
  try {
    // Skip W&B logging in browser environment
    if (typeof window !== 'undefined') {
      console.log('📊 W&B: Skipping browser logging');
      return;
    }
    
    await initWandB();
    if (!wandbRun) return;
    
    await wandb.log({
      // Success metrics
      'verification/success_rate': data.isVerified ? 1 : 0,
      'verification/total_attempts': 1,
      'verification/confidence': data.confidence,
      
      // Quality metrics (0-100)
      'quality/image_quality': data.qualityScore,
      'quality/liveness_score': data.livenessScore,
      'quality/authenticity': data.authenticityScore,
      'quality/average': (data.qualityScore + data.livenessScore + data.authenticityScore) / 3,
      
      // Security metrics
      'security/deepfake_probability': data.deepfakeProbability,
      'security/is_deepfake': data.deepfakeProbability > 30 ? 1 : 0,
      'security/is_suspicious': data.deepfakeProbability > 15 ? 1 : 0,
      
      // Performance metrics
      'performance/processing_time_ms': data.processingTimeMs,
      'performance/processing_time_seconds': data.processingTimeMs / 1000,
      'performance/is_slow': data.processingTimeMs > 5000 ? 1 : 0,
      
      // Failure analysis
      'failures/rejection_count': data.rejectionReasons?.length || 0,
      'failures/has_rejections': data.rejectionReasons && data.rejectionReasons.length > 0 ? 1 : 0,
      
      // User tracking (anonymized)
      'users/wallet_prefix': data.walletAddress.substring(0, 6),
      
      // Timestamp
      'timestamp': Date.now(),
    });

    // Log individual rejection reasons for detailed analysis
    if (!data.isVerified && data.rejectionReasons) {
      for (const reason of data.rejectionReasons) {
        const reasonKey = reason.toLowerCase().replace(/[^a-z0-9]/g, '_');
        await wandb.log({
          [`failures/reasons/${reasonKey}`]: 1
        });
      }
    }

    console.log('📊 W&B: Logged selfie verification');

  } catch (error) {
    console.error('❌ W&B logging error (verification):', error);
  }
}

/**
 * Log fraud score updates to W&B
 */
export async function logFraudScore(data: {
  walletAddress: string;
  oldScore: number;
  newScore: number;
  scoreImprovement: number;
  trustScores: {
    selfieVerification: number;
    repaymentHistory: number;
    walletAge: number;
    platformActivity: number;
    total: number;
  };
  riskLevel: string;
}) {
  try {
    // Skip W&B logging in browser environment
    if (typeof window !== 'undefined') {
      console.log('📊 W&B: Skipping browser logging');
      return;
    }
    
    await initWandB();
    if (!wandbRun) return;
    
    const riskLevelNumeric = 
      data.riskLevel === 'low' ? 0 : 
      data.riskLevel === 'medium' ? 1 : 2;
    
    await wandb.log({
      // Score tracking
      'scores/individual_score': data.newScore,
      'scores/old_score': data.oldScore,
      'scores/score_change': data.scoreImprovement,
      'scores/score_improved': data.scoreImprovement > 0 ? 1 : 0,
      'scores/trust_total': data.trustScores.total,
      
      // Score breakdown
      'scores/breakdown/selfie_verification': data.trustScores.selfieVerification,
      'scores/breakdown/repayment_history': data.trustScores.repaymentHistory,
      'scores/breakdown/wallet_age': data.trustScores.walletAge,
      'scores/breakdown/platform_activity': data.trustScores.platformActivity,
      
      // Risk assessment
      'risk/level_numeric': riskLevelNumeric,
      'risk/is_low_risk': data.riskLevel === 'low' ? 1 : 0,
      'risk/is_medium_risk': data.riskLevel === 'medium' ? 1 : 0,
      'risk/is_high_risk': data.riskLevel === 'high' ? 1 : 0,
      
      // User journey tracking
      'users/verified_count': 1,
      'users/avg_score': data.newScore,
      'users/wallet_prefix': data.walletAddress.substring(0, 6),
      
      // Timestamp
      'timestamp': Date.now(),
    });

    console.log('📊 W&B: Logged fraud score update');

  } catch (error) {
    console.error('❌ W&B logging error (fraud score):', error);
  }
}

/**
 * Log loan request and approval decisions
 */
export async function logLoanRequest(data: {
  walletAddress: string;
  requestedAmount: number;
  approvedAmount: number;
  isApproved: boolean;
  trustScore: number;
  riskLevel: string;
  denialReason?: string;
}) {
  try {
    await initWandB();
    if (!wandbRun) return;
    
    await wandb.log({
      // Loan metrics
      'loans/approval_rate': data.isApproved ? 1 : 0,
      'loans/requested_amount': data.requestedAmount,
      'loans/approved_amount': data.approvedAmount,
      'loans/approval_ratio': data.approvedAmount / (data.requestedAmount || 1),
      
      // Correlation analysis
      'loans/trust_score': data.trustScore,
      'loans/risk_level': data.riskLevel === 'low' ? 0 : data.riskLevel === 'medium' ? 1 : 2,
      
      // Denial tracking
      'loans/denial_count': data.isApproved ? 0 : 1,
      'loans/had_denial_reason': data.denialReason ? 1 : 0,
      
      // User tracking
      'users/wallet_prefix': data.walletAddress.substring(0, 6),
      
      'timestamp': Date.now(),
    });

    // Log denial reason if present
    if (!data.isApproved && data.denialReason) {
      const reasonKey = data.denialReason.toLowerCase().replace(/[^a-z0-9]/g, '_');
      await wandb.log({
        [`loans/denial_reasons/${reasonKey}`]: 1
      });
    }

    console.log('📊 W&B: Logged loan request');

  } catch (error) {
    console.error('❌ W&B logging error (loan):', error);
  }
}

/**
 * Log AI model performance metrics
 */
export async function logModelPerformance(data: {
  modelName: string;
  successRate: number;
  avgProcessingTime: number;
  falsePositiveRate?: number;
  falseNegativeRate?: number;
  totalRequests: number;
}) {
  try {
    await initWandB();
    if (!wandbRun) return;
    
    const accuracy = data.falsePositiveRate !== undefined && data.falseNegativeRate !== undefined
      ? 1 - ((data.falsePositiveRate + data.falseNegativeRate) / 2)
      : data.successRate;
    
    await wandb.log({
      // Model identification
      'model/name': data.modelName,
      
      // Performance metrics
      'model/success_rate': data.successRate,
      'model/avg_processing_time_ms': data.avgProcessingTime,
      'model/avg_processing_time_seconds': data.avgProcessingTime / 1000,
      'model/total_requests': data.totalRequests,
      
      // Accuracy metrics
      'model/accuracy': accuracy,
      'model/false_positive_rate': data.falsePositiveRate || 0,
      'model/false_negative_rate': data.falseNegativeRate || 0,
      
      'timestamp': Date.now(),
    });

    console.log('📊 W&B: Logged model performance');

  } catch (error) {
    console.error('❌ W&B logging error (model performance):', error);
  }
}

/**
 * Log API cost tracking
 */
export async function logAPICost(data: {
  service: string;
  requestCount: number;
  estimatedCost: number;
  tokenCount?: number;
}) {
  try {
    await initWandB();
    if (!wandbRun) return;
    
    await wandb.log({
      [`costs/${data.service}/request_count`]: data.requestCount,
      [`costs/${data.service}/estimated_cost`]: data.estimatedCost,
      [`costs/${data.service}/cost_per_request`]: data.estimatedCost / (data.requestCount || 1),
      [`costs/${data.service}/token_count`]: data.tokenCount || 0,
      
      'costs/total_requests': data.requestCount,
      'costs/total_cost': data.estimatedCost,
      
      'timestamp': Date.now(),
    });

    console.log('📊 W&B: Logged API cost');

  } catch (error) {
    console.error('❌ W&B logging error (cost):', error);
  }
}

/**
 * Finish W&B run (call this when shutting down)
 */
export async function finishWandB() {
  try {
    if (wandbRun) {
      await wandb.finish();
      wandbRun = null;
      console.log('✅ W&B run finished');
    }
  } catch (error) {
    console.error('❌ W&B finish error:', error);
  }
}

/**
 * Log custom event to W&B
 */
export async function logCustomEvent(eventName: string, data: Record<string, any>) {
  try {
    await initWandB();
    if (!wandbRun) return;
    
    await wandb.log({
      [`events/${eventName}`]: 1,
      ...Object.keys(data).reduce((acc, key) => {
        acc[`events/${eventName}/${key}`] = data[key];
        return acc;
      }, {} as Record<string, any>),
      'timestamp': Date.now(),
    });

    console.log(`📊 W&B: Logged custom event: ${eventName}`);

  } catch (error) {
    console.error('❌ W&B logging error (custom event):', error);
  }
}
