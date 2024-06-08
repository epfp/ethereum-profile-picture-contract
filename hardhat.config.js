require("@nomicfoundation/hardhat-toolbox");

const { vars } = require("hardhat/config");

const ETHERSCAN_API_KEY = vars.get("ETHERSCAN_API_KEY");
const COINMARKETCAP_API_KEY = vars.get("COINMARKETCAP_API_KEY");
const ALCHEMY_API_KEY = vars.get("ALCHEMY_API_KEY");
const SEPOLIA_PRIVATE_KEY = vars.get("SEPOLIA_PRIVATE_KEY");

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
    coinmarketcap: COINMARKETCAP_API_KEY,
    L1: "ethereum",
    excludeContracts: [
        "ERC721Mock",
        "ERC1155Mock"
    ],
    reportPureAndViewMethods: true
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  },
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [SEPOLIA_PRIVATE_KEY]
    }
  }
};
