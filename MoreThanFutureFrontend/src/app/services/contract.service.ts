import { Injectable } from '@angular/core';
import Web3 from "web3";
import { testAbi}from "../../../../abi"
declare const window: any;


@Injectable({
    providedIn: 'root'
})
export class ContractService {
  address ='0xd9145CCE52D386f254917e481eB44e9943F39138'
  abi = testAbi;

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
    
}