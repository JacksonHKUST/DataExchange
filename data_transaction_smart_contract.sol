// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;
contract data_transaction {
    struct data {
        string dataHash;
        address seller;
        uint price;
        //string description;
        //bool isMLService;
    }
    struct ML_API_key {
        string api_key;
        address seller;
        uint price;
        //string description;
    }
    struct ml_status {
        bool isMLService;
        address seller;
    }

    mapping(uint => data) data_map;
    mapping(uint => ML_API_key) ML_API_keys;
    mapping(string => ml_status) ML_purchase_status; 
    uint last_id;
    uint ml_purchase_fee = 2;
    address administrator = 0xcd9EdCee608e3D7D8Cb3a82Fe7ac5AAD7Cf54e59;
    
    function uploadData(string memory data_hash, uint price, bool purchase_ML) public {
        data_map[last_id] = data(data_hash, msg.sender, price);

        if (purchase_ML == true) {
            ML_purchase_status[data_hash].isMLService = true;
            ML_purchase_status[data_hash].seller = msg.sender;
            payable(administrator).transfer(ml_purchase_fee);
        }

        last_id += 1;
    }

    function activate_ML_service(string memory data_hash) public {
        if (ML_purchase_status[data_hash].seller == msg.sender) {
            payable(administrator).transfer(ml_purchase_fee);
            ML_purchase_status[data_hash].isMLService = true;
        }
    }

    function purchaseData(uint data_id) public returns (string memory) {
        payable(data_map[data_id].seller).transfer(data_map[data_id].price*0.9);
        payable(administrator).transfer(data_map[data_id].price*0.1);
        return data_map[data_id].dataHash;
    }
    
    function upload_ML_API_key(address seller, string memory api_key, uint price) public {
        ML_API_keys[last_id] = ML_API_key(api_key, seller, price);
        last_id += 1;
    }
    
    function purchase_ML_API(uint data_id) public returns (string memory) {
        payable(ML_API_keys[data_id].seller).transfer(ML_API_keys[data_id].price);
        return ML_API_keys[data_id].api_key;
    }

    //For sellers to view whether they have purchased ML service for their dataset uploaded
    function view_ML_status(string memory data_hash) public view returns (bool) {
        if(msg.sender==ML_purchase_status[data_hash].seller){
            return ML_purchase_status[data_hash].isMLService;
        }
        return "You don't have the access!"
    }
    
    //For our team to view data hash of any data_id stored in our front-end
    function internal_view_data_hash(uint data_id) public view returns (string memory) {
        if(msg.sender==administrator){
        return data_map[data_id].dataHash;
        }
        return "You don't have the access!";
    }
}
