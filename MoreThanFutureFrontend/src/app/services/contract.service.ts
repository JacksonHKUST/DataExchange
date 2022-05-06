import { Injectable } from '@angular/core';
import Web3 from "web3";


import {contractAddress } from "../../../../address"
import { testAbi}from "../../../../abi"
declare const window: any;


@Injectable({
    providedIn: 'root'
})
export class ContractService {

  address = contractAddress 
  abi = testAbi

    window:any;
    constructor() { }
    private getAccounts = async () => {
        try {
            return await window.ethereum.request({ method: 'eth_accounts' });
        } catch (e) {
            return [];
        }
    }

    public openMetamask = async () => {
        window.web3 = new Web3(window.ethereum);
        let addresses = await this.getAccounts();
        console.log("service",addresses)
        if (!addresses.length) {
            try {
                addresses = await window.ethereum.enable();
            } catch (e) {
                return false;
            }
        }
        return addresses.length ? addresses[0] : null;
    };

    // public printApi = ()=>{
    //   console.log(this.abi)
    // }

    public purchaseData = async () => {
      try {
              const contract = new window.web3.eth.Contract(
                  this.abi,
                  this.address,
              );
              const dataHash = await contract.methods.purchaseData(0).call();
              console.log("dataHash",dataHash)
              return dataHash
          
      }
      catch (error) {
          // const errorMessage = error.message;
          console.log(error)

      }
  }

  public uploadData = async () =>{

    // string memory data_hash, uint price, bool purchase_ML
    try{
      const contract = new window.web3.eth.Contract(
        this.abi,
        this.address,
    );
    const uploadResult = await contract.methods.uploadData("def",100,false).call();
        console.log("uploadResult",uploadResult);
        
    }catch(err){
      console.log(err);
      
    }
  }
    
}