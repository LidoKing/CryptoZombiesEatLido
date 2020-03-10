const CryptoZombies = artifacts.require("ZombieFactory");

module.exports = function(deployer) {
  deployer.deploy(CryptoZombies);
};
