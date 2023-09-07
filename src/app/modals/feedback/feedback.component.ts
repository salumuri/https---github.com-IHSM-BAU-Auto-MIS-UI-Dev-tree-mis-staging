import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Api/api.service';
import { NgxSpinnerService } from "ngx-spinner";
import { GlobalConstants } from '../../common/global-constants';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})

export class FeedbackComponent implements OnInit {
  @Input() fromParent;
  selectedRow = [];
  selectedInd = '';
  selectedstp = '';
  qualityPer: number  = 100;
  accuracyWtg : any;
  remarkss : any = '';

  actualWtg : any = 0;
  totErrorWtg : any = 0;
  totErrorCnt : any = 0;

  errorfeedback : any = {
    screenprt : '',
    range     : '',
    errorDsp  : '',
    wtg       : '',
    actError  : '',
    aerror    : ''
  };
  errorfb : any = [];
  screenData:any;
  qcPercent:any;
  ScreenPrt: any;
  rangeData:any;
  erroDescData: any;
  ErrorDescData: any = [];
  Error_No: any=[];
  feedBackGridData: any = [];
  listOfErrors : any = [];
  allErrorsDesp : any = [];
  wtgEditble: any = false;
  newAttrWtg: any = '';
  respArry = {
    'feedbackList' : []
  }
  constructor(public globalConst: GlobalConstants,private spinner: NgxSpinnerService,public activeModal: NgbActiveModal,private Apiservice: ApiService) { }

  ngOnInit(): void {
    this.GetFeedBackGridData();
    this.spinner.show();
    this.selectedRow = [];
    this.selectedInd = '';
    this.selectedstp = '';
      //console.log(this.fromParent);
    var empId = localStorage.getItem("LoginId");
    if(this.fromParent['rowdt']){

      console.log('Selected Row -->', this.fromParent['rowdt']);

      this.selectedRow = this.fromParent['rowdt'];
      this.selectedRow['attrWtg'] = 0;
      this.selectedInd = this.fromParent['rowind'];
      this.selectedstp = this.fromParent['rowstp'];

      //this.respArry.step = this.selectedstp;
      //this.respArry.selectedRow = this.selectedInd;

      this.respArry['map'] = this.selectedRow['mid'].toString();
      this.respArry['workstream'] = this.selectedRow['workstream'].toString();
      this.respArry['service'] = this.selectedRow['service'].toString();
      this.respArry['state'] = this.selectedRow['batch'].toString();
      this.respArry['step'] = this.selectedstp;
      this.respArry['acceptance'] = 'Accepted';

    }

    var userId = localStorage.getItem('LoginId');

    this.GetScreens();
    this.GetQCPer();
    this.spinner.hide();
  }
  // Change Status
  changeStatus(ede){
    if(ede['workstream'] == 4 &&  ede['service'] == 44)
      this.wtgEditble = true;
    // console.log(this.selectedRow);
    // console.log(this.newAttrWtg);

  }

  changeAttrVal(ev){
    //console.log(this.selectedRow);
    //console.log(this.newAttrWtg);
    this.selectedRow['attrWtg'] = this.newAttrWtg
    this.wtgEditble = false;
  }

  GetQCPer(){
    this.Apiservice.get('Feedback/Qcpercent?workstream='+this.selectedRow['workstream']+'&service='+this.selectedRow['service']+'&batch='+
    this.selectedRow['batch']+'&step='+this.selectedstp + '&map=' + this.selectedRow['map'] +
    '&entities=' + this.selectedRow['entities'] + '&runs=' + this.selectedRow['runs']).subscribe((data:any)=>{
      this.globalConst.checkOriginAccess(data);

      console.log('Qc Percent-->',data);
      if(data.length > 0){
        var qcPer = (100 - parseFloat(data[0].qcpercent));
        this.actualWtg = qcPer;
        this.selectedRow['attrWtg'] = data[0].attrWtg;
        // if(this.selectedRow['batch'] == 1400){
        //   this.selectedRow['attrWtg'] = (23.75 + ( this.selectedRow['runs'] * 91));  // Log Header  wtg : (35 +( runs * 91))
        // }else if(this.selectedRow['batch'] == 1150){
        //   this.selectedRow['attrWtg'] = (21.725 * (this.selectedRow['total_kms']) * 115.65);   //Formation Tops -> USA : (136.375 * total_kms)
        // }else if(this.selectedRow['batch'] == 372){
        //   this.selectedRow['attrWtg'] = this.selectedRow['total_kms'];  // Digitization  : total_KMS is wttg
        // }else if(this.selectedRow['batch'] == 1167){
        //   this.selectedRow['attrWtg'] = this.selectedRow['total_kms'];  // Grid Check : total_KMS is wttg
        // }else if(this.selectedRow['batch'] == 391){
        //   this.selectedRow['attrWtg'] = (7 + (this.selectedRow['total_kms'] * 2)); //Peps -> graph Transcription : (7 +( (total_kms) * 2))
        // }else{
        //   this.selectedRow['attrWtg'] = data[0].attrWtg;
        // }

      }

   });
  }

  GetScreens(){
    this.Apiservice.get('Feedback/GetScreenList?workstream='+this.selectedRow['workstream']+'&service='+this.selectedRow['service']+'&batch='+this.selectedRow['batch']+'&step='+this.selectedstp).subscribe((data:any)=>{
      console.log('Screen Data-->',data);
      this.globalConst.checkOriginAccess(data);

      this.screenData=data;
   });
  }

  GetRange(){
    this.errorfeedback.range = '';
    this.Apiservice.get('Feedback/GetRangeList?workstream='+this.selectedRow['workstream']+'&service='+this.selectedRow['service']+'&batch='+this.selectedRow['batch']+'&screen='+this.errorfeedback.screenprt).subscribe((data:any)=>{
      console.log('Range data-->',data);
      this.globalConst.checkOriginAccess(data);
      this.rangeData=data;
   });
   console.log('Noof Rows 2',this.errorfeedback);
  }

  GetErrorDesc(){
    //alert('Checking..!');
    this.ErrorDescData = [];
    this.errorfeedback.errorDsp = '';
    this.errorfeedback.wtg = '';
    this.errorfeedback.actError = '';
    const typ = this.errorfeedback.range;
    const scren = this.errorfeedback.screenprt;
    //alert('Checking..! 2');
    this.Apiservice.get('Feedback/GetErrorDescList?workstream='+this.selectedRow['workstream']+'&service='+this.selectedRow['service']+'&batch='+this.selectedRow['batch']+'&step='+this.selectedstp+'&type='+typ+'&screen='+scren).subscribe((data:any)=>{
      console.log('Error Desp-->',data);
      this.globalConst.checkOriginAccess(data);

      //alert('Checking..! 3');
      if (data.length > 0) {
        this.erroDescData=data;
        //this.GetErrorWtg();
      }else{
        this.errorfeedback.wtg= "0";
      }
   });

   console.log('Noof Rows 3',this.errorfeedback);
  }

  GetErrorWtg() {
    let error_val = this.erroDescData.filter(data => data.errorDesc === this.errorfeedback.errorDsp);
    // this.Error_No = '1';
    console.log('errorNO', this.Error_No);
    // this.Apiservice.get('Feedback/GetErrorWtg?workstream='+ this.selectedRow['workstream'] + '&service=' +this.selectedRow['service']+ '&state=' + this.selectedRow['batch'] +
    // '&screen=' + this.errorfeedback[0].screenprt + '&type=' + this.errorfeedback[0].range + '&step=' +this.selectedstp +
    // '&errorNo=' + Number(this.Error_No)).subscribe((data: any) => {
    //   console.log('Error Desp-->', data);
    //   this.errorfeedback[0].wtg = "1";
    //   // if (data > 0) {
    //   //   this.errorfeedback[0].wtg = data.toString();
    //   // }
    //   // else { this.errorfeedback[0].wtg = "0"; }
    // });
  }


  seleErrorDesp(sel){
    //alert(sel);
    var ind = this.erroDescData.findIndex(x => x.error_desc == sel);

    this.errorfeedback.wtg = this.erroDescData[ind].weightage;
    // let subindex:number = eve.target["selectedIndex"] - 1;
    // //alert(this.erroDescData[subindex].weightage)
    // this.errorfeedback[ind].wtg = this.erroDescData[subindex].weightage.toString();
    // console.log('Selected '+ ind+ subindex);
  }

  //Remove Error
  removeRow(ind){
    console.log('Remove-->', ind);
    //delete this.errorfeedback[ind];
    this.listOfErrors.splice(ind,1);
    this.allErrorsDesp.splice(ind, 1);
    this.qualityPer = 100;
    var wtg = 0;
    let act_errorss = 0;
    var userId = localStorage.getItem('LoginId');
    var totErroWtgs = 0;

    this.listOfErrors.forEach(x => {
      wtg         = x.wtg;
      act_errorss = Number(act_errorss) + Number(x.actError);
      var totWtgs = (x.wtg * x.actError);
      totErroWtgs = Number(totErroWtgs) + Number(x.aerror);
      this.qualityPer = (1 - (totErroWtgs/parseFloat(this.selectedRow['attrWtg'])));
    });


    if(this.listOfErrors.length > 0){
      this.addErrors('R');
    }else{
      this.respArry['acceptance'] = (this.qualityPer >= 98.5 ? 'Accepted' : 'Rejected');
      this.respArry.feedbackList = this.listOfErrors;
    }
  }

  GetQualityPercentage(){
    let str: any;
    let str1: any;
    str = (this.errorfeedback.aerror) * 100;
    str1 = 100 - str;
    this.qualityPer = str1;
  }


  GetFeedBackGridData() {
    if(this.fromParent['rowdt']){
      this.selectedRow = this.fromParent['rowdt'];
      this.selectedInd = this.fromParent['rowind'];
      this.selectedstp = this.fromParent['rowstp'];
    }
    this.Apiservice.get('Feedback/GetFeedbackList?workstream=' + this.selectedRow['workstream'] + '&service=' + this.selectedRow['service'] + '&state=' + this.selectedRow['batch'] + '&step=' + this.selectedstp + '&map=' + this.selectedRow['map']).subscribe((data: any) => {
      console.log('GetFeedBackGridData -->', data);
      this.globalConst.checkOriginAccess(data);

      this.feedBackGridData = data;
    });
  }

  //Add Error
  addErrors(typ=''){
    if(typ == ''){

        const errorfb = {
          screenprt : this.errorfeedback.screenprt,
          range     : this.errorfeedback.range,
          errorDsp  : this.errorfeedback.errorDsp,
          wtg       : this.errorfeedback.wtg,
          actError  : this.errorfeedback.actError,
          aerror    : (this.errorfeedback.wtg * this.errorfeedback.actError)
        }

        this.listOfErrors.push(errorfb);
  }
    if(this.selectedRow['attrWtg'] == ''){
     // alert(this.selectedRow['attrWtg'])
      this.selectedRow['attrWtg'] = this.newAttrWtg;
    }
    //this.GetQualityPercentage();
    var wtg = 0;
    let act_errorss = 0;
    var userId = localStorage.getItem('LoginId');
    var totErroWtgs = 0;
    console.log(this.listOfErrors)
    this.listOfErrors.forEach(x => {
        wtg         = x.wtg;
        act_errorss = Number(act_errorss) + Number(x.actError);
        var totWtgs = (x.wtg * x.actError);
        totErroWtgs = Number(totErroWtgs) + Number(x.aerror);
        x.actErrors = act_errorss;
        x.agg_err_per = (100 - x.wtg).toString();
        x.acceptance = (x.qual_per > this.actualWtg ? 'Accepted' : 'Rejected');
        x.remarks   = this.remarkss;
        x.step      = this.selectedstp.toString();
        x.mode      = 'Add';
        x.workstream = this.selectedRow['workstream'].toString();
        x.service   = this.selectedRow['service'].toString();
        x.state     = this.selectedRow['batch'].toString();
        x.map       = this.selectedRow['mid'].toString();
        x.maptype   = this.selectedRow['map_type'].toString();
        x.doneby    = userId;
        x.feedbackTo = "";
        x.feedbackGL = "";
        x.feedbackTM = "";
        x.hostname   = "IHS";
        x.date       = "";
        x.wtg        = x.wtg.toString()
        var sp       = (1 - (Number(totErroWtgs)/parseFloat(this.selectedRow['attrWtg'])));
        var q1 = 100 - sp;
        x.qual_per  = q1;
    });


    this.qualityPer = (1 - (Number(totErroWtgs)/parseFloat(this.selectedRow['attrWtg'])));

    console.log('Selected Num -->', act_errorss)
    this.totErrorWtg = wtg;

    this.totErrorCnt = this.listOfErrors.length;
    // this.actualWtg = this.qcPercent;
    //this.qualityPer = this.qualityPer - act_errorss;
    if(this.listOfErrors.length > 0){
      //alert(totErroWtgs);
     // alert(this.selectedRow['attrWtg'])
    console.log('Step 1 -->', totErroWtgs);
    console.log('Step 1 -->', this.selectedRow['attrWtg']);

    var calC = (1 - (totErroWtgs / this.selectedRow['attrWtg']))
    //console.log('QC Per 1 -->', calC);

     var finaClc = (calC * 100);
     // alert(finaClc)
    // console.log('QC Per 2 Final -->', finaClc);

      this.qualityPer = Number(finaClc.toFixed(5));
    }else{
      this.qualityPer = 0;
    }


    this.respArry['acceptance'] = (this.qualityPer < this.actualWtg ? 'Rejected' : 'Accepted');


    this.respArry['ErrAttr']    = this.selectedRow['attrWtg'];
    this.respArry['actWtg']     = this.actualWtg;
    this.respArry['Qcpercent']  = this.qualityPer;
    this.respArry['totErros']   = totErroWtgs;

    this.respArry.feedbackList  = this.listOfErrors;

  }

  closeModal(bnttyp) {
    if(bnttyp == 'save'){
      this.respArry['errorRemarks'] = this.remarkss;
      var rslt = {
        postObj : this.respArry
      }
      console.log(rslt)
      this.activeModal.close(rslt);
    }else if(bnttyp == 'nofeedback'){
      this.respArry['errorRemarks'] = this.remarkss;
      var rslt = {
        postObj : this.respArry
      }
      this.activeModal.close(rslt);
    }else{
      this.activeModal.close('');
    }
  }



  // GetErrorValue() {
  //   //alert('Error Cal...')
  //   // let wtg: any = this.errorfeedback[0].wtg;
  //   // let act_errors: any = this.errorfeedback[0].acterror;
  //   // let result: any = wtg * act_errors;
  //   // this.errorfeedback[0].aerror= result.toString();
  //   this.GetQualityPercentage();
  //   this.qualityPer = 100;
  //   var wtg = 0;
  //   let act_errorss = 0;
  //   var userId = localStorage.getItem('LoginId');
  //   this.errorfeedback.forEach(x => {
  //       wtg = Number(wtg ) + Number(x.wtg);
  //       act_errorss = Number(act_errorss) + Number(x.actError);
  //       x.aerror = x.actError;
  //       x.actErrors = x.actError;
  //       x.qual_per = (100 - Number(x.actError)).toString();
  //       x.agg_err_per = (100 - x.wtg).toString();
  //       x.acceptance = (x.qual_per > x.agg_err_per ? 'Rejected' : 'Accepted');
  //       x.remarks = this.remarks;
  //       x.step = this.selectedstp.toString();
  //       x.mode = 'Add';
  //       x.workstream = this.selectedRow['workstream'].toString();
  //       x.service = this.selectedRow['service'].toString();
  //       x.state = this.selectedRow['batch'].toString();
  //       x.map = this.selectedRow['mid'].toString();
  //       x.maptype = '';
  //       x.doneby = userId;
  //       x.feedbackTo = "13";
  //       x.feedbackGL = "13";
  //       x.feedbackTM = "13";
  //       x.hostname = "IHS";
  //       x.date = "";
  //   });

  //   // for(var x=0;x< this.errorfeedback.length;x++){
  //   //     wtg = + this.errorfeedback[x]['wtg'];
  //   //     act_errorss =+ this.errorfeedback[x]['actError'];
  //   //     this.errorfeedback[x]['aerror'] =  this.errorfeedback[x]['actError'];
  //   // }

  //   console.log('Selected Num -->', act_errorss)
  //   this.totErrorWtg = wtg;
  //   this.actualWtg = 100 - wtg;
  //   this.totErrorCnt = this.errorfeedback.length;

  //   this.qualityPer = this.qualityPer - act_errorss;

  //   // this.respArry.totErrorCnt = this.totErrorCnt;
  //   // this.respArry.totalErrorWtg = this.totErrorWtg;
  //   // this.respArry.actualWtg = this.actualWtg;
  //   // this.respArry.agg_err_per = this.qualityPer;
  //   // this.respArry.status = (this.qualityPer >= this.actualWtg ? 'Accepted' : 'Rejected');
  //   // this.respArry.remarks = this.remarks;
  //   this.respArry['acceptance'] = (this.qualityPer >= this.actualWtg ? 'Accepted' : 'Rejected');
  //   this.respArry.feedbackList = this.errorfeedback;

  // }

}
