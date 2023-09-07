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
  selector: 'app-daily-log',
  templateUrl: './daily-log.component.html',
  styleUrls: ['./daily-log.component.scss']
})
export class DailyLogComponent implements OnInit {

  workstreamData: any; walotServices: any; walotBatches: any; selectedWrkStrm: any = '';
  walotRegions: any = ''; chkdata: any = []; n: number = 1; revdata: any = []; isShown: boolean = false; isUpalodShown: boolean = false;
  isDesShown: boolean = false; ipAddress:string;  

  //Excel Upload
  public reportData: any = [];
  public userSteps : any = [];
  public btnStatus = 'grid';
  public time_spent : any;
  public userRole = localStorage.getItem('Role');
  public receiveddt : any;
  public shipmentdt : any;
  public frmSubmit : any = false;
  public delivered : any = false;
  public step_delivered : any = true;
  public received : any = false;
  public timeentry : any = false;
  public pending : any = false;
  public mapsDt : any = [];
  public recordType = [
    {
      rtype : 'Delivered'
    },
    {
      rtype : 'Received'
   },
   {
    rtype : 'TimeEntry'
  },
   {
      rtype : 'Pending'
    }
  ]

  waSearchFm: FormGroup = new FormGroup({
    wsname: new FormControl(''),
    region: new FormControl(''),
    service: new FormControl(''),
    state: new FormControl(''),
    rtype: new FormControl(''),
    receivedfrmdt: new FormControl(''),
    receivedtodt: new FormControl(''),
    timeentryfrmdt: new FormControl(''),
    timeentrytodt: new FormControl(''),
    shipmentfrmdt: new FormControl(''),
    shipmenttodt: new FormControl(''),
    step: new FormControl(''),
  });

  submitted = false;

  constructor(public globalConst: GlobalConstants,private spinner: NgxSpinnerService, public router: Router, private Apiservice: ApiService, private fb: FormBuilder, private http: HttpClient) {

  }

  ngOnInit(): void {
    // this.getIP();
    this.spinner.show();
    var loginfo = localStorage.getItem('CorpId')

    if(loginfo == '' || loginfo == null || loginfo == 'null'){
      this.router.navigate(['/pages/login']);
    }

    this.selectedWrkStrm = localStorage.getItem('selectedWrkStrm');
    //console.log('Sel work strm --->', this.selectedWrkStrm)

    if(this.selectedWrkStrm == '' || this.selectedWrkStrm == null){
      this.swapAlerts('Please select Workstream.!')
    }

    this.GetWorkstream();
    this.waSearchFm = this.fb.group({
      wsname    : ['', Validators.required],
      region    : [''],
      service   : ['', Validators.required],
      state     : [''],
      map       : [''],
      rtype     : ['', Validators.required],
      receivedfrmdt: [''],
      receivedtodt: [''],
      shipmentfrmdt: [''],
      shipmenttodt: [''],
      timeentryfrmdt: [''],
      timeentrytodt: [''],
      step      :['']
    }
    );
    this.spinner.hide();
  }

  getIP()  
  {  
    this.Apiservice.getIPAddress().subscribe((res:any)=>{  
      this.ipAddress=res.ip;  
      console.log(res.ip)
    });  
  } 
  
 //Workstream
 GetWorkstream() {
  // this.workstreamData = JSON.parse(localStorage.getItem('WorkStreams'));;
   let id=localStorage.getItem('LoginId');
   this.Apiservice.get('WorkAllotment/GetWorkStream?id=' + id).subscribe((data: any) => {
       console.log(data);
       this.globalConst.checkOriginAccess(data);

       this.workstreamData = data;
   });
 }

  //Regions
  GetRegions(wrkstrm) {
    this.Apiservice.get('WorkAllotment/GetRegionList?wid=' + wrkstrm).subscribe((data: any) => {
      console.log('Regions-->', data);
      this.globalConst.checkOriginAccess(data);

      this.walotRegions = data;
    });
  }

  //Service List
  getServiceslist() {
    this.spinner.show();
    const walotwid = this.waSearchFm.get('wsname').value;
    this.frmSubmit = false;
    this.reportData = [];
    this.GetRegions(walotwid);
    this.Apiservice.get('WorkAllotment/GetAreaList?wid=' + walotwid).subscribe((data: any) => {
      console.log('Services-->', data);
      this.globalConst.checkOriginAccess(data);

      this.spinner.hide();
      this.walotServices = data;
    });
  }

  //Batches
  getBatches() {
    this.spinner.show();
    this.frmSubmit = false;
    this.reportData = [];
    const walotwid = this.waSearchFm.get('wsname').value;
    const walotsid = this.waSearchFm.get('service').value;
    this.Apiservice.get('WorkAllotment/GetBatchList?wid=' + walotwid + '&sid=' + walotsid).subscribe((data: any) => {
      console.log('Batches-->', data);
      this.globalConst.checkOriginAccess(data);

      this.spinner.hide();
      this.walotBatches = data;
      //this.getMaps();
      this.getSteps();
    });
  }

  //Get Steps
  getSteps(){
    this.spinner.show();
    this.userSteps = [];
    this.frmSubmit = false;
    this.reportData = [];
    const walotwid = this.waSearchFm.get('wsname').value;
    const walotsid = this.waSearchFm.get('service').value;
    this.Apiservice.get('WorkAllotment/GetUserwiseAccess?wid='+walotwid+'&sid='+walotsid).subscribe((data: any) => {
      console.log('Steps 2-->',data);
      this.globalConst.checkOriginAccess(data);

      this.userSteps = data;
      this.spinner.hide();
    });
   }

   //Getting maps
   getMaps(){
    var frmObj = this.waSearchFm.value;
    var wid = frmObj.wsname;var sid = frmObj.service;var ssid = frmObj.state;var stp = frmObj.step;
    this.frmSubmit = false;
    this.reportData = [];
    this.Apiservice.get('Reports/GetRecordList?workstream='+wid+'&service='+sid+'&state='+ssid).subscribe((data: any) => {
      console.log('Bulk List -->',data);
      this.globalConst.checkOriginAccess(data);

      this.mapsDt = data;
      this.spinner.hide();
    });
   }

   //Type change
   typeChange(typ){
      console.log("Type Test -->", typ);
      this.waSearchFm.controls['receivedfrmdt'].setValue('');
      this.waSearchFm.controls['receivedtodt'].setValue('');
      this.waSearchFm.controls['shipmentfrmdt'].setValue('');
      this.waSearchFm.controls['shipmenttodt'].setValue('');
      this.waSearchFm.controls['timeentryfrmdt'].setValue('');
      this.waSearchFm.controls['timeentrytodt'].setValue('');

      this.frmSubmit = false;
      this.received = false;
      this.timeentry = false;
      this.delivered = false;
      this.step_delivered = false;
      this.pending = false;
      this.reportData = [];

      if(typ == 'Received'){
        this.received = true;
      }else if(typ == 'Delivered'){
        this.delivered = true;
        this.step_delivered = false;
      }else if(typ == 'Pending'){
        this.pending = true;
      }else if(typ == 'TimeEntry'){
        this.timeentry = true;
      }
   }

  onSubmit() {
    //console.log("MIS");
    //this.spinner.show();

    var frmObj = this.waSearchFm.value;

    //console.log('Form Object-->', frmObj);
    let frmDate : any = '';
    let  toDate : any = '';

    if(this.delivered){
      if(frmObj.shipmentfrmdt != ''){
        var fdt = frmObj.shipmentfrmdt.year +'-'+ frmObj.shipmentfrmdt.month +'-'+ frmObj.shipmentfrmdt.day
        frmDate = new Date(fdt);
      }
      if(frmObj.shipmenttodt != ''){
        var tdt = frmObj.shipmenttodt.year +'-'+ frmObj.shipmenttodt.month +'-'+ frmObj.shipmenttodt.day
        toDate =  new Date(tdt);
      }
    }else if(this.received){
      if(frmObj.receivedfrmdt != ''){
        var fdt = frmObj.receivedfrmdt.year +'-'+ frmObj.receivedfrmdt.month +'-'+ frmObj.receivedfrmdt.day
        frmDate = new Date(fdt);
      }
      if(frmObj.receivedtodt != ''){
        var tdt = frmObj.receivedtodt.year +'-'+ frmObj.receivedtodt.month +'-'+ frmObj.receivedtodt.day
        toDate =  new Date(tdt);
      }
    }else if(this.timeentry){
      if(frmObj.timeentryfrmdt != ''){
        var fdt = frmObj.timeentryfrmdt.year +'-'+ frmObj.timeentryfrmdt.month +'-'+ frmObj.timeentryfrmdt.day
        frmDate = new Date(fdt);
      }
      if(frmObj.timeentrytodt != ''){
        var tdt = frmObj.timeentrytodt.year +'-'+ frmObj.timeentrytodt.month +'-'+ frmObj.timeentrytodt.day
        toDate =  new Date(tdt);
      }
    }

    var getMapsList = {
      'wsname'  : frmObj.wsname,
      'service' : frmObj.service,
      'state'   : frmObj.state,
      'map'     : frmObj.map,
      'mode'    : frmObj.rtype,
      'step'    : frmObj.step,
      'fromdate': (frmDate != '' ? this.formatDate2(frmDate) : ''),
      'todate'  : (toDate != '' ? this.formatDate2(toDate) : '')
    }

    console.log('Frm Values-->', getMapsList)
   if(this.pending == false){
    if((this.delivered == true && this.received == false && getMapsList.fromdate == '' || getMapsList.todate == '')) {
        this.swapAlerts('Please select from date and to date.!');
        this.spinner.hide();
        return false;
    }else if(this.received == true && this.delivered == false && getMapsList.fromdate == '' || getMapsList.todate == ''){
        this.swapAlerts('Please select from date and to date.!');
        this.spinner.hide();
        return false;
    }
  }

    var userId = localStorage.getItem('LoginId');
    this.Apiservice.get('Reports/GetDailylogList?workstream='+getMapsList.wsname+'&service='+getMapsList.service+'&state='+getMapsList.state+'&step='+getMapsList.step+'&fromdate='+getMapsList.fromdate+'&todate='+getMapsList.todate+'&mode='+getMapsList.mode+'&record='+getMapsList.map+'&loginId='+userId).subscribe((data: any) => {
        console.log('Delivery Report --->', data);
        this.globalConst.checkOriginAccess(data);

        this.reportData = data;
      //   this.reportData.forEach(e => {
      //     e.editabletime = false;
      // });
        this.frmSubmit = true;
        this.spinner.hide();
    },

    error => console.log('RespData--->', error));
  }


  changeToTime(inx,ele){
    // alert(inx)
    var role = localStorage.getItem('Role')
    if (role == "User" ) {
      Swal.fire({ text: "You are not authorized to edit the time", icon: 'warning' })
      return;
    }
    // console.log('I am double clicked...!', this.reportData)
    this.reportData[inx].editabletime = true;
    this.time_spent = this.reportData[inx].time_spent;
  }
  
  updateTime(ind,ele){
    console.log('Update Org...!', this.reportData[ind].time_spent);
    console.log('Update...!', this.reportData[ind].time_spent);
    this.reportData[ind].editabletime = false;
    if(this.reportData[ind].mapsData <= 0){
      Swal.fire({text: "Zero's or Negative values are Not Allowed.!",icon: 'error'});
      this.reportData[ind].time_spent  = this.time_spent;
      return false;
    }else if(this.reportData[ind].time_spent  == this.time_spent){
      return false;
    }else if(this.reportData[ind].time_spent == "" || this.reportData[ind].time_spent == null){
      this.reportData[ind].time_spent  = this.time_spent;
      return false;
    }else{
      this.spinner.show();
  
      const workstream = this.reportData[ind].workstream;
      const gkservcie = this.reportData[ind].service;
      const batch = this.reportData[ind].batch;
      const map = this.reportData[ind].map;
      const step = this.reportData[ind].step;
      const map_type = this.reportData[ind].map_type;
      const time_spent = this.reportData[ind].time_spent;
      const emp_id = this.reportData[ind].emp_id;
      const date = this.reportData[ind].date;
      const tid = this.reportData[ind].id;
      var userId = localStorage.getItem('LoginId');
      this.Apiservice.getMethod('Reports/UpdateTimeSpent?workstream='+workstream+'&gkservcie='+gkservcie+'&batch='+batch+'&step='+step+'&map='+map+'&map_type='+map_type+'&time_spent='+time_spent+'&emp_id='+emp_id+'&login_id='+userId+'&date='+date+'&tid='+tid).subscribe((data:any)=>{
        console.log('Time Edit entry Resp-->', data);
        this.globalConst.checkOriginAccess(data);
  
        if(data == '1'){
          //this.onSubmit();
          this.spinner.hide();
          Swal.fire({text: "Submited Successfullly!",icon: 'success'}).then(function() {
            //this.fileReset();
          });
          this.spinner.hide();
         // this.onSubmit();
        }else{
            this.spinner.hide();
            Swal.fire({text: "Insertion Failed!",icon: 'error'});
        }
    });
    }
  
  }


  formatDate2(date) {
    var year = date.getFullYear().toString();
    var month = (date.getMonth() + 101).toString().substring(1);
    var day = (date.getDate() + 100).toString().substring(1);
    return year + "-" + month + "-" + day;
}

   //Format Date
   formatDate(date) {
    console.log('Dt--.', date.toJSON().slice(0,10))
    var d = new Date(date),
        month = '' + (d.getMonth()),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
  }

  toggleDesShow() {
    this.isDesShown = !this.isDesShown;
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


   //Date Pickers
   dateInputFun(typ){
    console.log('Check dt -->', this.waSearchFm.get('receivedfrmdt').value)
     if(typ == 'receivedfrom'){
       if(this.waSearchFm.get('receivedfrmdt').value == '' || this.waSearchFm.get('receivedfrmdt').value == null){
          this.waSearchFm.controls['receivedfrmdt'].setValue('');
       }
      }else  if(typ == 'receivedto'){
        if(this.waSearchFm.get('receivedtodt').value == '' || this.waSearchFm.get('receivedtodt').value == null){
          this.waSearchFm.controls['receivedtodt'].setValue('');
        }
      }else  if(typ == 'shipmentfrom'){
        if(this.waSearchFm.get('shipmentfrmdt').value == '' || this.waSearchFm.get('shipmentfrmdt').value == null){
          this.waSearchFm.controls['shipmentfrmdt'].setValue('');
        }
      }else  if(typ == 'shipmentto'){
        if(this.waSearchFm.get('shipmenttodt').value == '' || this.waSearchFm.get('shipmenttodt').value == null){
          this.waSearchFm.controls['shipmenttodt'].setValue('');
        }
      }else  if(typ == 'timeentryfrom'){
        if(this.waSearchFm.get('timeentryfrmdt').value == '' || this.waSearchFm.get('timeentryfrmdt').value == null){
          this.waSearchFm.controls['timeentryfrmdt'].setValue('');
        }
      }else  if(typ == 'timeentryto'){
        if(this.waSearchFm.get('timeentrytodt').value == '' || this.waSearchFm.get('timeentrytodt').value == null){
          this.waSearchFm.controls['timeentrytodt'].setValue('');
        }
      }
   }


    //Excel Export
    exportexcel(): void
    {
      let element = document.getElementById('excel-table');
      const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

      /* save to file */
      XLSX.writeFile(wb, 'DailyLogReport.xlsx');
    }
}
