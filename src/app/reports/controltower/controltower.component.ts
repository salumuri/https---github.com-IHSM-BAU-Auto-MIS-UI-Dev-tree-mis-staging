import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { ApiService } from '../../Api/api.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { GlobalConstants } from '../../common/global-constants';

@Component({
  selector: 'app-controltower',
  templateUrl: './controltower.component.html',
  styleUrls: ['./controltower.component.scss']
})
export class ControltowerComponent implements OnInit {
  monthsflow = [];
  public recordType = [
    {
      rtype : 'E3'
    },
    {
      rtype : 'MIS'
   }
  ]
  public finance = [
    {
      ftype : '2022-2023'
    },
    {
      ftype : '2023-2024'
   },
   {
    ftype : '2024-2025'
 }
  ]

  workstreamData: any;
  tableshow:boolean=true;
  waSearchFm: FormGroup = new FormGroup({
    wsname: new FormControl(''),
    service: new FormControl(''),
    manager:new FormControl(''),
    financeyear:new FormControl(''),
    teamlead:new FormControl(''),
    rtype: new FormControl(''),
  });
  selectedWrkStrm: string;
  walotServices: any;
  walotBatches: any;
  walotManagers: any;
  selectedWorkStream: any;
  e3:any;
  e3Project: any;
  selectedWork: AbstractControl;
  walotTeamLeaders: any;
  workstreamOwner: string;
  monthYearObj = [];
  controTower : any = [];
  q1 :  any = 0;
  qtype : any = 'Q'
  constructor(public globalConst: GlobalConstants,private spinner: NgxSpinnerService, public router: Router, private Apiservice: ApiService, private fb: FormBuilder, private http: HttpClient) { }

  ngOnInit(): void {
    this.spinner.show();
    this.GetWorkstream();
    this.waSearchFm = this.fb.group({
      wsname: [''],
      service: [''],
      manager:[''],
      teamlead:[''],
      rtype : [''],
      financeyear : ['']
    }
    );
    this.getControlTowerData();
    this.spinner.hide();
  }

  //Getting Control Tower Getdata
  getControlTowerData(){
    var workstream = '2';
    var finYear = '2022-2023'
    this.Apiservice.get('ControlTower/GetControl_Tower_Getdata?wid=' + workstream + '&Fin_year='+finYear).subscribe((data: any) => {
      //console.log('Resp Data-->', data);
      this.globalConst.checkOriginAccess(data);

      var myobj = data;
      //myobj.sort((a, b) => this.monthsflow.indexOf(a) - this.monthsflow.indexOf(b));

      var result = [];
      this.monthsflow.forEach((x,ind) => {
          var myind = myobj.findIndex((y,ind2) => y.monthc == x);
          //console.log('Ind -->',myind)
          result.push(myobj[myind]);
      });

      this.controTower = result;
      // console.log('Filter obj 1-->', myobj);
       console.log('Filter obj 2-->', result);
       this.getQ1Avg();
    });
  }


  //Select Fin Year
  onItemChange(value:any){
    console.log(" Value is : ", value );
    //var months = ['January', 'February','March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var date = new Date();

    var myary = [];
    var endYr = value.split('-');
    for(var x=3;x<=14;x++){
      var dt = date.setMonth(x);
      let dt2 =  new Date(dt);
      //console.log('Fin Result 1-->', dt2)

      if(x > 11){
        var finalResult = months[dt2.getMonth()] + '-' + endYr[1];
      }else{
        var finalResult = months[dt2.getMonth()] + '-' + endYr[0];
      }
      myary.push(finalResult)
    }

    this.monthsflow = myary;
    //console.log('Fin Result 2-->', myary)

  }


  getQ1Avg(){
    //this.controTower.reduce
   // alert("Hell Q1")
    if(this.controTower > 0){
      let sum = this.controTower.reduce(function(a, b){
        return a.CFB_Score_no + b.CFB_Score_no;
      });

      this.q1= sum;

    }else{
      this.q1= 0;
    }

  }

  getTrue(ind){
      if(ind == 0 || ind == 3 || ind == 6 || ind == 9){
        this.qtype = 'Q'+ind;
        return 3;
      }else{
        return '';
      }
  }

  getTrue2(ind){
    if(ind == 0 || ind == 3 || ind == 6 || ind == 9){
      return true;
    }else{
      return false;
    }
}

 //Getting workstreams
  GetWorkstream() {
    // this.Apiservice.get('Tower/GetWrokstream?').subscribe((data: any) => {
    //   console.log('WorkStream-->', data);
    //   this.spinner.hide();
    //   this.workstreamData=data;
    // });

    let id=localStorage.getItem('LoginId');
    this.Apiservice.get('WorkAllotment/GetWorkStream?id=' + id).subscribe((data: any) => {
      console.log(data);
      this.globalConst.checkOriginAccess(data);

      this.workstreamData = data;
    });

  }

  //Getting services
  getServiceslist() {
    this.spinner.show();
    const walotwid = this.waSearchFm.get('wsname').value;
    this.getE3Project();
    this.getManagers();
    this.getTeamLead();
    if(walotwid == 1){
      this.selectedWorkStream = 'Automotive';
      this.workstreamOwner = 'Karthi K';
    }
    else if(walotwid == 2){
      this.selectedWorkStream = 'Canada';
      this.workstreamOwner = 'Y.Vivek Kumar';
    }
    else if(walotwid == 3){
      this.selectedWorkStream = 'CARFAX';
      this.workstreamOwner = 'N.Ranga Raju';
    }
    else if(walotwid == 4){
      this.selectedWorkStream = 'Energy Logs';
      this.workstreamOwner = 'Karthi K';
    }
    else if(walotwid == 5){
      this.selectedWorkStream = 'Energy Midstream';
      this.workstreamOwner = 'Y.Vivek Kumar';
    }
    else if(walotwid == 6){
      this.selectedWorkStream = 'IHS Chemicals';
      this.workstreamOwner = 'Y.Vivek Kumar';
    }
    else if(walotwid == 7){
      this.selectedWorkStream = 'Management';
    }
    else if(walotwid == 8){
      this.selectedWorkStream = 'Premier Geo';
      this.workstreamOwner = 'Karthi K';
    }
    else if(walotwid == 9){
      this.selectedWorkStream = 'US Energy Production';
      this.workstreamOwner = 'N.Ranga Raju';
    }
    else if(walotwid == 10){
      this.selectedWorkStream = 'US Wells';
      this.workstreamOwner = 'Y.Vivek Kumar';
    }
    else if(walotwid == 12){
      this.getOverall();
    }
    this.Apiservice.get('WorkAllotment/GetAreaList?wid=' + walotwid).subscribe((data: any) => {
      console.log('Services-->', data);
      this.globalConst.checkOriginAccess(data);

      this.spinner.hide();
      this.walotServices = data;

    });
    this.walotServices=[];
    this.walotManagers=[];
    this.walotTeamLeaders =[];
  }


  getE3Project(){
    this.spinner.show();
    const walotwid = this.waSearchFm.get('wsname').value;
    this.Apiservice.get('Tower/GetE3?wid=' + walotwid).subscribe((data: any) => {
      console.log('E3Project-->', data);
      this.globalConst.checkOriginAccess(data);

      this.spinner.hide();
      this.e3=data;
      this.e3Project = data[0].project_code;
      console.log('projectCode-->',this.e3Project)
    });
  }

  getManagers(){
    this.spinner.show();
    const walotwid = this.waSearchFm.get('wsname').value;
    const walotsid = this.waSearchFm.get('service').value;
    this.getTeamLead();
    if(walotsid != '' || walotsid != ''){
    this.Apiservice.get('Tower/GetManagerList?wid=' + walotwid + '&sid=' + walotsid).subscribe((data: any) => {
      console.log('Managers-->', data);
      this.globalConst.checkOriginAccess(data);

      this.spinner.hide();
      this.walotManagers = data;

    });
    this.walotManagers=[];
    this.walotTeamLeaders =[];
  }
  else{
    this.Apiservice.get('Tower/GetManagerList?wid=' + walotwid + '&sid=' + 'bt').subscribe((data: any) => {
      console.log('Managers-->', data);
      this.globalConst.checkOriginAccess(data);

      this.spinner.hide();
      this.walotManagers = data;
    });
    this.walotManagers=[];
    this.walotTeamLeaders =[];
  }
  }


  onChangeTeamLead(){

  }


  getTeamLead(){
    this.spinner.show();
    const walotwid = this.waSearchFm.get('wsname').value;
    const walotsid = this.waSearchFm.get('service').value;
    const walotmanager = this.waSearchFm.get('manager').value;
    console.log('Manager=',walotmanager);
    if(walotsid != '' && walotsid != '' && walotmanager != ''){
    this.Apiservice.get('Tower/GetTeamLeaderList?wid=' + walotwid + '&sid=' + walotsid + '&emp_id=' + walotmanager ).subscribe((data: any) => {
      console.log('TeamLeaders-->', data);
      this.globalConst.checkOriginAccess(data);

      this.spinner.hide();
      this.walotTeamLeaders = data;
    });
    this.walotTeamLeaders =[];
  }
  else if( walotsid == '' && walotmanager != ''){
    this.Apiservice.get('Tower/GetTeamLeaderList?wid=' + walotwid + '&sid=' + 'bt' + '&emp_id=' + walotmanager ).subscribe((data: any) => {
      console.log('TeamLeaders-->', data);
      this.globalConst.checkOriginAccess(data);

      this.spinner.hide();
      this.walotTeamLeaders = data;
    });
    this.walotTeamLeaders =[];
  }
  else{
    this.Apiservice.get('Tower/GetTeamLeaderList?wid=' + walotwid + '&sid='+'bt'+  '&emp_id=' + 'bt' ).subscribe((data: any) => {
      console.log('TeamLeaders-->', data);
      this.globalConst.checkOriginAccess(data);

      this.spinner.hide();
      this.walotTeamLeaders = data;
    });
    this.walotTeamLeaders =[];
  }
  }


  swapAlerts(msg){
    return Swal.fire({
       icon: 'error',title: 'Oops...',text: msg,
       customClass: {
         confirmButton: 'btn btn-danger'
       },
       buttonsStyling: false
     }).then(function() {
       return false;
     });
   }

   getOverall(){
    Swal.fire({text:"OK"});
   }


   onSubmit(){

   }
}
