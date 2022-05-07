import { Component, OnInit } from '@angular/core';
import { ContractService } from './services/contract.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  userAddress = ""
  rawIdList:Number[] = [];

  constructor(private contractService:ContractService) {
    
  }
  
  ngOnInit(){
  this.initRawData()

  }

  private initRawData(){
    this.contractService.getRawIdList().then(
      idList =>{
        console.log("idList: ",idList);
        this.rawIdList = idList
      }
    );
    
  }

  
  linkWallet(){
    // for user want to connect wallet in advanced
    this.contractService.openMetamask().then(resp =>{
      console.log(resp);
      this.userAddress = resp //set userAddress from account

    })
  }

  buyData(){
    console.log(`Calling purchaseData with address ${this.userAddress}`)
    this.contractService.purchaseData(this.userAddress)
  }

  uploadData(){
    console.log(`Upload Data`);
    // const [data_hash,price,isML] = ["carlo",0,false] // testing w/o ML
    const [data_hash,price,isML] = ["carlo",0,true] // testing ML
    this.contractService.uploadData(data_hash,price,isML,this.userAddress)
  }


}
