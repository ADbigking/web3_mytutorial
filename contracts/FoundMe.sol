// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract FundMe{
    mapping (address=>uint256) public FundersToAmount;
    uint256 MINIMUVALUE=100*10**18;
    uint256 constant TARGET =1000*10**18;
    address public owner;
    uint256 locktime;
    uint256 deploymentTimestamp;
    address ERC20Addr;
    event FundWithdrawByOwner(uint256);
    event reFundByfunder(address,uint256);
    bool public getFundSuccess=false;
    //后期要加入 receive() ，让metamask直接能转入。
    function fund()external payable {
        require(MINIMUVALUE<=convertETHtoUsd(msg.value),"send more ETH");
        require(block.timestamp<deploymentTimestamp+locktime,"window is not closed");
        FundersToAmount[msg.sender]+=msg.value;
    }
      AggregatorV3Interface public dataFeed;
      constructor(uint256 _locktime ,address dataFeedaddr) {
        //sepolia sestnet
    dataFeed = AggregatorV3Interface(dataFeedaddr);
    owner=msg.sender;
    deploymentTimestamp=block.timestamp;
    locktime=_locktime;
  }
      function getChainlinkDataFeedLatestAnswer() public view returns (int256) {
    // prettier-ignore  
    (
      /* uint80 roundId */
      ,
      int256 answer, 
      /*uint256 startedAt*/
      ,
      /*uint256 updatedAt*/ 
      ,
      /*uint80 answeredInRound*/
    ) = dataFeed.latestRoundData();
    return answer;
  }
  function convertETHtoUsd(uint256 ethamount)internal view returns(uint256) {
    uint256 ethprice=uint256(getChainlinkDataFeedLatestAnswer()); 
    return ethamount *ethprice/(10**8);
  }
  function transferOwnership(address newOwner)public onlyowner{
    require(newOwner!=address(0),"zero address");
    owner=newOwner;
  }
  function getFund() external onlyowner windowclsed {
    require(convertETHtoUsd(address(this).balance)>=TARGET,"target is not reached");
    uint256 amount=address(this).balance;
    //payable(msg.sender).transfer(address(this).balance);
    (bool success,)=payable(msg.sender).call{value:amount}("");
    require(success,"reansfer tx failed");
    getFundSuccess=true;
    emit FundWithdrawByOwner(amount);
  }
    function reFund() external windowclsed{
        require(FundersToAmount[msg.sender]!=0,"there is no fund for you");
        require(convertETHtoUsd(address(this).balance)<TARGET,"target is not reached");
        uint256 refunAmount=FundersToAmount[msg.sender];
        FundersToAmount[msg.sender]=0;
        (bool success,)=payable(msg.sender).call{value:refunAmount}("");
        require(success,"transfer th failed");
        emit reFundByfunder(msg.sender,refunAmount);
    }
    function setFunderToamount(address funder,uint256 _amountupdata)external {
        require(msg.sender==ERC20Addr,"you do have permisstion to call this function");
        FundersToAmount[funder]=_amountupdata;
    }
    function setERC20Addr(address _erc20addr)public onlyowner {
        ERC20Addr=_erc20addr;
    }
    modifier onlyowner(){
        require(msg.sender==owner,"is not owner");
        _;
    }
    modifier windowclsed(){
        require(block.timestamp>=deploymentTimestamp+locktime,"window is not closed");
        _;
    }
}