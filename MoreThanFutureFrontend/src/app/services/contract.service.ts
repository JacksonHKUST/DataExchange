import { Injectable } from '@angular/core';
import Web3 from "web3";

import { contractAddress } from "../../../../address"
import { testAbi } from "../../../../abi"
declare const window: any;

// https://docs.metamask.io/guide/provider-migration.html#replacing-window-web3

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  
  window: any;

  // Contract info
  contractAddress = contractAddress
  abi = testAbi
  contract:any
  mlUploadFee = 1 // unit in wei
  rawUploadFee = 0 // unit in wei

  // User info
  userAddress:any


  constructor() { 
    this.initContractService()
  }

  public initContractService() {
    console.log("initContractService");
    // init web3
    window.web3 = new Web3(window.ethereum);
    // init contract
    this.contract = new window.web3.eth.Contract(
      this.abi,
      this.contractAddress,
    );

  }

  public getRawIdList = async () => {
    console.log("Calling getRawIdList");
    let rawIdListResult 
    try {
      rawIdListResult = await this.contract.methods.view_raw_data_id_list().call()
    }
    catch (e) {
      return null
  }
  return rawIdListResult
}

  public getRawDataInfo = async (idList:Number[]) =>{
    console.log("Calling getRawDataInfo ");
    let rawDataInfoList
    try{
      rawDataInfoList = await this.contract.methods.retrieve_raw_data_info(idList).call()
    }
    catch(e) {
      return null
    }

    
    return rawDataInfoList;
 
  }


  private getAccounts = async () => {
    try {
      return await window.ethereum.request({ method: 'eth_accounts' });
    } catch (e) {
      return [];
    }
  }

  public openMetamask = async () => {
    window.web3 = new Web3(window.ethereum);
    let userAddresses = await this.getAccounts();
    console.log("userAddress:", userAddresses)
    if (!userAddresses.length) {
      try { 
        userAddresses = await window.ethereum.enable();
      } catch (e) {
        return false;
      }
    }
    return userAddresses.length ? userAddresses[0] : null;
  };

  public purchaseData = async (dataId:Number,inputAddress?: String) => {
    let dataResult;

    try {
      let fromAddress = await this.validateInputAddress(inputAddress);

      const purchaseResult = this.contract.methods.purchaseData(dataId).send(
        {
          from: fromAddress,
          value: 1
        }
      )
        // .on('excess_eth_returned', function (senderAddress: any, returnedEth: any) {
        //   console.log("senderAddress,returnedEth ", senderAddress, returnedEth)
        // })
        .then(
          (res:any) =>{
          console.log("purchaseResult", res)
            dataResult = this.contract.methods.view_purchased_raw_data(dataId).call()
        });



    } catch (err) {
      console.log(err);

    }

    return dataResult
  }

  public uploadData = async (data_hash: String, price: Number, isML: boolean, inputAddress?: String) => {
    try {
      let fromAddress = await this.validateInputAddress(inputAddress);
      const uploadResult = this.contract.methods.uploadData(data_hash, price, isML).send(
        {
          from: fromAddress,
          value: isML ? this.mlUploadFee : this.rawUploadFee
        }
      )
        .then(function (res: any) {
          console.log("uploadResult", res)
        });



    } catch (err) {
      console.log(err);

    }

  }


  private async validateInputAddress(inputAddress?:String){
    let fromAddress;
    if(this.isAddressBlank(inputAddress)){
      console.log("Calling openmMetamask to get user address");
      this.userAddress = await this.openMetamask()
      fromAddress = this.userAddress
      console.log("this.userAddress",this.userAddress);
    }
    else{
      console.log("Calling openmMetamask to get user address");
      fromAddress = inputAddress
    }
    return fromAddress
  }

  private isAddressBlank(address?:String):boolean{
    return (address == null || address === "");
  }

}