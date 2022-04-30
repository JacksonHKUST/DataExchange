// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;
contract data_transaction {
    mapping(string => address payable) data_and_seller;
    mapping(string => uint) dataPrice;
    mapping(string => string) dataDescription;
    mapping(uint => string) data_id;
    uint last_id;
    
    function uploadData(string memory data_hash, uint price, string memory description) public {
        data_and_seller[data_hash] = payable(msg.sender);
        dataPrice[data_hash] = price;
        dataDescription[data_hash] = description;
        data_id[last_id] = data_hash; 
        last_id += 1;
    }
   
    function purchaseData(uint dataid) public returns (string memory) {
        string memory data_hash = data_id[dataid];
        data_and_seller[data_hash].transfer(dataPrice[data_hash]);
        return data_hash;
    }
}