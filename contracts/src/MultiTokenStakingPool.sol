// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract MultiStakingPool is Ownable, ReentrancyGuard {

    IERC20 public immutable rewardToken;

    // Staking token Address => User Address => Staked Amount
    mapping(address => mapping(address => uint256)) public stakedAmounts;
    // Staking Token Address =>  User Address => Last timestamp when Staked
    mapping(address => mapping(address => uint256)) public lastUpdateTimes;
    // Staking Token Address => User Address => Total REward claimed
    mapping(address => mapping(address => uint256)) public totalClaimedRewards;



    // Staking TOken Address =>Reward Rate per second 
    mapping(address => uint256) public tokenRewardRate;
    // Staking Token Address => Is token Supported  => Whitelisted token allowed only
    mapping(address => bool) public supportedTokens;

    uint256 public constant REWARD_PRECISION = 1e18;


    /// ----------------- EVENTS ----------------------

    event TokenAdded(address indexed stakingToken);
    event TokenRemoved(address indexed stakingToken);
    event TokenRewardRateUpdated(address indexed stakingToken, uint256 newRate);
    event TokenStaked(address indexed user, address indexed stakingToken, uint256 amount);
    event TokenUnstaked(address indexed user, address indexed stakingToken, uint256 amount);
    event TokenRewardsClaimed(address indexed user, address indexed stakingToken, uint256 amount);



    constructor (address _rewardToken) Ownable(msg.sender) {
        rewardToken = IERC20(_rewardToken);
    }


    ///  ---------------  OWNER FUNCTIONS -----------------------
    function addSupportedToken(address _stakingToken) public onlyOwner {
        require(!supportedTokens[_stakingToken], "Token is already whitelisted");
        supportedTokens[_stakingToken] = true;
        emit TokenAdded(_stakingToken);
    }

    function removeSupportedToken(address _stakingToken) public onlyOwner {
        require(supportedTokens[_stakingToken], "Token is already blacklisted");
        supportedTokens[_stakingToken] = false;
        delete tokenRewardRate[_stakingToken];
        emit TokenRemoved(_stakingToken);
    }

    function setTokenRewardRate(address _stakingToken, uint256 _rate) public onlyOwner {
        require(supportedTokens[_stakingToken], "Cannot update reward rate for blacklisted tokens");
        tokenRewardRate[_stakingToken] = _rate;
        emit TokenRewardRateUpdated(_stakingToken, _rate);
    }



    // =---------------------------- USER FUNCTIONS ----------------------------
    
    function stake(address _stakingToken, uint256 amount) public nonReentrant {
        require(supportedTokens[_stakingToken], "Token is not whitelisted for staking");
        require(amount > 0 , "Staking amount should be more than zero");
        updateReward(msg.sender, _stakingToken);
        IERC20(_stakingToken).transferFrom(msg.sender, address(this), amount);
        stakedAmounts[_stakingToken][msg.sender] += amount;
        lastUpdateTimes[_stakingToken][msg.sender] = block.timestamp;
        emit TokenStaked(msg.sender, _stakingToken, amount);
    }

    function unstake(address _stakingToken, uint256 amount) public nonReentrant {
        require(amount > 0, "Amount should be greate than zero");
        require(stakedAmounts[_stakingToken][msg.sender] >= amount, "Cannot withdraw more than staked tokens");
        claimRewards(_stakingToken);
        stakedAmounts[_stakingToken][msg.sender] -= amount;
        lastUpdateTimes[_stakingToken][msg.sender] = block.timestamp;
        IERC20(_stakingToken).transfer(msg.sender,amount);
        emit TokenUnstaked(msg.sender, _stakingToken, amount);

    }



    function claimRewards(address _stakingToken) public nonReentrant {
        uint256 rewards = getPendingRewards(msg.sender, _stakingToken);
        require(rewards >0, "No Rewards to claim");
        updateReward(msg.sender,_stakingToken);
        rewards = getPendingRewards(msg.sender, _stakingToken);
        require(rewards > 0, "NO Rewards to Claim");
        require(rewardToken.balanceOf(address(this)) >= rewards, "NO Reward token balance to distribute rewards");
        totalClaimedRewards[_stakingToken][msg.sender] += rewards;
        rewardToken.transfer(msg.sender, rewards);
        emit TokenRewardsClaimed(msg.sender, _stakingToken, rewards);
    }

    //  ------------------------------- VIEW & INTERNAL FUNCTIONS ---------------------
    function getPendingRewards(address _user, address _stakingToken) public view returns (uint256) {
        uint256 currentStaked = stakedAmounts[_stakingToken][_user];
        uint256 rewardRate = tokenRewardRate[_stakingToken];


        if (currentStaked == 0 || rewardRate == 0)  {
            return 0;
        }
        uint256 timeElapsed = block.timestamp - lastUpdateTimes[_stakingToken][_user];

        return (currentStaked * rewardRate * timeElapsed) / REWARD_PRECISION;
    }


    function updateReward(address _user, address _stakingToken) internal {
        if(stakedAmounts[_stakingToken][_user] > 0) {
            lastUpdateTimes[_stakingToken][_user] = block.timestamp;
        }
    }
}