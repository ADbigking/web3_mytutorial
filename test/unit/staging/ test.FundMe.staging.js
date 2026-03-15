const { ethers, deployments, getNamedAccounts, network } = require("hardhat");
const { assert, expect } = require("chai");
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const { developmentsChains } = require("../../../helper-hardhat-config");
developmentsChains.includes(network.name)
  ? describe.skip
  : describe("test fundme contract", async function () {
      let fundMe;
      let firstAccount;
      beforeEach(async function () {
        await deployments.fixture(["all"]);
        const FundMeDeployment = await deployments.get("FundMe");
        fundMe = await ethers.getContractAt("FundMe", FundMeDeployment.address);
        firstAccount = (await getNamedAccounts()).firstAccount;
      });
      it("fund and getfund successfully", async function () {
        await fundMe.fund({ value: ethers.parseEther("0.5") });
        await new Promise((resolve) => setTimeout(resolve, 181 * 1000));
        const getFundTx = await fundMe.getFund();
        const getfundreceipt = await getFundTx.wait();
        expect(getfundreceipt)
          .to.be.emit(fundMe, "FundWithdrawByOwner")
          .withArgs(ethers.parseEther("0.5"));
      });
      it("fund and refund successfully", async function () {
        await fundMe.fund({ value: ethers.parseEther("0.1") });
        await new Promise((resolve) => setTimeout(resolve, 181 * 1000));
        const reFundTx = await fundMe.reFund();
        const refundreceipt = await reFundTx.wait();
        expect(refundreceipt)
          .to.be.emit(fundMe, "reFundByfunder")
          .withArgs(firstAccount, ethers.parseEther("0.1"));
      });
    });
