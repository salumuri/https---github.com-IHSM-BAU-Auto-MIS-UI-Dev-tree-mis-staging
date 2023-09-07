import { NgModule, Component, OnInit, ViewEncapsulation, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as XLSX from 'xlsx';
import { ApiService } from '../../Api/api.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { GlobalConstants } from '../../common/global-constants';

@Component({
  selector: 'app-patr-entry',
  templateUrl: './patr-entry.component.html',
  styleUrls: ['./patr-entry.component.scss']
})
export class PatrEntryComponent implements OnInit {
  workstreamData : any = []; walotServices : any = []; userSteps : any = []; employeesList : any = [];
  logId = localStorage.getItem('LoginId');
  waSearchFm: FormGroup = new FormGroup({
    empId :  new FormControl(''),
    wsname: new FormControl(''),
    service: new FormControl(''),
    step: new FormControl(''),
    recdate: new FormControl(''),
    renarks : new FormControl('')
  });
  constructor(public globalConst: GlobalConstants,private spinner: NgxSpinnerService, public router: Router, private Apiservice: ApiService, private fb: FormBuilder, private http: HttpClient) {

  }

  ngOnInit(): void {
    this.waSearchFm = this.fb.group({
      empId : ['', Validators.required],
      wsname: ['', Validators.required],
      service: ['', Validators.required],
      step : ['', Validators.required],
      recdate: [''],
      remarks : ['']
    });

    this.GetWorkstream();
    this.getEmployeesUnderManager();
  }


  //Get Workstream
  GetWorkstream() {
    this.Apiservice.get('WorkAllotment/GetWorkStream?id=' + this.logId).subscribe((data: any) => {
        //console.log(data);
        this.globalConst.checkOriginAccess(data);
        this.workstreamData = data;
    });
  }

  getEmployeesUnderManager(){
    let id=this.logId;
    this.Apiservice.get('WorkAllotment/GetEmployeesUnderManager?uid=3153').subscribe((data: any) => {
        console.log('User Info -->',data);
        this.globalConst.checkOriginAccess(data);
        this.employeesList = data;
    });
  }

  //Get Service List
  getServiceslist() {
    this.spinner.show();
    const walotwid = this.waSearchFm.get('wsname').value;
    this.Apiservice.get('WorkAllotment/GetAreaList?wid=' + walotwid).subscribe((data: any) => {
      console.log('Services-->', data);
      this.globalConst.checkOriginAccess(data);
      this.walotServices = data;
      this.spinner.hide();
    });
    this.spinner.hide();
  }

    //Get Steps
    getSteps(){
      this.spinner.show();
      this.userSteps = [];
      const walotwid = this.waSearchFm.get('wsname').value;
      const walotsid = this.waSearchFm.get('service').value;
      this.Apiservice.get('WorkAllotment/GetUserwiseAccess?wid='+walotwid+'&sid='+walotsid).subscribe((data: any) => {
        console.log('Steps 2-->',data);
        this.userSteps = data;
        this.spinner.hide();
      });
    }

  //On Submit
  onSubmit(){
    var frmObj = this.waSearchFm.value;
    console.log('Form Values 1 -->', frmObj);
    var gdt = this.waSearchFm.value.recdate;
    var fdt = gdt.year +'-'+ gdt.month +'-'+ gdt.day;
    frmObj.recdate = fdt;
    frmObj.wsname = parseInt(frmObj.wsname);
    frmObj.step = parseInt(frmObj.step);
    frmObj.service = parseInt(frmObj.service);
    frmObj.empId = parseInt(frmObj.empId);
    frmObj.userid = parseInt(this.logId);
    console.log('Form Values 2 -->', frmObj);
    this.Apiservice.postmethod('WorkAllotment/postPatrData', frmObj).subscribe((data:any)=>{
      console.log('Part Response-->', data);
      if(data == 1){
        Swal.fire({text: "Submited Successfullly!",icon: 'success'}).then(function() {
          //this.fileReset();
        });
        this.resetAll();
      }
    });
  }

  resetAll(){

    this.waSearchFm.patchValue({empId: ''});
    this.waSearchFm.patchValue({wsname: ''});
    this.waSearchFm.patchValue({service: ''});
    this.waSearchFm.patchValue({step: ''});
    this.waSearchFm.patchValue({recdate : ''});
    this.waSearchFm.patchValue({remarks : ''});
  }
}
