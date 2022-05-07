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
  rawDataList: RawData[] = [];

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
        this.contractService.getRawDataInfo(this.rawIdList).then(
          (rawDataInfos:any) =>{
            console.log(rawDataInfos) // 0:name,1:price,2:desc
            const nameList = rawDataInfos[0]
            const priceList = rawDataInfos[1]
            const descList = rawDataInfos[2]
            // let rawDataList: RawData[]

            this.rawDataList = nameList.map( (v:any,index:any) => ({
              dataId: this.rawIdList[index],
              dataName: nameList[index], 
              price: priceList[index],
              dataDesc: descList[index]
          }));
            // console.log("rawDataList, ",this.rawDataList);
            
            
          }
        )

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

  buyData(dataId:Number){
    console.log(`Calling purchaseData with dataId: ${dataId} address: ${this.userAddress}`)
    let dataResult = this.contractService.purchaseData(dataId,this.userAddress)
    console.log(dataResult);
    
  }

  uploadData(){
    console.log(`Upload Data`);
    // const [data_hash,price,isML] = ["carlo",0,false] // testing w/o ML
    const [data_hash,price,isML] = ["carlo",0,true] // testing ML
    this.contractService.uploadData(data_hash,price,isML,this.userAddress)
  }


}


interface RawData{
  dataId: Number,
  dataName: String,
  price: Number,
  dataDesc: String
}