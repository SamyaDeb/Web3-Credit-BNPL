# Zentra - Decentralized Trust-Based Lending Protocol

<img width="1469" height="805" alt="Screenshot 2025-11-30 at 3 48 36 AM" src="https://github.com/user-attachments/assets/91dab987-a029-41e0-b71d-be117b3865ad" />


**Enabling Under-Collateralized Lending in Web3 through Community-Driven Trust Scores**

![Zentra Badge](https://img.shields.io/badge/Track-Web3%20Credit%20%26%20BNPL-blue)
![Status](https://img.shields.io/badge/Status-Live%20MVP-green)
![Network](https://img.shields.io/badge/Network-Polygon%20Amoy-purple)

---

## 🎯 Problem Statement

Web3 lacks a standard, privacy-preserving credit score, forcing users to over-collateralize loans and limiting access to flexible payments. Current lending protocols require 150-200% collateralization—users must lock up more assets than they borrow. This restricts capital efficiency, prevents Buy Now, Pay Later (BNPL) features, and excludes millions from accessing credit based on their on-chain behavior.

**Our mission:** Enable trust-based, under-collateralized lending using on-chain data and community validation.

---

## 💡 Our Solution

Zentra introduces a **decentralized Trust Score system** that enables under-collateralized loans through:

### 🔐 Multi-Factor Trust Scoring (0-100 Scale)

| Component | Max Points | Description |
|-----------|-----------|-------------|
| **Wallet Age Score** | 15 | Rewards established accounts (180+ days = 15 points) |
| **Repayment History** | 15 | Tracks on-chain loan performance (100% = 15 points) |
| **Selfie Verification** | 10 | Biometric identity confirmation via Gemini AI |
| **Circle Activity** | 10 | Community trust validation & participation |
| **Platform Activity** | 10 | Transaction history & engagement |
| **Total** | **60** | Base trust score (50% of approval decision) |

### 🚀 Key Features

✅ **Trust Circles** - Community-based lending pools where members vouch for each other  
✅ **AI Fraud Detection** - Real-time risk assessment using Google Gemini API  
✅ **Under-Collateralized Loans** - Borrow without 100% collateral based on trust score  
✅ **Dynamic Credit Limits** - Borrowing capacity increases with positive behavior  
✅ **Selfie Verification** - Liveness detection & deepfake prevention  
✅ **Privacy-First Design** - Verification without exposing wallet balances  
✅ **On-Chain Tracking** - All loan history transparently recorded on blockchain  
✅ **Instant Settlement** - Deferred payments settled automatically on-chain  

---

## 🛠️ Technical Stack

**Smart Contracts & Blockchain:**
- Solidity (Hardhat framework)
- Polygon Amoy Testnet
- Contract Address: `0xa3f87b884347388f59edcc8e229C0BbC1AE821bC`

**Frontend:**
- Next.js 14.2.0
- React 18.3
- TypeScript
- TailwindCSS
- Custom Cursor & UI Components

**Web3 Integration:**
- wagmi (React hooks for Ethereum)
- viem (TypeScript Ethereum utilities)
- WalletConnect
- MetaMask

**AI & ML:**
- Google Generative AI (Gemini Pro)
- Fraud detection & analysis
- Selfie verification with liveness detection

**Backend & Data:**
- Firebase (Firestore database)
- Fraud profiles & trust score storage
- Real-time updates

**Monitoring & Analytics:**
- Weights & Biases (W&B)
- Contract deployment tracking

---

## 📋 Smart Contract Functions

### Core Lending Functions
- `requestLoan(amount, purpose)` - Submit under-collateralized loan request
- `approveLoan(loanId)` - Admin approval based on fraud score
- `disburseLoan(loanId)` - Automatic fund distribution to borrower
- `repayLoan(loanId, amount)` - On-chain loan repayment
- `calculateLoanEligibility(address)` - Determine max borrowable amount

### Community Functions
- `createCircle(name)` - Form trust circles
- `joinCircle(circleId)` - Join existing circle
- `getCircleDetails(circleId)` - Retrieve circle members & scores
- `getCircleAverageScore(circleId)` - Community average trust score

### Admin Functions
- `depositLiquidity()` - Add funds to lending pool
- `withdraw(amount)` - Withdraw available funds
- `freezeAccount(address, reason)` - Flag suspicious accounts
- `syncFraudScore(address)` - Update trust scores from off-chain data

---

## 🚀 Getting Started

### Prerequisites
```bash
Node.js 18+
npm or yarn
Hardhat
MetaMask or WalletConnect
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/SamyaDeb/Zentra.git
cd Zentra
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env.local
```

Fill in the following:
```
NEXT_PUBLIC_CHAIN_ID=80002 # Polygon Amoy
NEXT_PUBLIC_CONTRACT_ADDRESS=0xa3f87b884347388f59edcc8e229C0BbC1AE821bC
NEXT_PUBLIC_RPC_URL=https://rpc-amoy.polygon.technology/

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
FIREBASE_PRIVATE_KEY=xxx

# Google Gemini API
NEXT_PUBLIC_GEMINI_API_KEY=xxx

# Optional: W&B Logging
WANDB_API_KEY=xxx
```

4. **Run development server**
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Deploy smart contracts** (Polygon Amoy testnet)
```bash
npx hardhat run scripts/deploy.js --network amoy
```

---

## 📊 API Endpoints

### Fraud Detection
```
POST /api/check-fraud
Body: { walletAddress, loanData }
Response: { fraudScore, riskLevel, recommendation }
```

### Selfie Verification
```
POST /api/verify-selfie
Body: { imageBase64, walletAddress }
Response: { verified, scores, analysis }
```

### Trust Score Sync
```
POST /api/sync-score
Body: { walletAddress }
Response: { updatedScore, breakdown }
```

### Fraud Profile
```
GET /api/fraud-profile?address=0x...
Response: { profile, score, riskLevel }
```

---

## 🎮 User Flows

### Borrower Flow
1. **Connect Wallet** → MetaMask/WalletConnect
2. **Create/Join Trust Circle** → Community validation
3. **Complete Selfie Verification** → Biometric confirmation
4. **View Trust Score** → Multi-factor breakdown
5. **Request Loan** → Enter amount & purpose
6. **Get Instant Approval** → Based on trust score
7. **Receive Funds** → Automatic disbursement
8. **Repay on Schedule** → On-chain settlement

### Lender/Admin Flow
1. **Deposit Liquidity** → Add funds to pool
2. **Review Pending Loans** → AI fraud assessment
3. **Approve/Deny** → Risk-based decisions
4. **Monitor Repayments** → Track on-chain activity
5. **Withdraw Earnings** → Access available balance

---

## 🔐 Security & Privacy

✅ **Privacy-Preserving:** Trust scores based on on-chain data without KYC  
✅ **Fraud Detection:** Real-time AI risk assessment protects lenders  
✅ **Biometric Security:** Liveness detection prevents synthetic identity fraud  
✅ **Smart Contract Audits:** [Add if audited]  
✅ **Non-Custodial:** Users maintain full control of assets  
✅ **Transparent:** All loan data recorded on-chain  

---

## 📈 Innovation Highlights

🎯 **First Decentralized Credit Bureau** - Privacy-respecting, lender-protective  
🎯 **AI-Powered Risk Assessment** - Real-time Gemini-based fraud detection  
🎯 **Community-Driven Trust** - Social validation through Trust Circles  
🎯 **Biometric Verification** - Deepfake detection & liveness checks  
🎯 **Capital Efficient** - Under-collateralized lending unlocks Web3 potential  
🎯 **Privacy-First** - No external data brokers or KYC requirements  

---

## 📊 Project Structure

```
Zentra/
├── app/
│   ├── api/                    # API routes
│   │   ├── check-fraud/
│   │   ├── verify-selfie/
│   │   ├── fraud-profile/
│   │   └── sync-score/
│   ├── admin/                  # Admin dashboard
│   ├── user/                   # User dashboard
│   ├── fraud-demo/             # Demo page
│   └── kyc-verify/             # KYC verification
├── components/                 # React components
│   ├── ConnectButton.tsx
│   ├── FraudScoreBadge.tsx
│   ├── TrustScoreBreakdown.tsx
│   └── Navbar.tsx
├── contracts/                  # Smart contracts
│   └── TrustCircles.sol
├── lib/                        # Utilities & helpers
│   ├── fraudDetection.ts
│   ├── fraudDatabase.ts
│   ├── gemini.ts
│   ├── contract.ts
│   └── firebase.ts
├── hooks/                      # Custom React hooks
│   ├── useContract.ts
│   └── useFraudDetection.ts
├── config/                     # Configuration
│   ├── chains.ts
│   └── wagmiConfig.ts
└── scripts/                    # Deployment scripts
    └── deploy.js
```

---

## 🧪 Testing

Run tests:
```bash
npm run test
```

Run fraud detection locally:
```bash
npm run dev
# Navigate to /fraud-demo
```

---

## 🌐 Live Demo

- **MVP Frontend:** [Your deployed URL]
- **Smart Contract:** [Polygon Amoy Explorer Link]
- **Demo Account:** [If available]

---

## 📝 Hackathon Track

**Track:** Web3 Credit & BNPL - Decentralized Underwriting & Trust-Based Payments

**Success Criteria Met:**
✅ Functional prototype with live smart contracts  
✅ Trust-based payment system with deferred settlement  
✅ On-chain creditworthiness tracking  
✅ Privacy-respecting lender protection mechanism  

---

## 🚀 Future Roadmap

- [ ] Zero-Knowledge Proofs for balance verification
- [ ] Cross-chain trust score portability
- [ ] Decentralized oracle integration
- [ ] Insurance pools for lender protection
- [ ] Mobile app with in-wallet payments
- [ ] Governance token & DAO
- [ ] Integration with major lending protocols
- [ ] Real-world identity partnerships

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**Project Lead:** Samya Deb  
**GitHub:** [SamyaDeb](https://github.com/SamyaDeb)  
**Email:** [Your email]  
**Discord:** [Your handle]

---

## 🙏 Acknowledgments

- **Google Gemini API** - AI-powered fraud detection & verification
- **Polygon** - Blockchain infrastructure
- **Hardhat** - Smart contract development
- **wagmi & viem** - Web3 integration libraries
- **Firebase** - Data persistence

---

## 📞 Support

For questions, issues, or partnerships:
- **GitHub Issues:** [Report bugs](https://github.com/SamyaDeb/Zentra/issues)
- **Email:** [Your email]
- **Discord:** [Your server/handle]

---

## 🔗 Useful Links

- [Polygon Documentation](https://polygon.technology/developers)
- [Hardhat Docs](https://hardhat.org/getting-started)
- [wagmi Documentation](https://wagmi.sh)
- [Google Generative AI](https://ai.google.dev)

---

**Built with ❤️ for the Web3 Community**
