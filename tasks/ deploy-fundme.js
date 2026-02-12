const { task } = require("hardhat/config");
task("deployment").setAction(async (taskArgs, hre) => {
  const { ethers } = hre;
  const fundMeFactory = await ethers.getContractFactory("FundMe");
  const fundme = await fundMeFactory.deploy(300);
  await fundme.waitForDeployment();
  console.log(`contract address is ${fundme.target}`);
  if (hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY) {
    const deploymentTx = fundme.deploymentTransaction();
    await deploymentTx.wait(5); // 等 5 个确认
    verifyFundme(fundme.target, [300]);
  } else {
    console.log("veriry is skipped");
  }
});
async function verifyFundme(fundaddr, args) {
  await hre.run("verify:verify", {
    address: fundaddr,
    constructorArguments: args,
  });
}
module.exports = {};
