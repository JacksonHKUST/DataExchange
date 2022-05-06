import { Component } from '@angular/core';
import { ContractService } from './services/contract.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  // title = 'MoreThanFutureFrontend';

  constructor(private contractService:ContractService) {
    
  }

  openMetaMask(){
    this.contractService.openMetamask().then(resp =>{
      console.log(resp);
    })
  }

  // printApi(){
  //   this.contractService.printApi()
  // }

  buyData(){
    console.log(`Calling buyData`)
    this.contractService.purchaseData()
  }

  uploadData(){
    console.log(`Upload Data`);
    this.contractService.uploadData()
    
  }
}
