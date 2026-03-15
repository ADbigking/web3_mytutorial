const { network } = require("hardhat");

module.exports = {
  DECIMAL: 8,
  INITIAL_ANSWER: 200000000000,
  developmentsChains: ["hardhat", "local"],
  LOCK_TIME: 180,
  networkconfig: {
    11155111: { ethUsdDataFeed: "0x694aa1769357215de4fac081bf1f309adc325306" },
  },
  CONFIRMATIONS: 5,
};
