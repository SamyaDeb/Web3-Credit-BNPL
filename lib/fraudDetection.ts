import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  FraudAnalysisResult, 
  GeminiFraudResponse, 
  GeminiSelfieResponse,
  RiskLevel 
} from './types/fraud';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

// ==========================================
// INDIVIDUAL TRUST SCORE CALCULATION
// ==========================================

export interface TrustScoreBreakdown {
  walletAgeScore: number; // 0-15
  repaymentHistoryScore: number; // 0-15
  selfieVerificationScore: number; // 0-10
  circleActivityScore: number; // 0-10
  platformActivityScore: number; // 0-10
  totalTrustScore: number; // 0-60 max
  riskLevel: RiskLevel;
}

export function calculateTrustScoreBreakdown(data: {
  walletAge?: number; // days
  totalTransactions?: number;
  successfulRepayments?: number;
  previousLoans?: number;
  isVerified?: boolean;
  circleCount?: number;
  platformActivityDays?: number;
  circleMembers?: Array<{ trustScore: number }>; // For calculating circle average
}): TrustScoreBreakdown {
  // 1. Wallet Age Score (0-15)
  let walletAgeScore = 0;
  if (data.walletAge) {
    if (data.walletAge >= 180) walletAgeScore = 15;
    else if (data.walletAge >= 90) walletAgeScore = 10;
    else if (data.walletAge >= 30) walletAgeScore = 5;
  }

  // 2. Repayment History Score (0-15)
  let repaymentHistoryScore = 0;
  if (data.previousLoans && data.successfulRepayments) {
    const successRate = data.successfulRepayments / data.previousLoans;
    if (successRate === 1.0) repaymentHistoryScore = 15;
    else if (successRate >= 0.9) repaymentHistoryScore = 12;
    else if (successRate >= 0.75) repaymentHistoryScore = 8;
    else if (successRate >= 0.5) repaymentHistoryScore = 4;
  }

  // 3. Selfie Verification Score (0-10)
  const selfieVerificationScore = data.isVerified ? 10 : 0;

  // 4. Circle Activity Score (0-10) - Based on average of circle members
  let circleActivityScore = 0;
  if (data.circleMembers && data.circleMembers.length >= 3) {
    // Calculate average trust score of circle members
    const totalCircleScore = data.circleMembers.reduce((sum, member) => sum + member.trustScore, 0);
    const averageCircleScore = totalCircleScore / data.circleMembers.length;
    
    // Map average circle score (0-60) to circle activity score (0-10)
    circleActivityScore = Math.round((averageCircleScore / 60) * 10);
  } else if (data.circleCount) {
    // Fallback if circle member data not available
    if (data.circleCount >= 5) circleActivityScore = 10;
    else if (data.circleCount >= 3) circleActivityScore = 7;
    else if (data.circleCount >= 1) circleActivityScore = 4;
  }

  // 5. Platform Activity Score (0-10)
  let platformActivityScore = 0;
  if (data.platformActivityDays) {
    if (data.platformActivityDays >= 90) platformActivityScore = 10;
    else if (data.platformActivityDays >= 30) platformActivityScore = 7;
    else if (data.platformActivityDays >= 7) platformActivityScore = 4;
  }

  // Total Trust Score (0-60)
  const totalTrustScore = 
    walletAgeScore + 
    repaymentHistoryScore + 
    selfieVerificationScore + 
    circleActivityScore + 
    platformActivityScore;

  // Determine Risk Level based on total score
  let riskLevel: RiskLevel;
  if (totalTrustScore >= 40) riskLevel = 'low';
  else if (totalTrustScore >= 20) riskLevel = 'medium';
  else riskLevel = 'high';

  return {
    walletAgeScore,
    repaymentHistoryScore,
    selfieVerificationScore,
    circleActivityScore,
    platformActivityScore,
    totalTrustScore,
    riskLevel
  };
}

// ==========================================
// FRAUD DETECTION WITH GEMINI
// ==========================================

interface LoanRequestData {
  walletAddress: string;
  walletAge: number; // in days
  totalTransactions: number;
  requestedAmount: number;
  maxEligible: number;
  loanPurpose: string;
  previousLoans: number;
  successfulRepayments: number;
  hasVerification: boolean;
  circleCount: number;
}

export async function analyzeFraudWithGemini(
  loanData: LoanRequestData
): Promise<FraudAnalysisResult> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `You are a fraud detection expert for a blockchain lending platform.

Analyze this loan request using TRUST-BASED SCORING (higher score = more trustworthy):

USER DATA:
- Wallet Address: ${loanData.walletAddress}
- Wallet Age: ${loanData.walletAge} days
- Total Transactions: ${loanData.totalTransactions}
- Previous Loans: ${loanData.previousLoans}
- Successful Repayments: ${loanData.successfulRepayments}
- Selfie Verified: ${loanData.hasVerification ? 'Yes' : 'No'}
- Active Circles: ${loanData.circleCount}

LOAN REQUEST:
- Amount: $${loanData.requestedAmount}
- Max Eligible: $${loanData.maxEligible}
- Loan-to-Max Ratio: ${((loanData.requestedAmount / loanData.maxEligible) * 100).toFixed(0)}%
- Purpose: "${loanData.loanPurpose}"

TRUST SCORING BREAKDOWN (0-60 total):
1. Wallet Age (0-15): ${loanData.walletAge >= 180 ? '15' : loanData.walletAge >= 90 ? '10' : '5'}
2. Repayment History (0-15): ${loanData.previousLoans > 0 ? (loanData.successfulRepayments / loanData.previousLoans * 15).toFixed(0) : '0'}
3. Selfie Verified (0-10): ${loanData.hasVerification ? '10' : '0'}
4. Circle Activity (0-10): ${loanData.circleCount >= 3 ? '10' : loanData.circleCount >= 1 ? '5' : '0'}
5. Platform Activity (0-10): Based on transaction count

RISK LEVELS:
- 40-60: Low Risk (🟢 Auto-approve)
- 20-39: Medium Risk (🟡 Manual review)
- 0-19: High Risk (🔴 Block)

Provide detailed analysis considering ONLY trust factors. Do NOT penalize for missing criteria.

IMPORTANT - TRUST ONLY APPROACH:
- Users START at 0 points
- Only POSITIVE trust factors add to their score
- Missing factors = 0 points (not negative)
- No penalties or risk additions

OUTPUT FORMAT (JSON):
{
  "trust_score": <0-60>,
  "risk_level": "low" | "medium" | "high",
  "trust_factors": [
    {
      "factor": "wallet_age",
      "points": 15,
      "evidence": "Wallet active for 200+ days"
    }
  ],
  "areas_for_improvement": [
    "Complete selfie verification to earn +10 points",
    "Join more trust circles to earn up to +10 points"
  ],
  "recommendation": "approve" | "review" | "block",
  "explanation": "detailed reasoning based on trust earned",
  "confidence": <0-100>
}

SCORING GUIDELINES:
- 40-60 points: Low risk (🟢) → recommend "approve"
- 20-39 points: Medium risk (🟡) → recommend "review"  
- 0-19 points: High risk (🔴) → recommend "block"

Focus on what the user HAS achieved, not what they lack. Respond with ONLY valid JSON.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse Gemini response
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const geminiResponse = JSON.parse(cleanedText);

    return {
      fraudScore: geminiResponse.trust_score || 0,
      riskLevel: geminiResponse.risk_level,
      riskFactors: [], // No risk factors in trust-only system
      trustFactors: (geminiResponse.trust_factors || []).map((tf: any) => ({
        type: tf.factor,
        points: tf.points,
        evidence: tf.evidence || `Trust factor: ${tf.factor}`,
      })),
      recommendation: geminiResponse.recommendation,
      explanation: geminiResponse.explanation,
      confidence: geminiResponse.confidence,
    };
  } catch (error) {
    console.error('Error analyzing fraud with Gemini:', error);
    
    // Fallback to basic scoring if Gemini fails
    return getFallbackFraudScore(loanData);
  }
}

// ==========================================
// SELFIE VERIFICATION WITH GEMINI VISION
// ==========================================

export async function verifySelfieWithGemini(
  imageBase64: string,
  retries = 3
): Promise<GeminiSelfieResponse> {
  try {
    console.log('🔍 Starting Gemini AI selfie verification...');
    
    // Basic image validation
    if (!imageBase64 || imageBase64.length < 1000) {
      return {
        is_verified: false,
        is_real_person: false,
        is_live_photo: false,
        face_detected: false,
        quality_score: 0,
        liveness_score: 0,
        authenticity_score: 0,
        deepfake_probability: 100,
        verification_recommendation: 'reject',
        rejection_reasons: ['Invalid image data - image too small or corrupted'],
        confidence: 0,
        detailed_analysis: 'The provided image data is invalid or too small. Please capture a clear selfie.'
      };
    }
    
    console.log(`🤖 Calling Gemini 2.0 Flash via REST API... (${4 - retries > 0 ? `retry ${4 - retries}` : 'first attempt'})`);
    
    // Remove data URL prefix if present
    const cleanBase64 = imageBase64.replace(/^data:image\/[^;]+;base64,/, '');
    
    // Get API key from environment
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }
    
    // Prepare request payload for Gemini REST API
    const requestBody = {
      contents: [{
        parts: [
          {
            text: `Analyze this selfie image for identity verification. Determine if it shows a real human face.

STRICT REQUIREMENTS:
- Must show a clear, visible human face
- Must be a real person (not AI-generated, cartoon, or drawing)
- Must be a live photo (not a screenshot or photo of a photo)
- Face must be well-lit and in focus
- Only ONE face should be visible

RESPONSE FORMAT (JSON only, no markdown):
{
  "is_verified": boolean,
  "is_real_person": boolean,
  "is_live_photo": boolean,
  "face_detected": boolean,
  "quality_score": number (0-100),
  "liveness_score": number (0-100),
  "authenticity_score": number (0-100),
  "deepfake_probability": number (0-100),
  "verification_recommendation": "approve" | "reject" | "manual_review",
  "rejection_reasons": string[],
  "confidence": number (0-100),
  "detailed_analysis": string
}`
          },
          {
            inline_data: {
              mime_type: 'image/jpeg',
              data: cleanBase64
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 1,
        maxOutputTokens: 2048,
      }
    };
    
    // Call Gemini REST API v1beta with gemini-2.0-flash-exp
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: { message: errorText } };
      }
      
      // Handle rate limit (429) with exponential backoff retry
      if (response.status === 429 && retries > 0) {
        const waitTime = (4 - retries) * 20000; // 20s, 40s, 60s for retries 1, 2, 3
        console.log(`⏳ Rate limit reached. Waiting ${waitTime / 1000} seconds before retry ${4 - retries}/3...`);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
        // Recursive retry
        return verifySelfieWithGemini(imageBase64, retries - 1);
      }
      
      console.error('❌ Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('📄 Gemini API response:', JSON.stringify(data, null, 2));
    
    // Extract text from response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('No response text from Gemini API');
    }
    
    console.log('📄 Gemini raw text:', text);
    
    // Parse JSON from response
    let jsonText = text.trim();
    
    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/m, '').replace(/\s*```$/m, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/m, '').replace(/\s*```$/m, '');
    }
    
    // Extract JSON object
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from Gemini AI');
    }
    
    const analysis: GeminiSelfieResponse = JSON.parse(jsonMatch[0]);
    
    console.log('✅ Gemini AI analysis complete:', analysis);
    
    // Additional validation: if no face detected, force rejection
    if (!analysis.face_detected) {
      analysis.is_verified = false;
      analysis.verification_recommendation = 'reject';
      if (!analysis.rejection_reasons.includes('No face detected')) {
        analysis.rejection_reasons.unshift('No face detected in image');
      }
    }
    
    // Force approval if face detected and real person
    if (analysis.face_detected && analysis.is_real_person) {
      analysis.is_verified = true;
      analysis.verification_recommendation = 'approve';
    }
    
    return analysis;
    
  } catch (error: any) {
    console.error('❌ Error verifying selfie with Gemini AI:', error);
    
    // Check if it's a quota/rate limit error
    if (error?.message?.includes('quota') || error?.message?.includes('429')) {
      return {
        is_verified: false,
        is_real_person: false,
        is_live_photo: false,
        face_detected: false,
        quality_score: 0,
        liveness_score: 0,
        authenticity_score: 0,
        deepfake_probability: 100,
        verification_recommendation: 'manual_review',
        rejection_reasons: ['API rate limit reached. Please wait 1 minute and try again.'],
        confidence: 0,
        detailed_analysis: 'The Gemini AI service has reached its rate limit. Please wait a moment and try again.'
      };
    }
    
    // Check if API key error
    if (error?.message?.includes('API key') || error?.message?.includes('401')) {
      return {
        is_verified: false,
        is_real_person: false,
        is_live_photo: false,
        face_detected: false,
        quality_score: 0,
        liveness_score: 0,
        authenticity_score: 0,
        deepfake_probability: 100,
        verification_recommendation: 'manual_review',
        rejection_reasons: ['API configuration error. Please contact support.'],
        confidence: 0,
        detailed_analysis: 'The Gemini API key is invalid or not configured properly.'
      };
    }
    
    // Return safe rejection response on other errors
    return {
      is_verified: false,
      is_real_person: false,
      is_live_photo: false,
      face_detected: false,
      quality_score: 0,
      liveness_score: 0,
      authenticity_score: 0,
      deepfake_probability: 100,
      verification_recommendation: 'manual_review',
      rejection_reasons: ['Verification system error - please try again'],
      confidence: 0,
      detailed_analysis: `Verification error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try capturing your selfie again.`
    };
  }
}

// ==========================================
// FALLBACK FUNCTIONS
// ==========================================

function getFallbackFraudScore(loanData: LoanRequestData): FraudAnalysisResult {
  // Use trust-based scoring (0-60 scale)
  const trustBreakdown = calculateTrustScoreBreakdown({
    walletAge: loanData.walletAge,
    totalTransactions: loanData.totalTransactions,
    successfulRepayments: loanData.successfulRepayments,
    previousLoans: loanData.previousLoans,
    isVerified: loanData.hasVerification,
    circleCount: loanData.circleCount,
  });

  const trustFactors: any[] = [];

  // Build trust factors list
  if (trustBreakdown.walletAgeScore > 0) {
    trustFactors.push({
      type: 'wallet_age',
      points: trustBreakdown.walletAgeScore,
      evidence: `Wallet ${loanData.walletAge} days old (+${trustBreakdown.walletAgeScore} points)`,
    });
  }

  if (trustBreakdown.repaymentHistoryScore > 0) {
    trustFactors.push({
      type: 'repayment_history',
      points: trustBreakdown.repaymentHistoryScore,
      evidence: `${loanData.successfulRepayments}/${loanData.previousLoans} successful repayments (+${trustBreakdown.repaymentHistoryScore} points)`,
    });
  }

  if (trustBreakdown.selfieVerificationScore > 0) {
    trustFactors.push({
      type: 'selfie_verified',
      points: trustBreakdown.selfieVerificationScore,
      evidence: `Identity verified (+${trustBreakdown.selfieVerificationScore} points)`,
    });
  }

  if (trustBreakdown.circleActivityScore > 0) {
    trustFactors.push({
      type: 'circle_activity',
      points: trustBreakdown.circleActivityScore,
      evidence: `Active in ${loanData.circleCount} circles (+${trustBreakdown.circleActivityScore} points)`,
    });
  }

  return {
    fraudScore: trustBreakdown.totalTrustScore,
    riskLevel: trustBreakdown.riskLevel,
    riskFactors: [], // No risk factors in trust-only system
    trustFactors,
    recommendation: trustBreakdown.totalTrustScore >= 40 ? 'approve' : 
                   trustBreakdown.totalTrustScore >= 20 ? 'review' : 'block',
    explanation: `Trust score: ${trustBreakdown.totalTrustScore}/60. ${
      trustBreakdown.totalTrustScore >= 40 
        ? 'Strong trust profile - approved' 
        : trustBreakdown.totalTrustScore >= 20
          ? 'Moderate trust - manual review recommended'
          : 'Low trust score - build more history'
    }`,
    confidence: 75,
  };
}
// Advanced fraud scoring
// Advanced fraud scoring
