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
    uint raw_data_id;
    uint[] raw_data_id_list;
    uint ml_key_id;
    uint[] ml_key_id_list;
    uint ml_purchase_fee = 1 wei;
    address administrator = address(0xcd9EdCee608e3D7D8Cb3a82Fe7ac5AAD7Cf54e59);
    
    receive () external payable {}
    event excess_eth_returned(address, uint);  //exchange excess eth sent to sender

    function uploadData(string memory data_hash, uint price, bool purchase_ML) public payable {
        data_map[raw_data_id] = data(data_hash, msg.sender, price);

        if (purchase_ML == true) {
            require(msg.value >= ml_purchase_fee, "Inadequate ETH sent");
            ML_purchase_status[data_hash] = ml_status(true, msg.sender);
            payable(msg.sender).transfer(msg.value - ml_purchase_fee);
            emit excess_eth_returned(msg.sender, msg.value - ml_purchase_fee);
            //payable(administrator).transfer(ml_purchase_fee);
        } else {
            ML_purchase_status[data_hash] = ml_status(false, msg.sender);
        }
        
        raw_data_id_list.push(raw_data_id);
        raw_data_id += 1;
    }

     function activate_ML_service(string memory data_hash) public payable {
        if (ML_purchase_status[data_hash].seller == msg.sender) {
            //payable(administrator).transfer(ml_purchase_fee);
            require(msg.value >= ml_purchase_fee, "Inadequate ETH sent");
            payable(msg.sender).transfer(msg.value - ml_purchase_fee);
            emit excess_eth_returned(msg.sender, msg.value - ml_purchase_fee);
            ML_purchase_status[data_hash].isMLService = true;
        }
    }

    function purchaseData(uint data_id) public payable returns(string memory) {
        require(msg.value >= data_map[data_id].price, "Indaquate ETH sent");
        payable(msg.sender).transfer(msg.value - data_map[data_id].price);
        emit excess_eth_returned(msg.sender, msg.value - data_map[data_id].price);
        payable(data_map[data_id].seller).transfer(data_map[data_id].price);
        //payable(data_map[data_id].seller).transfer(data_map[data_id].price);
        //payable(administrator).transfer(data_map[data_id].price);
        return data_map[data_id].dataHash;
    }
    
    function upload_ML_API_key(address seller, string memory api_key, uint price) public {
        ML_API_keys[ml_key_id] = ML_API_key(api_key, seller, price);
        ml_key_id_list.push(ml_key_id);
        ml_key_id += 1;
    }
    
    function purchase_ML_API(uint key_id) public payable returns (string memory) {
        //payable(ML_API_keys[data_id].seller).transfer(ML_API_keys[data_id].price);
        require(msg.value >= ML_API_keys[key_id].price, "Indaquate ETH sent");
        payable(msg.sender).transfer(msg.value - data_map[key_id].price);
        emit excess_eth_returned(msg.sender, msg.value - data_map[key_id].price);
        payable(ML_API_keys[key_id].seller).transfer(ML_API_keys[key_id].price);
        return ML_API_keys[key_id].api_key;
    }

    //For sellers to view whether they have purchased ML service for their dataset uploaded
    function view_ML_status(string memory data_hash) public view returns (bool) {
        if(msg.sender==ML_purchase_status[data_hash].seller){
            return ML_purchase_status[data_hash].isMLService;
        }
        return false;
    }
    
    //For our team to view data hash of any data_id stored in our front-end
    function internal_view_data_hash(uint data_id) public view returns (string memory) {
        if(msg.sender==administrator){
        return data_map[data_id].dataHash;
        }
        return "You don't have the access!";
    }

    //check contract balance, should not be increased when someone purchase data
    function view_contract_balance() public view returns (uint) {
        return address(this).balance;
    }

    function view_raw_data_id_list() public view returns (uint[] memory) {
        return raw_data_id_list;
    }

    function view_ml_key_id_list() public view returns (uint[] memory) {
        return ml_key_id_list;
    }
}
