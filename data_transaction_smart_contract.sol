// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;
contract data_transaction {
    struct data {
        string dataHash;
        string dataset_name;//front_end
        address seller;
        uint price;//front-end
        string description;//front-end
        address[] buyers;
    }
    struct ML_API_key {
        string api_key;
        string ml_product_name;//front_end
        address seller;
        uint price;//front_end
        string description;//front_end
        address[] buyers;
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

    mapping(address => bool) public adminMemberMapping;
    constructor() {
        // Using metamask address for demo
        adminMemberMapping[address(0xcd9EdCee608e3D7D8Cb3a82Fe7ac5AAD7Cf54e59)] = true; // Jackson 
        adminMemberMapping[address(0xc834E96DD8788Ce1702c589dd56cA7415a041177)] = true; // Jason
        adminMemberMapping[address(0x470bCF448E819306fa7aD1aA5ED5eD669B933C2b)] = true; //Carlo
    }
    function hasAdminRight(address inputAddress) private view returns (bool){
        return adminMemberMapping[inputAddress];
    }
    
    receive () external payable {}
    event excess_eth_returned(address, uint);  //exchange excess eth sent to sender

    function uploadData(string memory data_hash, string memory dataset_name, uint price, bool purchase_ML, string memory data_description) public payable {
        data_map[raw_data_id] = data(data_hash, dataset_name, msg.sender, price, data_description, new address[](0));

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

    function purchaseData(uint data_id) public payable{
        require(msg.value >= data_map[data_id].price, "Indaquate ETH sent");
        payable(msg.sender).transfer(msg.value - data_map[data_id].price);
        emit excess_eth_returned(msg.sender, msg.value - data_map[data_id].price);
        payable(data_map[data_id].seller).transfer(data_map[data_id].price);
        //payable(data_map[data_id].seller).transfer(data_map[data_id].price);
        //payable(administrator).transfer(data_map[data_id].price);
        //emit send_data_hash(msg.sender, data_map[data_id].dataHash);
        data_map[data_id].buyers.push(msg.sender);
    }
    
    function upload_ML_API_key(address seller, string memory ml_product_name, string memory api_key, uint price, string memory description) public {
        ML_API_keys[ml_key_id] = ML_API_key(api_key, ml_product_name, seller, price, description, new address[](0));
        ml_key_id_list.push(ml_key_id);
        ml_key_id += 1;
    }
    
    function purchase_ML_API(uint key_id) public payable{
        //payable(ML_API_keys[data_id].seller).transfer(ML_API_keys[data_id].price);
        require(msg.value >= ML_API_keys[key_id].price, "Indaquate ETH sent");
        payable(msg.sender).transfer(msg.value - data_map[key_id].price);
        emit excess_eth_returned(msg.sender, msg.value - data_map[key_id].price);
        payable(ML_API_keys[key_id].seller).transfer(ML_API_keys[key_id].price);
        //return ML_API_keys[key_id].api_key;
        ML_API_keys[key_id].buyers.push(msg.sender);
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
        // if(msg.sender==administrator){
        // return data_map[data_id].dataHash;
        // }
        // return "You don't have the access!";
        if(hasAdminRight(msg.sender)){
            return data_map[data_id].dataHash;
        }
        return "You don't have the access!";
    }

    function view_purchased_raw_data(uint data_id) public view returns (string memory) {
        for(uint i=0; i<data_map[data_id].buyers.length; i++){
            if(msg.sender==data_map[data_id].buyers[i]){
                return data_map[data_id].dataHash;
            }
        }
        return "You haven't purchased this dataset!";
    }

    function view_purchased_ml_api_key(uint key_id) public view returns (string memory) {
        for(uint i=0; i<ML_API_keys[key_id].buyers.length; i++){
            if(msg.sender==ML_API_keys[key_id].buyers[i]){
                return ML_API_keys[key_id].api_key;
            }
        }
        return "You haven't purchased this api key!";
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

    function retrieve_raw_data_info(uint[] memory data_id_list) public view returns (string[] memory, uint[] memory, string[] memory){
        string[] memory dataset_name_list = new string[](data_id_list.length);
        uint[] memory data_price_list = new uint[](data_id_list.length);
        string[] memory data_description_list = new string[](data_id_list.length);
        for (uint i=0; i<data_id_list.length; i++){
             dataset_name_list[i] = data_map[data_id_list[i]].dataset_name;
             data_price_list[i] = data_map[data_id_list[i]].price;
             data_description_list[i] = data_map[data_id_list[i]].description;
        }
        return (dataset_name_list, data_price_list, data_description_list);
    }

    function retrieve_ml_product_info(uint[] memory ml_key_list) public view returns (string[] memory, uint[] memory, string[] memory){
        string[] memory ml_product_name_list = new string[](ml_key_list.length);
        uint[] memory price_list = new uint[](ml_key_list.length);
        string[] memory description_list = new string[](ml_key_list.length);
        for (uint i=0; i<ml_key_list.length; i++){
             ml_product_name_list[i] = ML_API_keys[ml_key_list[i]].ml_product_name;
             price_list[i] = ML_API_keys[ml_key_list[i]].price;
             description_list[i] = ML_API_keys[ml_key_list[i]].description;
        }
        return (ml_product_name_list, price_list, description_list);
    }
    
}
