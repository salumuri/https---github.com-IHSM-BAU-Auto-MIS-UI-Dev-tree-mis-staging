import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { ApiService } from 'app/Api/api.service';
import { GlobalConstants } from 'app/common/global-constants';
import * as defaults from 'environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { saveAs } from 'file-saver';
@Component({
  selector: 'app-sla-tracker',
  templateUrl: './sla-tracker.component.html',
  styleUrls: ['./sla-tracker.component.scss']
})
export class SLATrackerComponent implements OnInit {

  constructor(public globalConst: GlobalConstants, private spinner: NgxSpinnerService, public router: Router, private Apiservice: ApiService, private fb: FormBuilder, private http: HttpClient) {

  }
  SearchFm: FormGroup = new FormGroup({
    yearName: new FormControl('', Validators.required),
    QName: new FormControl('', Validators.required),
    Mname: new FormControl('', Validators.required),
    wname: new FormControl('', Validators.required)
  });
  yearinfo: any = '';
  monthinfo: any = '';
  workstreamData: any = '';
  logInfo: any = '';
  reportData: any = [];
  utype: any = false;
  sPerfrmance:any;
  finaldata : any = [];
  chkClient: any=false;logCorpId:any='';logName:any='';myServiceName:any='';

  ngOnInit(): void {
    this.spinner.show();
    this.utype = localStorage.getItem('UserType');
    if (this.utype == 'client') {
      this.chkClient = true
    }
    else {
      this.chkClient = false
    }

     this.logCorpId = localStorage.getItem('CorpId')
     this.logName=localStorage.getItem('Name')

    if (this.logCorpId == '' || this.logCorpId == null || this.logCorpId == 'null') {
      this.router.navigate(['/pages/login']);
    }
    this.yearData();

    this.spinner.hide();
  }

  yearData() {
    this.restForm();
    this.Apiservice.get('Client_Dashboard/GetSLAYears').subscribe((data: any) => {
      this.yearinfo = data;
      console.log('My Response--->', this.yearinfo);
      console.log('Response--->', data);
    });
  }
  yearChange() {
    this.SearchFm.reset({
      yearName: this.SearchFm.get('yearName').value,
      QName: '',
      Mname: '',
      wname: ''
    });
  }
  monthData() {
    this.SearchFm.reset({
      yearName: this.SearchFm.get('yearName').value,
      QName: this.SearchFm.get('QName').value,
      Mname: '',
      wname: ''
    });

    if (this.SearchFm.get('yearName').value != '') {
      this.Apiservice.get('Client_Dashboard/GetIHSD_getMonth_Quater?quater=' + this.SearchFm.get('QName').value).subscribe((data: any) => {
        console.log('Demand Supply --->', data);
        this.globalConst.checkOriginAccess(data);
        this.monthinfo = data;
        //this.frmSubmit = true;
        //this.spinner.hide();

      });
    }

  }
  GetWorkstream() {

    this.SearchFm.reset({
      yearName: this.SearchFm.get('yearName').value,
      QName: this.SearchFm.get('QName').value,
      Mname: this.SearchFm.get('Mname').value,
      wname: ''
    });


    if (this.utype == 'client') {
      this.logInfo = JSON.parse(localStorage.getItem('UserCientInfo'));
      this.Apiservice.get('WorkAllotment/GetWorkStreamClient?wid=' + this.logInfo.id).subscribe((data: any) => {
        console.log('client work streams-->', data);
        this.workstreamData = data;
      });
    }
    else {
      this.Apiservice.get('Client_Dashboard/GetIHSD_Workstrems').subscribe((data: any) => {
        console.log('work strams-->', data);
        this.workstreamData = data;
      });
    }

  }
  onSubmit() {
    console.log("MIS");
    const _yName = this.SearchFm.get('yearName').value;
    const _quarter = this.SearchFm.get('QName').value;
    const _mName = this.SearchFm.get('Mname').value;
    const _wname = this.SearchFm.get('wname').value;
    const uName = localStorage.getItem('Name')
    const uCorpId = localStorage.getItem('CorpId')

    this.Apiservice.get('Client_Dashboard/GetSLAdata?_year=' + _yName + '&_quarter=' + _quarter + '&_employename=' + uName + '&_empnumber=' + uCorpId + '&_monthn=' + _mName + '&_worksteam=' + _wname + '').subscribe((data: any) => {
      console.log('SLA Report --->', data);
      this.globalConst.checkOriginAccess(data);

      this.reportData = data;
      this.spinner.hide();

    });

  };

  saveSlaData()  {
    console.log('Save button click');
    var finalObj:any='';
    this.finaldata=[];
    this.reportData.forEach(x => {
      if((x.fvalue=='' || x.fvalue==null) && (x.remarks=='' || x.remarks==null)){
        Swal.fire({ text: "Remarks must be entered when Performance is empty.", icon: 'warning' })
        return;
      }
    });
    console.log('SLA updated data--->',this.reportData);

       
   if(this.reportData.length>0)
   {  
    
    for(let s=0; s<=this.reportData.length;s++)
      {
        var objData:any='';
        if (this.utype == 'client') {
          // client comments
          this.myServiceName='Client_Dashboard/SLAperformanceBulk_SMEComments';
           objData={
            'sla_id':this.reportData[s]?.['sla_id'],
            'temp_id':this.reportData[s]?.['temp_id'],
            'ihssmereview':this.reportData[s]?.['ihssme'],
            
          }
          this.finaldata.push(objData);
        }
        else{
          // cyient performance , remarks
          this.myServiceName='Client_Dashboard/SLAperformanceBulk';
           objData={
            'sla_id':this.reportData[s]?.['sla_id'],
            'temp_id':this.reportData[s]?.['temp_id'],
            'revno':this.reportData[s]?.['revno'],
            'fvalue':this.reportData[s]?.['fvalue'],
            'fvalueext':this.reportData[s]?.['fvalueext'],
            'remarks':this.reportData[s]?.['remarks']
          }
          this.finaldata.push(objData);
        }
        
      }

      finalObj = {
        'finalSlaList'  : this.finaldata,
        'empid'         : this.logCorpId,
        'empname'       : this.logName
      }

   }
   
    this.Apiservice.postmethod(this.myServiceName,finalObj).subscribe((data: any) => {
      console.log('Updated data from SLA Tracker --->', data);
      

      if(data == null || data == 'null'){
        this.spinner.hide();
        //this.resetAll();
        Swal.fire({text: "Updation Failed!",icon: 'error'});
      }
      else{
        Swal.fire({text: "Data saved successfully.",icon: 'success'});
        this.onSubmit();       
      }
       

    });

  }
  restForm() {
    this.SearchFm.reset({
      yearName: '',
      QName: '',
      Mname: '',
      wname: ''
    });
  }

}
