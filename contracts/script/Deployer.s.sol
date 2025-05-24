// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


import "forge-std/Script.sol";
import "../src/MultiTokenStakingPool.sol";
import "../src/StakerToken.sol";
import "../src/StakingPool.sol";
import "../src/TokenFactory.sol";
import "../src/RewarderToken.sol";


interface IERC20Mintable {
    function mint(address to, uint256 amount) external;
}


contract DeployAllContracts is Script {
    function run() public returns (StakerToken, StakingPool, MultiTokenStakingPool, TokenFactory, RewarderToken) {
        string memory deployerPrivateKeyHX = string.concat("0x", vm.envString("PRIVATE_KEY"));
        uint256 deployerPrivateKey = vm.parseUint(deployerPrivateKeyHX);

        vm.startBroadcast(deployerPrivateKey);

        TokenFactory tokenFactory = new TokenFactory();
        console.log("Token Factory is deployed at :: ",address(tokenFactory));



        StakerToken stakerToken = new StakerToken(100_000_000 * 10**18);
        console.log("Staker Token contract deployed to ::", address(stakerToken));




        RewarderToken rewarderToken = new RewarderToken(100_000_000 * 10 ** 18);
        console.log("Rewarder Token contract is deployed to :: ", address(rewarderToken));



        StakingPool stakingPool = new StakingPool(address(stakerToken), address(rewarderToken));
        console.log("Staking Pool contract is deployed to :: ", address(stakingPool));



        MultiTokenStakingPool multiTokenStakingPool = new MultiTokenStakingPool(address(stakerToken));
        console.log("Multiple token Staking pool is deployed to :: ", address(multiTokenStakingPool));

        uint256 initialPoolRewardSupply = 5_000_000 * 10**18;


        // stakerToken.transfer(address(stakingPool), initialPoolRewardSupply);
        // console.log("Transferred", initialPoolRewardSupply / (10**18), "Staker Token to Staking Pool");

        rewarderToken.transfer(address(stakingPool), initialPoolRewardSupply);
        console.log("Transferred", initialPoolRewardSupply/(10**18), "Rewarder Token to Staking Pool");



        rewarderToken.transfer(address(multiTokenStakingPool),initialPoolRewardSupply);
        console.log("Transferred", initialPoolRewardSupply/(10**18), "REwarder token to Multi Token Staking pool");
        

        stakingPool.setRewardRate(100 * 10**18);
        console.log("Staking pool Reward rate is 100 * 10**18");


        address sepoliaDAI = 0x3e622317f8C93f7328350cF0B56d9eD4C620C5d6;
        address sepoliaUSDC = 0x8267cF9254734C6Eb452a7bb9AAF97B392258b21;

        multiTokenStakingPool.addSupportedToken(sepoliaDAI);
        multiTokenStakingPool.setTokenRewardRate(sepoliaDAI, 50 * 10**18);
        console.log("Added DAI and set rate for Multi STaking Token Pool for DAI token");

        multiTokenStakingPool.addSupportedToken(sepoliaUSDC);
        multiTokenStakingPool.setTokenRewardRate(sepoliaUSDC, 75 * 10**18);
        console.log("ADded USDC and set rate for Multi TOken Staking poll for USDC Token");


        vm.stopBroadcast();


        return (stakerToken, stakingPool, multiTokenStakingPool, tokenFactory, rewarderToken);
    }
}