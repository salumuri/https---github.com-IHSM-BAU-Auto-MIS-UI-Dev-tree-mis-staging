import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators , FormControl} from '@angular/forms';
import { ApiService } from '../../Api/api.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { $ } from 'protractor';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import * as XLSX from 'xlsx';
import { GlobalConstants } from '../../common/global-constants';


@Component({
  selector: 'app-attendance-report',
  templateUrl: './attendance-report.component.html',
  styleUrls: ['./attendance-report.component.scss']
})
export class AttendanceReportComponent implements OnInit {
  isShown: boolean = false;
  isShownn: boolean = true;
  monthData: any;
  workstreamData: any;
  attendReport : any = [];
  daysRows : any;
  submitAction : any = false;
  thismonth : any;
  glNamesData: any = [];

  generateFm: FormGroup = new FormGroup({
    accMonth: new FormControl(''),
    wsname: new FormControl(''),
   glname: new FormControl(''),
    // service: new FormControl(''),
    // state: new FormControl(''),
    // recdate: new FormControl(''),
  });
  constructor(public globalConst: GlobalConstants,private spinner: NgxSpinnerService,private fb: FormBuilder, private Apiservice: ApiService, private router: Router, private datepipe: DatePipe) { }

  ngOnInit(): void {

    let cdate = new Date();
    let year = cdate.getFullYear();
    var month = (cdate.getMonth() + 1).toString();

    if(month.length == 1){
      month = '0'+month
    }

    var mydt = (year+'-'+month).toString();
    this.thismonth = mydt;

    this.generateFm = this.fb.group({
      monthyear: [mydt, Validators.required],
      wsname: ['', Validators.required],
      glname: ['']
    });

    this.GetWorkstream();
   
    //this.getAttendReport();
  }
  getStatus(da){
  
    if(da == 40)
      return 'Full Day'
    else if(da == 41)
    return 'Absent'
    else if(da == 42)
    return 'Half Day'
    else if(da == 50 || da == undefined || da == null || da == '' || da == 'null')
    return 'Total'
    else
    return da

  }
 //GL Name
 GetGLNames(wd) {
  this.generateFm.patchValue({'glname': ''});
  // this.workstreamData = JSON.parse(localStorage.getItem('WorkStreams'));;
  var frmObj = this.generateFm.value;
  console.log(frmObj)
   let id=localStorage.getItem('LoginId');
   this.Apiservice.get('Reports/GetGLList?wid=' + frmObj.wsname).subscribe((data: any) => {
       console.log(data);
       this.globalConst.checkOriginAccess(data);
   
       this.glNamesData = data;
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
       //this.GetGLNames();
   });
 }


  onSubmit(){
    var frmObj = this.generateFm.value;
    console.log('Selected Date',frmObj)
    var dt = frmObj.monthyear;
    dt = dt.split("-");
    const yer = dt[0];
    var mnth = dt[1];
    mnth = this.getMonthName(mnth);
    this.submitAction = true;
    this.getAttendReport(mnth,yer,frmObj.wsname,frmObj.glname);
  }

  pickDate(ev){
    this.thismonth = ev.target.value;
    this.generateFm.controls['monthyear'].setValue(ev.target.value);
  }

  getMonthName(monthNumber) {
    const date = new Date();
    date.setMonth(monthNumber - 1);

    return date.toLocaleString('en-US', { month: 'long' });
  }
  getatdStatus(tme){
    if(tme >= 9.0)
    return tme;
    else if(tme == 'P/2-4.5')
    return 'HA'
    else if(tme == null || tme == undefined || tme >= 0)
    return tme
    else if(tme == 'AdvCompOff')
    return 'ACO'
    else if(tme == 'CompOff')
    return 'CO'
    else if(tme == 'Informed-8.5' ||'Informed-9.0' || tme == 'Informed-8.5' || tme == 'Informed'||  tme == 'Informed-Leave' ||  tme == 'NotInformed-Leave' || tme == undefined)
    return 'A'
    else if(tme < 9.0 && tme != 4.5)
    return tme
    else if(tme == 'ESI Leave')
    return 'ESI'
    // if(tme >= 9.0)
    //   return tme;
    //   else if(tme == 4.5)
    //   return 'HA'
    //   else if(tme == null || tme == undefined || tme == 0)
    //   return 'A'
    //   else if(tme < 9.0 && tme != 4.5)
    //   return tme
    //   else if(tme == 'Informed-9.0')
    //   return 9.0
    //   else if(tme == 'ESI Leave')
    //   return 'ESI'

  }
  getColor(hr){

    if(hr >= 9.0)
    return 'green'
    else if(hr < 9.0 && hr != null && hr != 0 && hr != undefined && hr != 4.5)
    return '#0000ff'
     else if(hr == 4.5 || hr == null || hr == 0 || hr == undefined ||hr =='Informed-9.0' || hr =='P/2-4.5'|| hr =='A'|| hr =='CO'|| hr =='ACO'|| hr =='HA' || hr == 'CompOff'||hr == 'Informed-8.5' ||'Informed-9.0' || hr == 'Informed-8.5' || hr == 'Informed'||  hr == 'Informed-Leave' ||  hr == 'NotInformed-Leave' || hr == undefined)
     return 'red'  

     else if (hr == 'AdvCompOff')

     return 'blue'

     else if(hr == 'ESI Leave')

     return 'DarkRed'

    }
  // getColor(hr){
  //   //console.log(hr)
  //   if(hr >= 9.0)
  //   return 'green'
  //   else if(hr < 9.0 && hr != null && hr != 0 && hr != undefined && hr != 4.5)
  //     return '#0000ff'
  //    else if(hr == 4.5 || hr == null || hr == 0 || hr == undefined)
  //    return 'red'   
  //    else if(hr == 'ESI Leave')
  //    return 'DarkRed'
  //   }
  getAttendReport(mnth,yer,wm,gl){
    
    this.spinner.show();
    this.attendReport = [];
    this.Apiservice.get('Reports/GetAttendReport?month='+mnth+'&year='+yer+'&ws='+wm+'&gl='+gl).subscribe((data: any) => {
      console.log('Attend Report --->', data);
      this.globalConst.checkOriginAccess(data);

      if(data.length > 0){
        this.attendReport = data[0]['jsonResp'];
        console.log(this.attendReport)
        let softHeaders = Object.keys(this.attendReport[0]);
        let elemsToDelete = 4;
        console.log('ArryLength --->', softHeaders);
          //console.log('ArryLength --->', softHeaders.length);
          softHeaders.splice(softHeaders.length - 3,3);
          this.daysRows = softHeaders;
          console.log('ArryLength --->', softHeaders);
          this.spinner.hide();
      }else{
          this.spinner.hide();
      }

    },error => {
      this.spinner.hide()
      //console.log('RespData--->', error)
    });
  }



    //Excel Export
    exportexcel(): void
    {
      let element = document.getElementById('excel-table');
      const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

      /* save to file */
      XLSX.writeFile(wb, 'AttendanceReportExcel.xlsx');
    }
}
