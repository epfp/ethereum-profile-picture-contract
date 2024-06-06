require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  gasReporter: {
    enabled: true,
    currency: "EUR",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    L1: "ethereum",
    excludeContracts: [
        "ERC721Mock",
        "ERC1155Mock"
    ],
    reportPureAndViewMethods: true
  }
};
