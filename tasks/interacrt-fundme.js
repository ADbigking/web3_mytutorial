const { task } = require("hardhat/config");
task("interact")
  .addParam("addr", "fundme contract address")
  .setAction(async (taskArgs, hre) => {
    const { ethers } = hre;
    const fundMeFactory = await ethers.getContractFactory("FundMe");
    const fundme = fundMeFactory.attach(taskArgs.addr);
    const [firstAccount, secondAccount] = await ethers.getSigners();
    //fund one
    const fundTx = await fundme.fund({ value: ethers.parseEther("0.5") });
    await fundTx.wait();
    const balanceofcontract = await ethers.provider.getBalance(fundme.target);
    console.log(balanceofcontract);
    //fund two
    const fundtxwithsecondacconut = await fundme.connect(secondAccount).fund({
      value: ethers.parseEther("0.5"),
    });
    await fundtxwithsecondacconut.wait();
    const balanceofcontractsecond = await ethers.provider.getBalance(
      fundme.target,
    );
    console.log(balanceofcontractsecond);
    //mapping
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
  });
module.exports = {};
