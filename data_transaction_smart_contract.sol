// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;
contract data_transaction {
    struct data {
        string dataHash;
        address seller;
        uint price;
        string description;
        bool isMLService;
    }
    struct ML_API_key {
        string api_key;
        address seller;
        uint price;
        string description;
    }

    mapping(uint => data) data_map;
    mapping(uint => ML_API_key) ML_API_keys;
    uint last_id;
    
    function uploadData(string memory data_hash, uint price, string memory description, bool purchase_ML) public {
        data_map[last_id] = data(data_hash, msg.sender, price, description, false);

        if (purchase_ML == true) {
            data_map[last_id].isMLService = true;
        }

        last_id += 1;
    }

    function activate_ML_service(uint data_id) public {
        if (data_map[data_id].seller == msg.sender) {
            data_map[data_id].isMLService = true;
        }
    }

    function purchaseData(uint data_id) public returns (string memory) {
        payable(data_map[data_id].seller).transfer(data_map[data_id].price);
        return data_map[data_id].dataHash;
    }
    
    function upload_ML_API_key(address seller, string memory api_key, uint price, string memory description) public {
        ML_API_keys[last_id] = ML_API_key(api_key, seller, price, description);
        last_id += 1;
    }
    
    function purchase_ML_API(uint data_id) public returns (string memory) {
        payable(ML_API_keys[data_id].seller).transfer(ML_API_keys[data_id].price);
        return ML_API_keys[data_id].api_key;
    }
    
    function view_ML_status(uint data_id) public view returns (bool) {
        return data_map[data_id].isMLService;
    }
}
