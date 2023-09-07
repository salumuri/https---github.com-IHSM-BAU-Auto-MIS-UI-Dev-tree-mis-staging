import { Component, OnInit } from '@angular/core';
import { GlobalConstants } from 'app/common/global-constants';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { ApiService } from 'app/Api/api.service';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { saveAs } from 'file-saver';
import { NgbModal, ModalDismissReasons, NgbActiveModal, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { AttendancemodalComponent } from 'app/modals/attendancemodal/attendancemodal.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { HttpClientModule } from '@angular/common/http';
import { Alert } from 'selenium-webdriver';
import { formatDate } from '@angular/common';
@Component({
  selector: 'app-attendance-management',
  templateUrl: './attendance-management.component.html',
  styleUrls: ['./attendance-management.component.scss']
})
export class AttendanceManagementComponent implements OnInit {

  constructor(public globalConst: GlobalConstants, private spinner: NgxSpinnerService, public router: Router, private Apiservice: ApiService, private fb: FormBuilder, private http: HttpClient, private modalService: NgbModal) { }

  //minDate: any = new Date().toISOString().slice(0, 10);
  NotEnteredData: any = []; EnteredData: any = [];
  workstreamData: any = '';
  sWSName = '';
  page1: any = 1; page: any = 1;
  public frmSubmit: any = false;
  public isChecked = false;
  sDate=new Date();
  selectedDateValue = new NgbDate(
    this.sDate.getFullYear(),
    this.sDate.getMonth() + 1,
    this.sDate.getDate()
 );

  waSearchFm: FormGroup = new
    FormGroup({
      fromdt: new FormControl(),
      wname: new FormControl('', Validators.required)

    });

  ngOnInit(): void {
    var loginfo = localStorage.getItem('CorpId')
    if (loginfo == '' || loginfo == null || loginfo == 'null') {
      this.router.navigate(['/pages/login']);
    }

    this.getWorkstream()
  }

  onSubmit() {
    
    this.NotEnteredData = [];
    this.EnteredData = [];
    const wsName = this.waSearchFm.get('wname').value;
    var gdt = this.waSearchFm.value.fromdt;
    if (wsName == '' || gdt == null || gdt == '') {
      Swal.fire({ text: "Please select Date & WorkStream", icon: 'warning' })
      return;
    }
    var fdt = gdt.year + '-' + gdt.month + '-' + gdt.day;

    this.spinner.show();
    if (fdt != '' && wsName != '') {
      this.http.get('https://techdataportals.cyient.com/mis-stagingapi/api/AttendanceManagement/GetNotentered?workstream=' + wsName + '&date=' + fdt + '').subscribe((data: any) => {
        this.NotEnteredData = data;
      });
      this.http.get('https://techdataportals.cyient.com/mis-stagingapi/api/AttendanceManagement/Getentered?workstream=' + wsName + '&date=' + fdt + '&lesstimesheet=' + this.isChecked + '').subscribe((data: any) => {
        this.EnteredData = data;
        this.spinner.hide();

      });
    }

    this.frmSubmit = true;
    
  }

  getWorkstream() {
    this.Apiservice.get('AttendanceManagement/GetActiveWorkstreams').subscribe((data: any) => {
      this.workstreamData = data;
    });
  }
  toggleEditable(event) {

    if (event.target.checked) {
      this.isChecked = true;
    }
    this.onSubmit();


  }
  openPopup(val: any,time:any) {
    let value = val;
    //let value = event.target.innerText;
    let myTime=time; 
    var closeResult='';   
    
    console.log("current Time----->", myTime);  
    console.log("value", value);

    if(myTime<9 || myTime=='notime' ){
      const modalRef = this.modalService.open(AttendancemodalComponent,
        {
          scrollable: true, windowClass: 'myCustomModalClass', size: 'lg'
        },);
  
      modalRef.componentInstance.fromParent = value;
     
     console.log('my popup date',this.waSearchFm.value.fromdt);
      modalRef.componentInstance.parDate = formatDate(this.waSearchFm.value.fromdt.year + '-' + this.waSearchFm.value.fromdt.month + '-' + this.waSearchFm.value.fromdt.day, 'yyyy-MM-dd', 'en');
      modalRef.componentInstance.parWSName = this.sWSName;
      modalRef.componentInstance.parWSId = this.waSearchFm.get('wname').value;
     
      modalRef.result.then((data: any): void => {
        modalRef.close(this.onSubmit());
    })
    }  

   
  }

  
  onChange(event) {
    this.sWSName = event.target.options[event.target.options.selectedIndex].text
    this.NotEnteredData = [];
    this.EnteredData = [];
  }
 
 
}
