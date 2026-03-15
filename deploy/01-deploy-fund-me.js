const { network } = require("hardhat");
const {
  developmentsChains,
  networkconfig,
  LOCK_TIME,
  CONFIRMATIONS,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { firstAccount } = await getNamedAccounts();
  const { deploy } = await deployments;
  let datafeedaddr;
  let comfirmations;
  if (developmentsChains.includes(network.name)) {
    MockV3Aggregator = await deployments.get("MockV3Aggregator");
    datafeedaddr = MockV3Aggregator.address;
    comfirmations = 0;
  } else {
    datafeedaddr = networkconfig[network.config.chainId].ethUsdDataFeed;
    comfirmations = CONFIRMATIONS;
  }
  const fundme = await deploy("FundMe", {
    from: firstAccount,
    args: [LOCK_TIME, datafeedaddr],
    log: true,
    waitConfirmations: comfirmations,
  });
  if (hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY) {
    await hre.run("verify:verify", {
      address: fundme.address,
      constructorArguments: [LOCK_TIME, datafeedaddr],
    });
  } else {
    console.log("not sepolia so skiping..");
  }
};
module.exports.tags = ["all", "FundMe"];
