import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { ContractService } from './services/contract.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit{
  userAddress = ""

  rawIdList:Number[] = [];
  mlIdList:Number[] = [];

  rawDataList: RawData[] = [];
  mlDataList:MlData[] =[];


  /* Layout control */
  uploadForm:FormGroup;
  activateForm:FormGroup;
  isMlChecked:boolean = false;
  activeTabList:String[] = ['uploadData','activate','purchaseRaw','purchaseMl']
  activeTab?:String =   this.activeTabList[0];
  // popUpDisplayStyle = "none";
  isProcessing:Boolean = false;
  isPopupOpened:Boolean = false;
  responseResult?:String = "";


  constructor(private contractService:ContractService,
    private fb:FormBuilder,
    private elementRef: ElementRef) {
      this.uploadForm = this.fb.group({
        dataNameInput: ['',Validators.required],
        dataHashInput: ['',Validators.required],
        priceInput: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
        dataDescInput: ['',Validators.required],
        mlCheckbox: [false,[]]
      });

      this.activateForm = this.fb.group({
        rawDataHashInput: ['',Validators.required]    
      });


  }
  ngAfterViewInit(): void {
  
      this.elementRef.nativeElement.ownerDocument
          .body.style.backgroundColor = 'black';
  
  }
  
  ngOnInit(){
  this.initData()
  this.contractService.isProcessingEvent.subscribe(
    (isProcessing:boolean)=>{
      console.log("getting isProcessing from event: ", isProcessing);
      this.isProcessing =  isProcessing
    }

  )
  }

  public onCheckboxChange(event:any){
    // console.log(event.target.checked);
    this.isMlChecked = event.target.checked;
  }


  private initData(){
    this.contractService.getIdList(false).then(
      idList =>{
        console.log("idList: ",idList);
        this.rawIdList = idList
        this.contractService.getDataInfo(this.rawIdList,false).then(
          (info:any) =>{
            console.log(info) // 0:name,1:price,2:desc
            const nameList = info[0]
            const priceList = info[1]
            const descList = info[2]
            this.rawDataList = nameList.map( (v:any,index:any) => ({
              dataId: this.rawIdList[index],
              dataName: nameList[index], 
              price: priceList[index],
              dataDesc: descList[index]
          }));            
          }
        )

      }
    );

    this.contractService.getIdList(true).then(
      idList =>{
        console.log("idList:(ml) ",idList);
        this.mlIdList = idList
        this.contractService.getDataInfo(this.mlIdList,true).then(
          (info:any) =>{
            console.log(info) // 0:name,1:price,2:desc
            const nameList = info[0]
            const priceList = info[1]
            const descList = info[2]
           
            this.mlDataList = nameList.map( (v:any,index:any) => ({
              dataId: this.rawIdList[index],
              dataName: nameList[index], 
              price: priceList[index],
              dataDesc: descList[index]
          }));
            
            
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

  buyData(dataId:Number,price:Number,isMl:boolean){
    console.log(`Calling purchaseData with dataId: ${dataId}, price: ${price},address: ${this.userAddress}`)
    this.controlPopupWindow(true,"")
    this.contractService.purchaseData(dataId,price,isMl,this.userAddress).then(
      res =>{
        // console.log("res: ",res);
        const modifiedRes = "The hash/apiKey purhcased is: "+res
        this.controlPopupWindow(true,modifiedRes)
      }
    )
    // console.log("buyData returned: ",dataResult  );

    
  }

  uploadData(){
    console.log(`Upload Data`);
    // console.log("this.uploadForm.value: ",this.uploadForm.value);
    const formValue = this.uploadForm.value
   
    // const [dataHash,dataName,price,purchaseMl,dataDesc] = ["hash1","name1",0,false,"desc1"] // testing w/o ML
    // const [dataHash,dataName,price,purchaseMl,dataDesc] = ["apiKey1","mlName1",0,true,"mlDesc1"] // testing ML
  
    const [dataHash,dataName,price,purchaseMl,dataDesc] = 
    [formValue.dataHashInput,formValue.dataNameInput,formValue.priceInput,formValue.mlCheckbox,formValue.dataDescInput,]
    
    this.controlPopupWindow(true,"")
    this.contractService.uploadData(dataHash,dataName,price,purchaseMl,dataDesc,this.userAddress)
    .then(
      res=>{
        this.controlPopupWindow(true,res)
      }
    )
    this.resetUploadForm()
  
  }

  activeMlService(){

    console.log(`Upload Data`);
    console.log("this.activateForm.value: ",this.activateForm.value);
    const formValue = this.activateForm.value
    const rawDataHash = formValue.rawDataHashInput

    this.controlPopupWindow(true,"")
    this.contractService.activateMlService(rawDataHash)
    .then(
      res=>{
        const modifiedRes = res+` (Hash: ${rawDataHash}) `
        this.controlPopupWindow(true,modifiedRes)
      }
    )

    this.resetUploadForm()

  }

  checkMlStatus(){

    console.log(`Upload Data`);
    console.log("this.activateForm.value: ",this.activateForm.value);
    const formValue = this.activateForm.value
    const rawDataHash = formValue.rawDataHashInput

    this.controlPopupWindow(true,"")
    this.contractService.viewMlStatus(rawDataHash)
    .then(
      res=>{

        this.controlPopupWindow(true,res)
      }
    )

    this.resetUploadForm()

  }



  controlPopupWindow(isPopupOpened:Boolean,res?:String){
    this.isPopupOpened = isPopupOpened
    this.responseResult = res


    
  }

  resetUploadForm(){
      this.uploadForm.reset()
  }

  resetActivateForm(){
    this.activateForm.reset()
  }


  switchTab(tabName:String){
    if(this.activeTabList.includes(tabName)){
      this.activeTab = tabName
      // const index = this.activeTabList.indexOf(tabName)
      // this.activeTab = this.activeTabList[index]
      // this.initData()
    }
    
  }


}


interface RawData{
  dataId: Number,
  dataName: String,
  price: Number,
  dataDesc: String,
  dataHash: String,
}

interface MlData{
  dataId: Number,
  dataName: String,
  price: Number,
  dataDesc: String
  apiKey: String,
}