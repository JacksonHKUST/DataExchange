import { EventEmitter, Injectable } from '@angular/core';
import Web3 from "web3";

import { contractAddress } from "../../../../address"
import { testAbi } from "../../../../abi"
import { Constants } from "../../../../Constants"
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
  contract: any
  mlUploadFee = Constants.ML_UPLOAD_FEE 
  rawUploadFee = Constants.RAW_UPLOAD_FEE 

  // User info
  userAddress: any

  isProcessingEvent = new EventEmitter<Boolean>();


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

  public getIdList = async (isMl:boolean) => {
    console.log("Calling getIdList");
    let idListResult
    try {
      if(isMl){
        idListResult = await this.contract.methods.view_ml_key_id_list().call()
      }
      else{
        idListResult = await this.contract.methods.view_raw_data_id_list().call()
      }
      
    }
    catch (e) {
      return null
    }
    return idListResult
  }




  public getDataInfo = async (idList: Number[],isMl:boolean) => {
    console.log("Calling getDataInfo");
    if(idList == null || idList.length == 0){
      return {0:[],1:[],2:[]}
    }

    let dataInfoList
    try {
      if(isMl){
        dataInfoList = await this.contract.methods.retrieve_ml_product_info(idList).call()
      }
      else{
        dataInfoList = await this.contract.methods.retrieve_raw_data_info(idList).call()
      }
     
    }
    catch (e) {
      return {0:[],1:[],2:[]}
    }
    return dataInfoList;

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





  public purchaseData = async (dataId: Number, price: Number,isMl:boolean, inputAddress?: String) => {
    let dataResult;

    try {
      let fromAddress = await this.validateInputAddress(inputAddress);


      let contractMethod;

      if(isMl){
       contractMethod = this.contract.methods.purchase_ML_API // keyId
      }
      else{
      contractMethod = this.contract.methods.purchaseData
      }
        this.isProcessingEvent.emit(true)
      // const purchaseResult = await this.contract.methods.purchaseData(dataId).send(
        const purchaseResult = await contractMethod(dataId).send(
        {
          from: fromAddress,
          value: price,
          // value: 1
        }
      ).on('excess_eth_returned', function (senderAddress: any, returnedEth: any) {
        // console.log("senderAddress,returnedEth ", senderAddress, returnedEth)
      })
        .then(
          async (res: any) => {
            console.log("purchaseResult", res)
            console.log("dataId: ", dataId);

            if(isMl){
              await this.contract.methods.view_purchased_ml_api_key(dataId).call(
                {
                  from: fromAddress,
                }
              ).then(
                (apiKey: any) => {
                  console.log("apiKey ", apiKey);
                  dataResult = apiKey
                }
              )
            }
            else{
              await this.contract.methods.view_purchased_raw_data(dataId).call({
                from: fromAddress,
              }).then(
                (dataHash: any) => {
                  console.log("dataHash: ", dataHash);
                  dataResult = dataHash
                }
              )
            }


          });

          this.isProcessingEvent.emit(false)
          return dataResult

    } catch (err) {
      // console.log(err);
      this.isProcessingEvent.emit(false)
      return Constants.MESSAGE_TRASACTION_GENERAL_ERROR

    }

    // return dataResult
  }



  public activateMlService = async (data_hash: String,inputAddress?: String) => {
    try {
      let fromAddress = await this.validateInputAddress(inputAddress);

      console.log("data_hash: ",data_hash);
      
      this.isProcessingEvent.emit(true)

       await this.contract.methods.activate_ML_service(data_hash).send(
          {
            from: fromAddress,
            value: this.mlUploadFee
          }
        )
          .then( (res: any) =>{
            console.log("activateResult", res)
          });
          this.isProcessingEvent.emit(false)
          return Constants.MESSAGE_TRASACTION_ACTIVATE_SUCCESSFULLY
    } catch (err) {
      console.log(err);
      this.isProcessingEvent.emit(false)
      return Constants.MESSAGE_TRASACTION_GENERAL_ERROR

    }
   

  }


  public viewMlStatus = async (data_hash: String,inputAddress?: String) => {
    try {
      let fromAddress = await this.validateInputAddress(inputAddress);

      console.log("data_hash: ",data_hash);
      
      this.isProcessingEvent.emit(true)

       const isMlEnabled = await this.contract.methods.view_ML_status(data_hash).call(
          {
            from: fromAddress,
          }
        )
          .then( (res: any) =>{
            console.log("viewMlStatus Result", res)

          });
          this.isProcessingEvent.emit(false)
          if(isMlEnabled){
            return Constants.MESSAGE_ML_ENABLED
          }
          return Constants.MESSAGE_ML_DISALBED
    } catch (err) {
      console.log(err);
      this.isProcessingEvent.emit(false)
      return Constants.MESSAGE_TRASACTION_GENERAL_ERROR

    }
   

  }




  public uploadData = async (data_hash: String, dataName:String,price: Number, purchaseMl: boolean, dataDesc:String,inputAddress?: String) => {
    try {
      let fromAddress = await this.validateInputAddress(inputAddress);
      // uploadResult = this.contract.methods.upload_ML_API_key(fromAddress, dataName,data_hash,price,dataDesc).send(
      //   {
      //     from: fromAddress,
      //     value: 0
      //   }
      // )

      console.log("data_hash, dataName,price, purchaseMl,dataDesc,",data_hash, dataName,price, purchaseMl,dataDesc);
      
      this.isProcessingEvent.emit(true)

       await this.contract.methods.uploadData(data_hash, dataName,price, purchaseMl,dataDesc).send(
          {
            from: fromAddress,
            value: purchaseMl ? this.mlUploadFee : this.rawUploadFee
          }
        )
          .then( (res: any) =>{
            console.log("uploadResult", res)
          });
          this.isProcessingEvent.emit(false)
          return Constants.MESSAGE_TRASACTION_UPLOAD_SUCCESSFULLY
    } catch (err) {
      console.log(err);
      this.isProcessingEvent.emit(false)
      return Constants.MESSAGE_TRASACTION_GENERAL_ERROR

    }
   

  }





  private async validateInputAddress(inputAddress?: String) {
    let fromAddress;
    if (this.isAddressBlank(inputAddress)) {
      console.log("Calling openmMetamask to get user address");
      this.userAddress = await this.openMetamask()
      fromAddress = this.userAddress
      console.log("userAddress got from openMetamask: ", this.userAddress);
    }
    else {
      console.log("Using input address");
      fromAddress = inputAddress
    }
    return fromAddress
  }

  private isAddressBlank(address?: String): boolean {
    return (address == null || address === "");
  }

}