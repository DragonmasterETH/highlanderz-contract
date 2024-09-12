// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "hardhat/console.sol";

contract HighlanderzGame is Ownable, ReentrancyGuard {
    uint256 public pricePerHero;
    uint256 public heroesPerGame;
    uint256 public totalQueuedHeroes;
    uint256 public currentGameNumber;
    address public lastWinner;
    bool public isGamePaused = false;
    mapping(address => bool) public isAdmin;
    address public serverAddress;
    uint256 public rewardPercentage = 1025; // E.g. 1025 is 10.25%
    uint256 private queueStart = 0;
    uint256 private queueEnd = 0;
    mapping(uint256 => address) private heroQueue;
    mapping(uint256 => uint256) private gameReward;

    event HeroSelected(address indexed player, uint256 heroCount);
    event GameStarted(uint256 gameNumber);
    event WinnerDeclared(address indexed winnerAddress);
    event PayoutCompleted(address indexed winnerAddress, uint256 amount);
    event AdminActionTaken(string action, bytes details);

    modifier whenNotPaused() {
        require(!isGamePaused, "Game is currently paused");
        _;
    }

    modifier onlyServer() {
        require(msg.sender == serverAddress, "Only server can call this");
        _;
    }

    constructor(
        uint256 _pricePerHero,
        uint256 _heroesPerGame,
        address _serverAddress
    ) {
        pricePerHero = _pricePerHero;
        heroesPerGame = _heroesPerGame;
        serverAddress = _serverAddress;
    }

    function setServerAddress(address _serverAddress) external onlyOwner {
        serverAddress = _serverAddress;
    }

    function selectAndPayForHeroes(uint256[] memory heroIDs) external payable whenNotPaused {
        require(heroIDs.length > 0, "Must select at least one hero");
        require(heroIDs.length <= heroesPerGame, "Too many heroes selected");
        require(msg.value == pricePerHero * heroIDs.length, "Incorrect payment amount");

        for (uint i = 0; i < heroIDs.length; i++) {
            heroQueue[queueEnd] = msg.sender;
            queueEnd++;
            totalQueuedHeroes++;
        }

        if (totalQueuedHeroes >= heroesPerGame) {
            gameReward[currentGameNumber] = totalQueuedHeroes * pricePerHero;
            startGame();
        }

        emit HeroSelected(msg.sender, heroIDs.length);
    }

    function getCurrentGameState() external view returns (uint256, uint256, bool) {
        return (currentGameNumber, totalQueuedHeroes, isGamePaused);
    }

    function getQueuedHeroAt(uint256 index) external view returns (address) {
        require(index >= queueStart && index < queueEnd, "Index out of bounds");
        return heroQueue[index];
    }

    function startGame() internal {
        currentGameNumber += 1;
        queueStart = queueEnd; // Resetting the queue start for the next game
        totalQueuedHeroes = 0;
        emit GameStarted(currentGameNumber);
    }

    function verifyWinner(address winner, uint256 gameNumber, bytes memory signature) internal view returns (bool) {
        bytes32 messageHash = keccak256(abi.encodePacked(winner, gameNumber, address(this)));
        bytes32 ethSignedMessageHash = ECDSA.toEthSignedMessageHash(messageHash);
        address recoveredAddress = ECDSA.recover(ethSignedMessageHash, signature);
        return recoveredAddress == serverAddress;
    }

    function setWinner(address winnerAddress, uint256 gameNumber, bytes memory signature) external {
        require(gameNumber < currentGameNumber, "Incorrect game number");
        require(verifyWinner(winnerAddress, gameNumber, signature), "Invalid signature");

        lastWinner = winnerAddress;
        emit WinnerDeclared(winnerAddress);
        payoutWinner(gameNumber, winnerAddress);
    }

    // Now using the nonReentrant modifier
    function payoutWinner(uint256 gameNumber, address winnerAddress) internal nonReentrant {
        uint256 rewardAmount = gameReward[gameNumber];
        uint256 contractBalance = address(this).balance;

        uint256 reward = rewardAmount * rewardPercentage / 10000;
        require(reward <= contractBalance, "Insufficient funds for payout");
        payable(winnerAddress).transfer(reward);
        emit PayoutCompleted(winnerAddress, reward);
    }

    function setRewardPercentage(uint256 _newPercentage) external onlyOwner {
        require(_newPercentage <= 10000, "Percentage cannot exceed 100%");
        rewardPercentage = _newPercentage;
    }

    function adjustPricePerHero(uint256 newPrice) external onlyOwner {
        pricePerHero = newPrice;
        emit AdminActionTaken("PricePerHeroAdjusted", abi.encode(newPrice));
    }

    function toggleGameState() external onlyOwner {
        isGamePaused = !isGamePaused;
        emit AdminActionTaken("GameStateToggled", abi.encode(isGamePaused));
    }

    function transferOwnership(address newOwner) public override onlyOwner {
        super.transferOwnership(newOwner);
        emit AdminActionTaken("OwnershipTransferred", abi.encode(newOwner));
    }

    function modifyAdmin(address admin, bool isAuthorized) external onlyOwner {
        isAdmin[admin] = isAuthorized;
        emit AdminActionTaken("AdminModified", abi.encode(admin, isAuthorized));
    }

    function topUpServerWallet() external payable onlyOwner nonReentrant {
        payable(serverAddress).transfer(msg.value);
    }
}
