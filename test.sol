// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {FundMe} from"./FoundMe.sol";

contract FundTokenERC20 is ERC20{
    FundMe fundme;
    constructor(address fundmeAddr) ERC20("FundTokenERC20","FT"){
        fundme=FundMe(fundmeAddr);
    }
    function mint(uint256 amountTomint)public getfundsuccess{
        require(fundme.FundersToAmount(msg.sender)>=amountTomint,"you cannot mint this many tokens");
        _mint(msg.sender,amountTomint);
        fundme.setFunderToamount(msg.sender,fundme.FundersToAmount(msg.sender)-amountTomint);
    }
    function claim(uint256 amountClaim )public getfundsuccess{
        require(balanceOf(msg.sender)>=amountClaim);
        _burn(msg.sender, amountClaim);
    }
    modifier getfundsuccess(){
        require(fundme.getFundSuccess(),"the fundme is not completed yet");
        _;
    }
}