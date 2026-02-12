const { ethers } = require("hardhat");
const hre = require("hardhat");
async function main() {
  try {
    const fundMeFactory = await ethers.getContractFactory("FundMe");
    const fundme = await fundMeFactory.deploy(10);
    await fundme.waitForDeployment();
    console.log(`contract address is ${fundme.target}`);
    if (
      hre.network.config.chainId == 11155111 &&
      process.env.ETHERSCAN_API_KEY
    ) {
      const deploymentTx = fundme.deploymentTransaction();
      await deploymentTx.wait(5); // 等 5 个确认
      await hre.run("verify:verify", {
        address: fundme.target,
        constructorArguments: [10],
      });
    } else {
      console.log("veriry is skipped");
    }
    const [firstAccount, secondAccount] = await ethers.getSigners();
    const fundTx = await fundme.fund({ value: ethers.parseEther("0.5") });
    await fundTx.wait();
    const balanceofcontract = await ethers.provider.getBalance(fundme.target);
    console.log(balanceofcontract);
    const fundtxwithsecondacconut = await fundme.connect(secondAccount).fund({
      value: ethers.parseEther("0.5"),
    });
    console.log(balanceofcontract);
    await fundtxwithsecondacconut.wait();
    const firstAccountbalanceinfundme = await fundme.FundersToAmount(
      firstAccount.address,
    );
    const secondAccountbalanceinfundme = await fundme.FundersToAmount(
      secondAccount.address,
    );
    console.log(
      `address is ${firstAccount.address} balance is ${firstAccountbalanceinfundme}`,
    );
    console.log(
      `address is ${secondAccount.address} balance is ${secondAccountbalanceinfundme}`,
    );
  } catch (error) {
    console.error(error);
  }
}
main();
