const CryptoZombies = artifacts.require("CryptoZombies");
const utils = require("./helpers/utils");
const time = require("./helpers/time");
const web3utils = require('web3-utils');
const web3eth = require('web3-eth');
var expect = require('chai').expect;
const zombieNames = ["Zombie 1", "Zombie 2"];

async function createZombie() {
  const result = await instance.createRandomZombie(zombieNames[0], {from: alice});
  return result.logs[0].args.zombieId.toNumber();
}

contract("CryptoZombies", (accounts) => {
    let [alice, bob] = accounts;
    let instance;

    beforeEach(async () => {
      instance = await CryptoZombies.new();
    });

    context("ZOMBIE CREATION", async () => {
      it("should be able to create a new zombie", async () => {
          const result = await instance.createRandomZombie(zombieNames[0], {from: alice});
          expect(result.receipt.status).to.equal(true);
          expect(result.logs[0].args.name).to.equal(zombieNames[0]);
      });

      it("should not allow two zombies", async () => {
          await instance.createRandomZombie(zombieNames[0], {from: alice});
          await utils.shouldThrow(instance.createRandomZombie(zombieNames[1], {from: alice}));
      });
    });

    context("ATTACK AND FEEDING", async () => {
      it("zombies should be able to attack another zombie", async () => {
          let result;
          // create zombie
          result = await instance.createRandomZombie(zombieNames[0], {from: alice});
          const firstZombieId = result.logs[0].args.zombieId.toNumber();
          // create another zombie
          result = await instance.createRandomZombie(zombieNames[1], {from: bob});
          const secondZombieId = result.logs[0].args.zombieId.toNumber();
          // fast forward time to bypass cooldown
          await time.increase(time.duration.days(1));
          // initiatae attack
          await instance.attack(firstZombieId, secondZombieId, {from: alice});
          expect(result.receipt.status).to.equal(true);
      });

      // Can't test, no cryptokitties contract on testing network
      xit("should feed on a kitty", async () => {
        // create a zombie
        const result = await instance.createRandomZombie(zombieNames[0], {from: alice});
        const zombieId = result.logs[0].args.zombieId.toNumber();
        // fast forward time to bypass cooldown
        await time.increase(time.duration.days(1));
        // feed on kitty
        await instance.feedOnKitty(zombieId, 1);
        // get number of owned zombies
        const owned = await instance.balanceOf(alice);
        expect(owned.toNumber()).to.equal(2);
      });
    });

    context("ZOMBIE TRANSFER", async () => {
      context("with the single-step transfer scenario", async () => {
          it("should transfer a zombie", async () => {
              // create a zombie
              const result = await instance.createRandomZombie(zombieNames[0], {from: alice});
              const zombieId = result.logs[0].args.zombieId.toNumber();
              // owner calls transfer
              await instance.transferFrom(alice, bob, zombieId, {from: alice});
              // get owner of zombie
              const newOwner = await instance.ownerOf(zombieId);
              expect(newOwner).to.equal(bob);
          });
      });

      context("with the two-step transfer scenario", async () => {
        it("should approve and then transfer a zombie when the approved address calls transferForm", async () => {
            // create a zombie
            const result = await instance.createRandomZombie(zombieNames[0], {from: alice});
            const zombieId = result.logs[0].args.zombieId.toNumber();
            // approve recepient
            await instance.approve(bob, zombieId, {from: alice});
            // recepient calls transfer
            await instance.transferFrom(alice, bob, zombieId, {from: bob});
            // get owner of zombie
            const newOwner = await instance.ownerOf(zombieId);
            expect(newOwner).to.equal(bob);
        });

        it("should approve and then transfer a zombie when the owner calls transferForm", async () => {
            // create a zombie
            const result = await instance.createRandomZombie(zombieNames[0], {from: alice});
            const zombieId = result.logs[0].args.zombieId.toNumber();
            // approve recepient
            await instance.approve(bob, zombieId, {from: alice});
            // owner calls transfer
            await instance.transferFrom(alice, bob, zombieId, {from: alice});
            // get owner of zombie
            const newOwner = await instance.ownerOf(zombieId);
            expect(newOwner).to.equal(bob);
        });
      });
    });

    context("ZOMBIE UTILS", async () => {
      it("should level up zombie after payment", async () => {
        // create a zombie
        const result = await instance.createRandomZombie(zombieNames[0], {from: alice});
        const zombieId = result.logs[0].args.zombieId.toNumber();
        // level up zombie
        await instance.levelUp(zombieId, {from: alice, value: web3utils.toWei("0.001", "ether")});
        // get zombie level
        const zombie = await instance.zombies(zombieId);
        const level = zombie.level.toNumber();
        expect(level).to.equal(2);
      });

      it("should change name of zombie", async () => {
        // create a zombie
        const result = await instance.createRandomZombie(zombieNames[0], {from: alice});
        const zombieId = result.logs[0].args.zombieId.toNumber();
        // level up zombie to level 2
        await instance.levelUp(zombieId, {from: alice, value: web3utils.toWei("0.001", "ether")});
        // change zombie name
        await instance.changeName(zombieId, "new name", {from: alice});
        // get new zombie name
        const zombie = await instance.zombies(zombieId);
        const newName = zombie.name;
        expect(newName).to.equal("new name");
      });
    });

    context("OWNER FUNCTIONS", async () => {
      it("should transfer ownership", async () => {
        await instance.transferOwnership(bob, {from: alice});
        const newOwner = await instance.owner();
        expect(newOwner).to.equal(bob);
      });

      it("should withdraw money from contract", async () => {
        // create a zombie
        const result = await instance.createRandomZombie(zombieNames[0], {from: bob});
        const zombieId = result.logs[0].args.zombieId.toNumber();
        // level up zombie
        await instance.levelUp(zombieId, {from: alice, value: web3utils.toWei("0.001", "ether")});
        // withdraw contract money
        let money = await instance.contractBalance();
        expect(web3utils.fromWei(money)).to.equal('0.001');
        await instance.withdraw({from: alice});
        let balance = await web3eth.getBalance(instance.address);
        expect(web3utils.fromWei(balance)).to.equal('0');
      });
    });
});
