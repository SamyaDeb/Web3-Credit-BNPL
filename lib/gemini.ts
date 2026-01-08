import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

// Gemini Pro for text-based fraud analysis
export const geminiProModel = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Gemini Pro Vision for image-based verification
export const geminiVisionModel = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

/**
 * Analyze fraud risk for a loan request
 */
export async function analyzeFraudRisk(data: {
  walletAge: number;
  requestedAmount: number;
  maxEligible: number;
  loanPurpose: string;
  previousLoans: number;
  successfulRepayments: number;
  circleScore: number;
  hasVerification: boolean;
}): Promise<{
  fraudScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  riskFactors: Array<{ factor: string; points: number; severity: string }>;
  trustFactors: Array<{ factor: string; points: number }>;
  recommendation: 'approve' | 'review' | 'block';
  explanation: string;
}> {
  const prompt = `You are a fraud detection expert for a blockchain lending platform.

Analyze this loan request and calculate a fraud risk score (0-100):

LOAN REQUEST DATA:
- Wallet Age: ${data.walletAge} days
- Requested Amount: $${data.requestedAmount}
- Max Eligible Amount: $${data.maxEligible}
- Loan Purpose: "${data.loanPurpose}"
- Previous Loans: ${data.previousLoans}
- Successful Repayments: ${data.successfulRepayments}
- Circle Score: ${data.circleScore}
- Has Selfie Verification: ${data.hasVerification ? 'Yes' : 'No'}

FRAUD SCORING RULES:
Base Score: 50 (neutral)

ADD POINTS (increase risk):
+ Wallet Age < 7 days: +25 points
+ No previous transactions: +20 points
+ Requesting max eligible amount (>90%): +15 points
+ Generic loan purpose (vague/template): +10 points
+ No selfie verification: +20 points
+ No successful repayments: +15 points
+ Low circle score (<500): +10 points

SUBTRACT POINTS (decrease risk):
- Wallet age > 180 days: -15 points
- 100% repayment history: -25 points
- Multiple successful loans (3+): -20 points
- Verified identity (selfie): -20 points
- Specific, detailed loan purpose: -10 points
- High circle score (>700): -15 points
- Requesting modest amount (<50% eligible): -10 points

DECISION THRESHOLDS:
- 0-30: Low Risk (Green) → Approve
- 31-60: Medium Risk (Yellow) → Manual Review
- 61-100: High Risk (Red) → Block

OUTPUT FORMAT (strict JSON):
{
  "fraudScore": <number 0-100>,
  "riskLevel": "low" | "medium" | "high",
  "riskFactors": [
    {"factor": "description", "points": number, "severity": "low|medium|high|critical"}
  ],
  "trustFactors": [
    {"factor": "description", "points": number}
  ],
  "recommendation": "approve" | "review" | "block",
  "explanation": "Clear 2-3 sentence explanation of the decision"
}

Analyze and respond with ONLY valid JSON, no other text.`;

  try {
    const result = await geminiProModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response (remove markdown code blocks if present)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from Gemini');
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    return analysis;
  } catch (error) {
    console.error('Gemini fraud analysis error:', error);
    // Return safe default
    return {
      fraudScore: 50,
      riskLevel: 'medium',
      riskFactors: [],
      trustFactors: [],
      recommendation: 'review',
      explanation: 'Unable to complete AI analysis. Manual review required.',
    };
  }
}

/**
 * Verify selfie image for KYC
 */
export async function verifySelfie(imageBase64: string): Promise<{
  isVerified: boolean;
  isRealPerson: boolean;
  isLivePhoto: boolean;
  faceDetected: boolean;
  qualityScore: number;
  livenessScore: number;
  authenticityScore: number;
  deepfakeProbability: number;
  verificationRecommendation: 'approve' | 'reject' | 'manual_review';
  rejectionReasons: string[];
  confidence: number;
  detailedAnalysis: string;
}> {
  const prompt = `You are an identity verification expert for a blockchain lending platform.

Analyze this selfie image for authenticity:

VERIFICATION TASKS:
1. Is this a real person's photo (not AI-generated)?
2. Is this a live photo (not a screenshot or printed photo)?
3. Is a clear human face visible?
4. Detect any signs of:
   - Deepfake/AI generation
   - Photo of a photo (phone/screen)
   - Mask or face covering
   - Multiple faces
   - Poor quality (blur, darkness)
   - Spoofing attempts

SCORING CRITERIA:
- Quality Score (0-100): Image clarity, lighting, resolution
- Liveness Score (0-100): Probability this is a live capture
- Authenticity Score (0-100): Probability this is a real person
- Deepfake Probability (0-100): Likelihood of AI manipulation

DECISION RULES:
- If deepfake_probability > 30 OR liveness_score < 50 → recommend rejection
- If quality_score < 40 → ask for retake (manual_review)
- Otherwise → approve

OUTPUT FORMAT (strict JSON):
{
  "isVerified": boolean,
  "isRealPerson": boolean,
  "isLivePhoto": boolean,
  "faceDetected": boolean,
  "qualityScore": number,
  "livenessScore": number,
  "authenticityScore": number,
  "deepfakeProbability": number,
  "verificationRecommendation": "approve" | "reject" | "manual_review",
  "rejectionReasons": [string array],
  "confidence": number,
  "detailedAnalysis": "detailed reasoning for your decision"
}

Analyze and respond with ONLY valid JSON, no other text.`;

  try {
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: 'image/jpeg',
      },
    };

    const result = await geminiVisionModel.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from Gemini Vision');
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    return analysis;
  } catch (error) {
    console.error('Gemini selfie verification error:', error);
    // Return safe default
    return {
      isVerified: false,
      isRealPerson: false,
      isLivePhoto: false,
      faceDetected: false,
      qualityScore: 0,
      livenessScore: 0,
      authenticityScore: 0,
      deepfakeProbability: 100,
      verificationRecommendation: 'manual_review',
      rejectionReasons: ['Unable to verify image. Please try again.'],
      confidence: 0,
      detailedAnalysis: 'AI analysis failed. Manual review required.',
    };
  }
}
// Gemini AI integration
// Gemini AI integration
