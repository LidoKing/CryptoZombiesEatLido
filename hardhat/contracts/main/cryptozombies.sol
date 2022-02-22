// SPDX-License-Identifier: ISC

pragma solidity >=0.8.0 <0.9.0;

import "./zombieownership.sol";

contract CryptoZombies is ZombieOwnership {
  function readyAttack(uint _id) external onlyOwner {
    Zombie storage theZombie = zombies[_id];
    theZombie.readyTime = uint32(block.timestamp);
  }

  function kill() external onlyOwner {
    address payable owner = payable(owner());
    selfdestruct(owner);
  }
}
