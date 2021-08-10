pragma solidity >=0.8.0;

contract Add {
  uint currentNumber;

  constructor() payable {
    currentNumber = 0;
  }

  function add(uint n) public payable {
    require(n > 0, "Positive number required");
    currentNumber += n;
  }

  function getCurrentNumber() public view returns (uint) {
    return currentNumber;
  }
}
