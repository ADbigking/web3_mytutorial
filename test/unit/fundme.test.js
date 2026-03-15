const { ethers, deployments, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const { developmentsChains } = require("../../helper-hardhat-config");
!developmentsChains.includes(network.name)
  ? describe.skip
  : describe("test fundme contract", async function () {
      let fundMe;
      let firstAccount;
      let fundmesecondaccount;
      let MockV3Aggregator;
      beforeEach(async function () {
        await deployments.fixture(["all"]);
        const FundMeDeployment = await deployments.get("FundMe");
        MockV3Aggregator = await deployments.get("MockV3Aggregator");
        fundMe = await ethers.getContractAt("FundMe", FundMeDeployment.address);
        firstAccount = (await getNamedAccounts()).firstAccount;
        const [, secondAccount] = await ethers.getSigners();
        fundmesecondaccount = fundMe.connect(secondAccount);
      });
      it("test if the owner is msg.sender", async function () {
        await fundMe.waitForDeployment();
        assert.equal(await fundMe.owner(), firstAccount);
      });
      it("test if the datafeed is ", async function () {
        await fundMe.waitForDeployment();
        assert.equal(await fundMe.dataFeed(), MockV3Aggregator.address);
      });
      it("windows closed,value grater than minimum value ,fund failed", async function () {
        await helpers.time.increase(200);
        await helpers.mine();
        await expect(
          fundMe.fund({ value: ethers.parseEther("0.1") }),
        ).to.be.revertedWith("window is not closed");
      });
      it("windows open ,value less than minimum ,fund failed", async function () {
        await expect(
          fundMe.fund({ value: ethers.parseEther("0.01") }),
        ).to.be.revertedWith("send more ETH");
      });
      it("windows open,value greater minimum value,fund success", async function () {
        await fundMe.fund({ value: ethers.parseEther("0.1") });
        const balance = await fundMe.FundersToAmount(firstAccount);
        await expect(balance).to.equal(ethers.parseEther("0.1"));
      });
      it("not owner ,windows closed,target is reached", async function () {
        await fundMe.fund({ value: ethers.parseEther("1") });
        await helpers.time.increase(200);
        await helpers.mine();
        await expect(fundmesecondaccount.getFund()).to.be.revertedWith(
          "is not owner",
        );
      });
      it("windows open,target isreached,is owner", async function () {
        await fundMe.fund({ value: ethers.parseEther("1") });
        await expect(fundMe.getFund()).to.be.revertedWith(
          "window is not closed",
        );
      });
      it("windows closed,is owner,target not reached", async function () {
        await fundMe.fund({ value: ethers.parseEther("0.1") });
        await helpers.time.increase(200);
        await helpers.mine();
        await expect(fundMe.getFund()).to.be.revertedWith(
          "target is not reached",
        );
      });
      it("windows closed,target reached ,is owner", async function () {
        await fundMe.fund({ value: ethers.parseEther("1") });
        await helpers.time.increase(200);
        await helpers.mine();
        await expect(fundMe.getFund())
          .to.be.emit(fundMe, "FundWithdrawByOwner")
          .withArgs(ethers.parseEther("1"));
      });
      it("windows open ,target not reached , funder has balance", async function () {
        await fundMe.fund({ value: ethers.parseEther("0.1") });
        await expect(fundMe.reFund()).to.be.revertedWith(
          "window is not closed",
        );
      });
      it("windows closed,target reached,funder has balance", async function () {
        await fundMe.fund({ value: ethers.parseEther("1") });
        await helpers.time.increase(200);
        await helpers.mine();
        await expect(fundMe.reFund()).to.be.revertedWith(
          "target is not reached",
        );
      });
      it("windows closed,target not reached,funder not has balance", async function () {
        await fundMe.fund({ value: ethers.parseEther("0.1") });
        await helpers.time.increase(200);
        await helpers.mine();
        await expect(fundmesecondaccount.reFund()).to.be.revertedWith(
          "there is no fund for you",
        );
      });
      it("windows closed,target not reached,funder has balance", async function () {
        await fundMe.fund({ value: ethers.parseEther("0.1") });
        await helpers.time.increase(200);
        await helpers.mine();
        await expect(fundMe.reFund())
          .to.be.emit(fundMe, "reFundByfunder")
          .withArgs(firstAccount, ethers.parseEther("0.1"));
      });
    });
