require("@nomicfoundation/hardhat-toolbox");

const { vars } = require("hardhat/config");

const ETHERSCAN_API_KEY = vars.get("ETHERSCAN_API_KEY");
const POLYGONSCAN_API_KEY = vars.get("POLYGONSCAN_API_KEY");
const BASESCAN_API_KEY = vars.get("BASESCAN_API_KEY");
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
    apiKey: {
      mainnet: ETHERSCAN_API_KEY,
      sepolia: ETHERSCAN_API_KEY,
      polygon: POLYGONSCAN_API_KEY,
      base: BASESCAN_API_KEY
    }
  },
  networks: {
    mainnet: {
      url: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [SEPOLIA_PRIVATE_KEY]
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [SEPOLIA_PRIVATE_KEY]
    },
    polygon: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [SEPOLIA_PRIVATE_KEY]
    },
    base: {
      url: `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [SEPOLIA_PRIVATE_KEY],
      gasPrice: 1000000000
    }
  }
};
