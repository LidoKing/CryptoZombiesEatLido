// SPDX-License-Identifier: ISC

pragma solidity >=0.8.0 <0.9.0;

import "./zombiehelper.sol";
import "hardhat/console.sol";

contract ZombieAttack is ZombieHelper {
  uint randNonce = 0;
  uint attackVictoryProbability = 70;

  event Attack(uint attacker, uint defender, uint winningSide);

  function randMod(uint _modulus) internal returns(uint) {
    randNonce++;
    return uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, randNonce))) % _modulus;
  }

  function attack(uint _zombieId, uint _targetId) external onlyOwnerOf(_zombieId) {
    Zombie storage myZombie = zombies[_zombieId];
    Zombie storage enemyZombie = zombies[_targetId];
    uint rand = randMod(100);
    if (rand <= attackVictoryProbability) {
      myZombie.winCount++;
      myZombie.level++;
      enemyZombie.lossCount++;
      emit Attack(_zombieId, _targetId, _zombieId);
      feedAndMultiply(_zombieId, enemyZombie.dna, "zombie");
    } else {
      myZombie.lossCount++;
      enemyZombie.winCount++;
      enemyZombie.level++;
      emit Attack(_zombieId, _targetId, _targetId);
      _triggerCooldown(myZombie);
    }
    console.log("Attack finished");
  }
}
