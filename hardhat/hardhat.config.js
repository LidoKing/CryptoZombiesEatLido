require('dotenv').config();

require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-truffle5");
require('hardhat-spdx-license-identifier');
// npx hardhat check
require("@nomiclabs/hardhat-solhint");
// npx hardhat test --logs
require("hardhat-tracer");
// hre.timeAndMine
require("@atixlabs/hardhat-time-n-mine");
// npx hardhat export-abi
require('hardhat-abi-exporter');

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
 module.exports = {
   defaultNetwork: "hardhat",

   networks: {
     hardhat: {
     },

     rinkeby: {
       url: "https://eth-rinkeby.alchemyapi.io/v2/123abc123abc123abc123abc123abcde",
       accounts: []
     },

     ropsten: {
       url: `https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`,
       accounts: [`${process.env.ROPSTEN_PRIVATE_KEY}`]
     }
   },

   solidity: {
     version: "0.8.8",
     // settings: {
       // optimizer: {
         // enabled: true,
         // runs: 200
       // }
     // }
   },

   paths: {
     sources: "./contracts",
     tests: "./test",
     cache: "./cache",
     artifacts: "./artifacts"
   },

   mocha: {
     // timeout: 40000
   },

  spdxLicenseIdentifier: {
    overwrite: true,
    runOnCompile: true,
  },

  abiExporter: {
    path: './abi',
    runOnCompile: true,
    clear: true,
    // flat: false,
    // only: [':ERC20$'],
    spacing: 2,
    pretty: true,
  }
 };
