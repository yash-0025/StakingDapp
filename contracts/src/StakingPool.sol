// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;



import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract StakingPool is Ownable,ReentrancyGuard {


    // Staker Token Contract address
    IERC20 public immutable stakingToken;
    // Reward Token Contract address
    IERC20 public immutable rewardToken;

    // Amount staked by user address 
    mapping(address => uint256 ) public stakedAmounts;
    // Time when the last Rewards were updated
    mapping(address => uint256) lastUpdateTime;
    // Total rewards claimed by user address
    mapping(address => uint256) public totalClaimRewards;


    uint256 public rewardRatePerSecond; 
    // To get fixed point arithmetic numbers [No decimals numbers]
    uint256 public constant REWARD_PREICISION = 1e18;

    event Staked(address indexed user, uint256 amount);
    event UnStaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount);
    event RewardRateUpdated(uint256 newRate);


    constructor(address _stakingToken, address _rewaredToken) Ownable(msg.sender) {
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewaredToken);
    }

    // ------------  OWNER CONTROLLER FUNCTIONS -------------------
    function setRewardRate(uint256 _newRate) public onlyOwner {
        rewardRatePerSecond = _newRate;
        emit RewardRateUpdated(_newRate);
    }


    // --------------- USER FUNCTIONS -------------------------
    function stake(uint256 amount) public nonReentrant {
        require(amount>0,"Amount should be greater than 0");
        stakingToken.transferFrom(msg.sender, address(this), amount);
        stakedAmounts[msg.sender] += amount;
        lastUpdateTime[msg.sender] = block.timestamp;
        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) public nonReentrant {
        require(amount > 0, "Amount should be greater than 0");
        require(stakedAmounts[msg.sender] >= amount, "Cannot withdraw more thant the staked amount");

        stakedAmounts[msg.sender] -= amount;
        lastUpdateTime[msg.sender] = block.timestamp;
        stakingToken.transfer(msg.sender, amount);
        emit UnStaked(msg.sender, amount);
    }


    function claimRewards() public nonReentrant {
        uint256 rewards = getPendingRewards(msg.sender);
        require(rewards > 0, "No Rewards to claim");

        updateReward(msg.sender);
        rewards = getPendingRewards(msg.sender);
        require(rewards > 0, "No Rewards to claim");

        require(rewardToken.balanceOf(address(this)) >= rewards, "Pool Reward token balance is not enough to distribute rewards");

        totalClaimRewards[msg.sender] += rewards;
        rewardToken.transfer(msg.sender, rewards);
        emit RewardClaimed(msg.sender, rewards);
    }



    // -------------------  VIEW FUNCTIONS ---------------------

    function getPendingRewards(address _user) public view returns(uint256) {
        uint256 currentStaked = stakedAmounts[_user];
        if (currentStaked == 0 || rewardRatePerSecond == 0) {
            return 0;
        }
        uint256 timeElapsed = block.timestamp - lastUpdateTime[_user];
        return (currentStaked * rewardRatePerSecond * timeElapsed)/ REWARD_PREICISION;

    }

    // ------------------   INTERNAL FUNCTIONS ------------------
    function updateReward(address _user) internal {
        if (stakedAmounts[_user] > 0) {
            lastUpdateTime[_user] = block.timestamp;
        }
    }
}