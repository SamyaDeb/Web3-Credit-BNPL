// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

/**
 * @title TrustCircles - Community-Based Micro-Lending Platform
 * @notice Enables peer-to-peer lending with trust circles and credit scoring
 * @dev All loans have 7-day duration, scores range 0-100
 */
contract TrustCircles {
    
    // ============ STRUCTS ============
    
    struct Circle {
        uint256 id;
        string name;
        address[] members;
        uint256 totalStake;
        uint256 createdAt;
        bool isActive;
    }
    
    struct MemberData {
        uint256 circleId;
        uint256 individualScore;
        uint256 trustBond;
        uint256 totalBorrowed;
        uint256 totalRepaid;
        uint256 loansCompleted;
        bool isActive;
        bool hasActiveLoan;
    }
    
    struct Loan {
        uint256 id;
        address borrower;
        uint256 amount;
        uint256 interestAmount;
        uint256 totalRepayment;
        uint256 requestTime;
        uint256 approvalTime;
        uint256 disbursementTime;
        uint256 dueDate;
        uint256 repaymentTime;
        bool approved;
        bool disbursed;
        bool repaid;
        string purpose;
    }
    
    // ============ STATE VARIABLES ============
    
    address public admin;
    uint256 public circleCount;
    uint256 public loanCount;
    
    // Constants
    uint256 public constant MIN_CIRCLE_MEMBERS = 3;
    uint256 public constant STARTING_SCORE = 50;
    uint256 public constant MAX_SCORE = 100;
    uint256 public constant MIN_STAKE = 500000000000000000; // 0.5 ether in wei
    uint256 public constant LOAN_DURATION = 7 days;
    uint256 public constant INDIVIDUAL_WEIGHT = 60; // 60%
    uint256 public constant CIRCLE_WEIGHT = 40; // 40%
    
    // Score adjustments
    uint256 public constant ON_TIME_BONUS = 10;
    uint256 public constant EARLY_BONUS = 15;
    uint256 public constant LATE_PENALTY = 5;
    uint256 public constant VERY_LATE_PENALTY = 30;
    uint256 public constant DEFAULT_PENALTY = 50;
    uint256 public constant CIRCLE_DEFAULT_PENALTY = 20;
    
    // Demo mode (can be toggled for hackathon)
    bool public isDemoMode = false;
    uint256 public demoLoanDuration = 7 minutes;
    
    // Mappings
    mapping(uint256 => Circle) public circles;
    mapping(address => MemberData) public members;
    mapping(uint256 => Loan) public loans;
    mapping(address => uint256[]) public userLoans;
    mapping(uint256 => bool) public circleExists;
    
    // ============ EVENTS ============
    
    event CircleCreated(uint256 indexed circleId, string name, address indexed creator);
    event MemberJoined(uint256 indexed circleId, address indexed member, uint256 totalMembers);
    event CircleActivated(uint256 indexed circleId);
    event LoanRequested(uint256 indexed loanId, address indexed borrower, uint256 amount, string purpose);
    event LoanApproved(uint256 indexed loanId, address indexed borrower);
    event LoanDisbursed(uint256 indexed loanId, address indexed borrower, uint256 amount);
    event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 creditBonus);
    event ScoreUpdated(address indexed user, uint256 newScore, string reason);
    event CircleScoreUpdated(uint256 indexed circleId, uint256 newAverage);
    event AccountFrozen(address indexed user, string reason);
    event DemoModeToggled(bool enabled);
    event LiquidityDeposited(address indexed admin, uint256 amount, uint256 newBalance);
    event FundsWithdrawn(address indexed admin, uint256 amount, uint256 remainingBalance);
    
    // ============ MODIFIERS ============
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }
    
    modifier notFrozen() {
        require(members[msg.sender].isActive, "Account frozen");
        _;
    }
    
    modifier inActiveCircle() {
        uint256 circleId = members[msg.sender].circleId;
        require(circleId > 0, "Not in a circle");
        require(circles[circleId].isActive, "Circle not active");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor() {
        admin = msg.sender;
    }
    
    // ============ CIRCLE MANAGEMENT ============
    
    /**
     * @notice Create a new Trust Circle
     * @param _name Name of the circle
     */
    function createCircle(string memory _name) external payable {
        require(msg.value >= MIN_STAKE, "Stake at least 0.5 POL");
        require(members[msg.sender].circleId == 0, "Already in a circle");
        require(bytes(_name).length > 0, "Name required");
        
        circleCount++;
        
        address[] memory initialMembers = new address[](1);
        initialMembers[0] = msg.sender;
        
        circles[circleCount] = Circle({
            id: circleCount,
            name: _name,
            members: initialMembers,
            totalStake: msg.value,
            createdAt: block.timestamp,
            isActive: false // Needs 3 members
        });
        
        members[msg.sender] = MemberData({
            circleId: circleCount,
            individualScore: STARTING_SCORE,
            trustBond: msg.value,
            totalBorrowed: 0,
            totalRepaid: 0,
            loansCompleted: 0,
            isActive: true,
            hasActiveLoan: false
        });
        
        circleExists[circleCount] = true;
        
        emit CircleCreated(circleCount, _name, msg.sender);
    }
    
    /**
     * @notice Join an existing Trust Circle
     * @param _circleId ID of the circle to join
     */
    function joinCircle(uint256 _circleId) external payable {
        require(msg.value >= MIN_STAKE, "Stake at least 0.5 POL");
        require(members[msg.sender].circleId == 0, "Already in a circle");
        require(circleExists[_circleId], "Circle doesn't exist");
        
        Circle storage circle = circles[_circleId];
        require(circle.members.length < 10, "Circle full");
        
        circle.members.push(msg.sender);
        circle.totalStake += msg.value;
        
        members[msg.sender] = MemberData({
            circleId: _circleId,
            individualScore: STARTING_SCORE,
            trustBond: msg.value,
            totalBorrowed: 0,
            totalRepaid: 0,
            loansCompleted: 0,
            isActive: true,
            hasActiveLoan: false
        });
        
        // Activate circle when it reaches minimum members
        if (circle.members.length >= MIN_CIRCLE_MEMBERS && !circle.isActive) {
            circle.isActive = true;
            emit CircleActivated(_circleId);
        }
        
        emit MemberJoined(_circleId, msg.sender, circle.members.length);
    }
    
    // ============ SCORE CALCULATIONS ============
    
    /**
     * @notice Calculate circle's average score
     * @param _circleId ID of the circle
     */
    function getCircleAverageScore(uint256 _circleId) public view returns (uint256) {
        Circle memory circle = circles[_circleId];
        if (circle.members.length == 0) return STARTING_SCORE;
        
        uint256 totalScore = 0;
        for (uint i = 0; i < circle.members.length; i++) {
            MemberData memory member = members[circle.members[i]];
            uint256 score = member.individualScore > 0 ? member.individualScore : STARTING_SCORE;
            totalScore += score;
        }
        
        return totalScore / circle.members.length;
    }
    
    /**
     * @notice Calculate user's final trust score
     * @param _user Address of the user
     * @return Final trust score (0-100)
     */
    function getTrustScore(address _user) public view returns (uint256) {
        MemberData memory member = members[_user];
        
        uint256 individualScore = member.individualScore > 0 ? member.individualScore : STARTING_SCORE;
        
        if (member.circleId == 0) {
            return individualScore;
        }
        
        Circle memory circle = circles[member.circleId];
        if (!circle.isActive) {
            return individualScore;
        }
        
        uint256 circleAverage = getCircleAverageScore(member.circleId);
        
        // Final = (Individual × 60%) + (Circle × 40%)
        uint256 finalScore = (individualScore * INDIVIDUAL_WEIGHT + circleAverage * CIRCLE_WEIGHT) / 100;
        
        return finalScore;
    }
    
    /**
     * @notice Get maximum loan amount based on trust score
     * @param _user Address of the user
     */
    function getMaxLoanAmount(address _user) public view returns (uint256) {
        uint256 score = getTrustScore(_user);
        
        if (score < 60) return 10 ether;
        if (score < 70) return 20 ether;
        if (score < 80) return 50 ether;
        if (score < 90) return 100 ether;
        return 200 ether;
    }
    
    /**
     * @notice Get interest rate based on trust score
     * @param _user Address of the user
     */
    function getInterestRate(address _user) public view returns (uint256) {
        uint256 score = getTrustScore(_user);
        
        if (score < 60) return 6;
        if (score < 70) return 4;
        if (score < 80) return 4;
        if (score < 90) return 2;
        return 2;
    }
    
    // ============ LOAN MANAGEMENT ============
    
    /**
     * @notice Request a new loan
     * @param _amount Amount to borrow in wei
     * @param _purpose Purpose of the loan
     */
    function requestLoan(uint256 _amount, string memory _purpose) 
        external 
        notFrozen 
        inActiveCircle 
    {
        require(!members[msg.sender].hasActiveLoan, "Already have active loan");
        require(_amount > 0, "Amount must be greater than 0");
        require(bytes(_purpose).length > 0, "Purpose required");
        
        uint256 maxAmount = getMaxLoanAmount(msg.sender);
        require(_amount <= maxAmount, "Amount exceeds limit");
        
        uint256 interestRate = getInterestRate(msg.sender);
        uint256 interest = (_amount * interestRate) / 100;
        uint256 totalRepayment = _amount + interest;
        
        loanCount++;
        
        loans[loanCount] = Loan({
            id: loanCount,
            borrower: msg.sender,
            amount: _amount,
            interestAmount: interest,
            totalRepayment: totalRepayment,
            requestTime: block.timestamp,
            approvalTime: 0,
            disbursementTime: 0,
            dueDate: 0,
            repaymentTime: 0,
            approved: false,
            disbursed: false,
            repaid: false,
            purpose: _purpose
        });
        
        userLoans[msg.sender].push(loanCount);
        members[msg.sender].hasActiveLoan = true;
        
        emit LoanRequested(loanCount, msg.sender, _amount, _purpose);
    }
    
    /**
     * @notice Approve and disburse loan in one transaction (admin only)
     * @param _loanId ID of the loan
     */
    function approveLoan(uint256 _loanId) external onlyAdmin {
        Loan storage loan = loans[_loanId];
        require(loan.borrower != address(0), "Loan doesn't exist");
        require(!loan.approved, "Already approved");
        require(!loan.disbursed, "Already disbursed");
        require(address(this).balance >= loan.amount, "Insufficient contract balance");
        
        // Approve loan
        loan.approved = true;
        loan.approvalTime = block.timestamp;
        
        // Immediately disburse
        loan.disbursed = true;
        loan.disbursementTime = block.timestamp;
        
        // Set due date
        uint256 duration = isDemoMode ? demoLoanDuration : LOAN_DURATION;
        loan.dueDate = block.timestamp + duration;
        
        members[loan.borrower].totalBorrowed += loan.amount;
        
        // Transfer funds to borrower
        payable(loan.borrower).transfer(loan.amount);
        
        emit LoanApproved(_loanId, loan.borrower);
        emit LoanDisbursed(_loanId, loan.borrower, loan.amount);
    }
    
    /**
     * @notice Disburse approved loan (admin only)
     * @param _loanId ID of the loan
     */
    function disburseLoan(uint256 _loanId) external payable onlyAdmin {
        Loan storage loan = loans[_loanId];
        require(loan.approved, "Not approved");
        require(!loan.disbursed, "Already disbursed");
        require(msg.value == loan.amount, "Incorrect amount");
        
        loan.disbursed = true;
        loan.disbursementTime = block.timestamp;
        
        // Set due date
        uint256 duration = isDemoMode ? demoLoanDuration : LOAN_DURATION;
        loan.dueDate = block.timestamp + duration;
        
        members[loan.borrower].totalBorrowed += loan.amount;
        
        // Transfer funds to borrower
        payable(loan.borrower).transfer(loan.amount);
        
        emit LoanDisbursed(_loanId, loan.borrower, loan.amount);
    }
    
    /**
     * @notice Repay a loan
     * @param _loanId ID of the loan
     */
    function repayLoan(uint256 _loanId) external payable {
        Loan storage loan = loans[_loanId];
        require(loan.borrower == msg.sender, "Not your loan");
        require(loan.disbursed, "Not disbursed yet");
        require(!loan.repaid, "Already repaid");
        require(msg.value == loan.totalRepayment, "Incorrect amount");
        
        loan.repaid = true;
        loan.repaymentTime = block.timestamp;
        
        members[msg.sender].totalRepaid += loan.totalRepayment;
        members[msg.sender].loansCompleted++;
        members[msg.sender].hasActiveLoan = false;
        
        // Calculate credit bonus
        uint256 creditBonus = _calculateCreditBonus(loan.dueDate, block.timestamp);
        
        // Update scores
        _updateScoresOnRepayment(msg.sender, creditBonus);
        
        emit LoanRepaid(_loanId, msg.sender, creditBonus);
    }
    
    /**
     * @notice Calculate credit bonus based on repayment timing
     */
    function _calculateCreditBonus(uint256 _dueDate, uint256 _repaymentTime) 
        internal 
        pure 
        returns (uint256) 
    {
        if (_repaymentTime < _dueDate) {
            // Early repayment
            return EARLY_BONUS;
        } else if (_repaymentTime <= _dueDate + 3 days) {
            // On time or slightly late
            return ON_TIME_BONUS;
        } else if (_repaymentTime <= _dueDate + 7 days) {
            // Late but recoverable
            return LATE_PENALTY; // Actually reduces score
        } else {
            // Very late
            return 0; // No bonus
        }
    }
    
    /**
     * @notice Update scores after successful repayment
     */
    function _updateScoresOnRepayment(address _borrower, uint256 _creditBonus) internal {
        MemberData storage member = members[_borrower];
        
        // Update individual score
        if (_creditBonus > 0) {
            if (member.individualScore + _creditBonus > MAX_SCORE) {
                member.individualScore = MAX_SCORE;
            } else {
                member.individualScore += _creditBonus;
            }
            
            emit ScoreUpdated(_borrower, member.individualScore, "Loan repaid");
        }
        
        // Update circle average (will be recalculated on next call)
        if (member.circleId > 0) {
            uint256 newAverage = getCircleAverageScore(member.circleId);
            emit CircleScoreUpdated(member.circleId, newAverage);
        }
    }
    
    /**
     * @notice Penalize user for loan default (admin only)
     * @param _loanId ID of the defaulted loan
     */
    function penalizeDefault(uint256 _loanId) external onlyAdmin {
        Loan storage loan = loans[_loanId];
        require(loan.disbursed, "Not disbursed");
        require(!loan.repaid, "Already repaid");
        require(block.timestamp > loan.dueDate + 14 days, "Not overdue enough");
        
        address borrower = loan.borrower;
        MemberData storage member = members[borrower];
        
        // Slash individual score
        if (member.individualScore >= DEFAULT_PENALTY) {
            member.individualScore -= DEFAULT_PENALTY;
        } else {
            member.individualScore = 0;
        }
        
        // Freeze account
        member.isActive = false;
        
        emit ScoreUpdated(borrower, member.individualScore, "Default penalty");
        emit AccountFrozen(borrower, "Loan default");
        
        // Penalize entire circle
        if (member.circleId > 0) {
            _penalizeCircle(member.circleId, borrower);
        }
    }
    
    /**
     * @notice Penalize entire circle for member default
     */
    function _penalizeCircle(uint256 _circleId, address _defaulter) internal {
        Circle storage circle = circles[_circleId];
        
        for (uint i = 0; i < circle.members.length; i++) {
            address memberAddr = circle.members[i];
            if (memberAddr != _defaulter) {
                MemberData storage member = members[memberAddr];
                
                // Reduce score for all circle members
                if (member.individualScore >= CIRCLE_DEFAULT_PENALTY) {
                    member.individualScore -= CIRCLE_DEFAULT_PENALTY;
                } else {
                    member.individualScore = 0;
                }
                
                emit ScoreUpdated(memberAddr, member.individualScore, "Circle member defaulted");
            }
        }
        
        uint256 newAverage = getCircleAverageScore(_circleId);
        emit CircleScoreUpdated(_circleId, newAverage);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @notice Get user's complete stats
     */
    function getUserStats(address _user) external view returns (
        uint256 circleId,
        uint256 individualScore,
        uint256 finalTrustScore,
        uint256 maxLoanAmount,
        uint256 interestRate,
        uint256 totalBorrowed,
        uint256 totalRepaid,
        uint256 loansCompleted,
        bool hasActiveLoan,
        bool isActive
    ) {
        MemberData storage member = members[_user];
        uint256 indScore = member.individualScore > 0 ? member.individualScore : STARTING_SCORE;
        uint256 trustScore = getTrustScore(_user);
        
        uint256 maxLoan;
        if (trustScore < 60) maxLoan = 10 ether;
        else if (trustScore < 70) maxLoan = 20 ether;
        else if (trustScore < 80) maxLoan = 50 ether;
        else if (trustScore < 90) maxLoan = 100 ether;
        else maxLoan = 200 ether;
        
        uint256 rate;
        if (trustScore < 60) rate = 6;
        else if (trustScore < 70) rate = 4;
        else if (trustScore < 80) rate = 4;
        else if (trustScore < 90) rate = 2;
        else rate = 2;
        
        return (
            member.circleId,
            indScore,
            trustScore,
            maxLoan,
            rate,
            member.totalBorrowed,
            member.totalRepaid,
            member.loansCompleted,
            member.hasActiveLoan,
            member.isActive
        );
    }
    
    /**
     * @notice Get circle details
     */
    function getCircleDetails(uint256 _circleId) external view returns (
        string memory name,
        address[] memory memberList,
        uint256 memberCount,
        uint256 averageScore,
        uint256 totalStake,
        bool isActive
    ) {
        Circle memory circle = circles[_circleId];
        return (
            circle.name,
            circle.members,
            circle.members.length,
            getCircleAverageScore(_circleId),
            circle.totalStake,
            circle.isActive
        );
    }
    
    /**
     * @notice Get loan details
     */
    function getLoanDetails(uint256 _loanId) external view returns (
        address borrower,
        uint256 amount,
        uint256 totalRepayment,
        uint256 dueDate,
        bool approved,
        bool disbursed,
        bool repaid,
        string memory purpose
    ) {
        Loan memory loan = loans[_loanId];
        return (
            loan.borrower,
            loan.amount,
            loan.totalRepayment,
            loan.dueDate,
            loan.approved,
            loan.disbursed,
            loan.repaid,
            loan.purpose
        );
    }
    
    /**
     * @notice Get user's loan IDs
     */
    function getUserLoans(address _user) external view returns (uint256[] memory) {
        return userLoans[_user];
    }
    
    /**
     * @notice Check if loan is overdue
     */
    function isLoanOverdue(uint256 _loanId) external view returns (bool) {
        Loan memory loan = loans[_loanId];
        return loan.disbursed && !loan.repaid && block.timestamp > loan.dueDate;
    }
    
    /**
     * @notice Get circle members' scores
     */
    function getCircleMembersScores(uint256 _circleId) 
        external 
        view 
        returns (
            address[] memory addresses,
            uint256[] memory scores,
            uint256 averageScore
        ) 
    {
        Circle memory circle = circles[_circleId];
        uint256 memberCount = circle.members.length;
        
        addresses = new address[](memberCount);
        scores = new uint256[](memberCount);
        uint256 totalScore = 0;
        
        for (uint i = 0; i < memberCount; i++) {
            addresses[i] = circle.members[i];
            scores[i] = members[circle.members[i]].individualScore;
            totalScore += scores[i];
        }
        
        averageScore = memberCount > 0 ? totalScore / memberCount : 0;
        
        return (addresses, scores, averageScore);
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @notice Toggle demo mode (for hackathon)
     */
    function setDemoMode(bool _enabled) external onlyAdmin {
        isDemoMode = _enabled;
        emit DemoModeToggled(_enabled);
    }
    
    /**
     * @notice Set demo loan duration
     */
    function setDemoLoanDuration(uint256 _duration) external onlyAdmin {
        demoLoanDuration = _duration;
    }
    
    /**
     * @notice Deposit liquidity for lending
     */
    function depositLiquidity() external payable onlyAdmin {
        require(msg.value > 0, "Must deposit some amount");
        emit LiquidityDeposited(msg.sender, msg.value, address(this).balance);
    }
    
    /**
     * @notice Withdraw funds
     */
    function withdraw(uint256 _amount) external onlyAdmin {
        require(_amount > 0, "Amount must be greater than 0");
        require(address(this).balance >= _amount, "Insufficient balance");
        payable(admin).transfer(_amount);
        emit FundsWithdrawn(admin, _amount, address(this).balance);
    }
    
    /**
     * @notice Get contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @notice Unfreeze account (admin only, after penalty repayment)
     */
    function unfreezeAccount(address _user) external onlyAdmin {
        members[_user].isActive = true;
    }
    
    /**
     * @notice Emergency: Transfer admin rights
     */
    function transferAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "Invalid address");
        admin = _newAdmin;
    }
    
    // ============ FALLBACK ============
    
    receive() external payable {}
}
// TrustCircles contract
