import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../Api/api.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ChecklistmodalComponent } from 'app/modals/checklistmodal/checklistmodal.component';
import { MaperrorComponent } from '../../modals/maperror/maperror.component';
import { SweetAlertsComponent } from 'app/components/extra/sweet-alerts/sweet-alerts.component';
import { ExcelService } from 'app/Api/ExcelService';
import { ExternalfeedbackComponent } from 'app/modals/externalfeedback/externalfeedback.component';
import * as XLSX from 'xlsx';
import { GlobalConstants } from '../../common/global-constants';
import { NgxPaginationModule } from 'ngx-pagination';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-qcfeedbackreport',
  templateUrl: './qcfeedbackreport.component.html',
  styleUrls: ['./qcfeedbackreport.component.scss']
})
export class QcfeedbackreportComponent implements OnInit {

  public recordType = [
    {
      rtype: 'All'
    },
    {
      rtype: 'Accepted'
    },
    {
      rtype: 'Rejected'
    }
  ]
  public errorType = [
    {
      etype: 'All'
    },
    {
      etype: 'Internal'
    },
    {
      etype: 'External'
    }
  ]
  page1:any=1;
  workstreamData: any;
  tableshow: boolean = false;
  waSearchFm: FormGroup = new FormGroup({
    wsname: new FormControl(''),
    service: new FormControl(''),
    batch: new FormControl(''),
    rtype: new FormControl(''),
    receiveddt: new FormControl(''),
    shipmentdt: new FormControl(''),
    etype: new FormControl(''),
  });
  
  selectedWrkStrm: string;
  walotServices: any;
  walotBatches: any;
  rtype: any;
  reportData: any='';
  etype: any;
  errorData: any[];
  Exceldata:any=[];
  user: any;
  records: any;
  IsShowTbl: boolean;
  currentdata: any = [];
  errordata: any;
  public frmSubmit: any = false;
  fileDialogShouldOpen: boolean;
  allMasterInfo: any;
  allMastererrorInfo: any[];
  model:any;
  model1:any;
  submitbtn : any = false;

  constructor(public globalConst: GlobalConstants,private modalService: NgbModal, private spinner: NgxSpinnerService, public router: Router, private Apiservice: ApiService, private fb: FormBuilder, private http: HttpClient, private excelService: ExcelService) { }

  @ViewChild('csvReader', { static: false }) csvReader: any;
  //headings: any = ["Month", "Workstream", "Region", "Service", "Sub Service", "Record", "Feedback Received Date", "Screen Name", "Name of the Attribute", "Weightage", "Error Count", "Error Type", "Feedback For Step", "Feedback Comments"];

  ngOnInit(): void {
    this.spinner.show();
    this.user = localStorage.getItem('CorpId');
    console.log('user----->', this.user);
    this.GetWorkstream();
    this.waSearchFm = this.fb.group({
      wsname: [''],
      service: [''],
      batch: [''],
      rtype: [''],
      receiveddt: [''],
      shipmentdt: [''],
      etype:['']
    }
    );
    //console.log('recdate',this.waSearchFm['receiveddt'].value);
    this.spinner.hide();
  }
  onItemChange(value: any) {
    this.rtype = value;
    console.log(" Value is:", this.rtype);
  }
  GetWorkstream() {
    let id=localStorage.getItem('LoginId');
    this.Apiservice.get('WorkAllotment/GetWorkStream?id=' + id).subscribe((data: any) => {
      console.log('WorkStream-->', data);
      this.globalConst.checkOriginAccess(data);

      this.spinner.hide();
      this.workstreamData = data;
    });
    //this.workstreamData = JSON.parse(localStorage.getItem('WorkStreams'));
  }
  getServiceslist() {
    // this.GetErrorMasterInfo();
    this.spinner.show();
    const walotwid = this.waSearchFm.get('wsname').value;
    this.waSearchFm.reset({
      receiveddt:this.waSearchFm.value.receiveddt,
      shipmentdt:this.waSearchFm.value.shipmentdt,
      wsname: this.waSearchFm.get('wsname').value,
      service: "",
      batch: "",
      rtype:"0"
    });
    console.log('walotwid-->', walotwid);
    if (walotwid!=""){
      this.Apiservice.get('WorkAllotment/GetAreaList?wid=' + walotwid).subscribe((data: any) => {
        console.log('Services-->', data);
        this.globalConst.checkOriginAccess(data);
  
        this.spinner.hide();
        this.walotServices = data;
  
      });
    }
    // else{
    //   this.spinner.hide();     
    //   this.waSearchFm.reset({
    //     wsname: "",
    //     service: "",
    //     batch: "",
    //     rtype:""
    //   });
    //   this.walotServices =[];
    //   this.walotBatches=[];
    // }
    this.spinner.hide();
    this.walotServices =[];
    this.walotBatches=[];

   // this.walotServices = [];
   
  }
  getBatches() {
    this.spinner.show();
    const walotwid = this.waSearchFm.get('wsname').value;
    const walotsid = this.waSearchFm.get('service').value;
    
    if(walotwid!="" && walotsid!=""){
      this.Apiservice.get('WorkAllotment/GetBatchList?wid=' + walotwid + '&sid=' + walotsid).subscribe((data: any) => {
        console.log('Batches-->', data);
        this.globalConst.checkOriginAccess(data);
  
        this.spinner.hide();
        this.walotBatches = data;
      });
    }
    else{
      this.spinner.hide();      
      this.waSearchFm.reset({
        wsname: this.waSearchFm.get('wsname').value,
        service: "",
        batch: "",
        rtype:"0"
      });
      this.walotBatches=[];
    }
    
  }
  onChange(value: any) {
    this.etype = value;
    console.log('etypr-->', this.etype);
  }
  onChange1() {

  }
  swapAlerts(msg) {
    return Swal.fire({
      icon: 'error', title: 'Oops...', text: msg,
      customClass: {
        confirmButton: 'btn btn-danger'
      },
      buttonsStyling: false
    }).then(function () {
      return false;
    });
  }
  onSubmit() {

    // console.log(frmObj.receiveddt)
    this.page1=1;
    var frmObj = this.waSearchFm.value;
    console.log('Form Object-->', frmObj);
    let frmDate: any = '';
    let toDate: any = '';
    console.log(frmObj.receiveddt)
    if (this.waSearchFm.value.receiveddt != "" && this.waSearchFm.value.receiveddt != null) {
      frmDate = formatDate(this.waSearchFm.value.receiveddt.year + '-' + this.waSearchFm.value.receiveddt.month + '-' + this.waSearchFm.value.receiveddt.day, 'yyyy-MM-dd', 'en');
      //new Date(frmObj.receiveddt.year, frmObj.receiveddt.month, frmObj.receiveddt.day);
      // console.log(frmDate)
    }
    if (this.waSearchFm.value.shipmentdt != "" && this.waSearchFm.value.shipmentdt != null) {
      toDate = formatDate(this.waSearchFm.value.shipmentdt.year + '-' + this.waSearchFm.value.shipmentdt.month + '-' + this.waSearchFm.value.shipmentdt.day, 'yyyy-MM-dd', 'en');
      //new Date(frmObj.shipmentdt.year, frmObj.shipmentdt.month, frmObj.shipmentdt.day);
    }
    var getMapsList = {
      'wsname': frmObj.wsname,
      'service': frmObj.service,
      'batch': frmObj.batch,
      'recDate': frmDate,//(frmDate != '' ? this.formatDate(frmDate) : ''),
      'shipmentdt': toDate,//(toDate != '' ? this.formatDate(toDate) : ''),
      'report': this.rtype
    }
    console.log('Maplist----->', getMapsList);
    if (getMapsList.wsname == '' || getMapsList.recDate == '' || getMapsList.shipmentdt == '' || this.rtype == undefined) {
      this.swapAlerts('Please select Mandatory Fields.!')
    }
    else {

      this.spinner.show();
      if (getMapsList.wsname != '' && getMapsList.service != '' && getMapsList.batch != '') {
        this.Apiservice.get('Tower/GetQCReport?ws=' + getMapsList.wsname + '&service=' + getMapsList.service + '&batch=' + getMapsList.batch + '&fromDt=' + getMapsList.recDate + '&toDt=' + getMapsList.shipmentdt + '&type=' + getMapsList.report).subscribe((data: any) => {
          console.log('Delivery Report 1--->', data);
          this.globalConst.checkOriginAccess(data);

          this.reportData = data;
          console.log('Genrate report data',this.reportData);
          this.tableshow = true;
          this.submitbtn = true;
          this.spinner.hide();
        });
      }
      else if (getMapsList.wsname != '' && getMapsList.service != '' && getMapsList.batch == '') {
        this.Apiservice.get('Tower/GetQCReport?ws=' + getMapsList.wsname + '&service=' + getMapsList.service + '&batch=' + 'bt' + '&fromDt=' + getMapsList.recDate + '&toDt=' + getMapsList.shipmentdt + '&type=' + getMapsList.report).subscribe((data: any) => {
          console.log('Delivery Report 2--->', data);
          this.globalConst.checkOriginAccess(data);

          this.reportData = data;
          console.log('Genrate report data',this.reportData);
          this.frmSubmit = true;
          this.tableshow = true;
          this.submitbtn = true;
          this.spinner.hide();
        });
      }
      else {
        this.Apiservice.get('Tower/GetQCReport?ws=' + getMapsList.wsname + '&service=' + 'bt' + '&batch=' + 'bt' + '&fromDt=' + getMapsList.recDate + '&toDt=' + getMapsList.shipmentdt + '&type=' + getMapsList.report).subscribe((data: any) => {
          console.log('Delivery Report 3--->', data);
          this.globalConst.checkOriginAccess(data);

          this.reportData = data;
          console.log('Genrate report data',this.reportData);
          this.tableshow = true;
          this.submitbtn = true;
          this.spinner.hide();
        });
        this.reportData = [];
      }
    }
  }

  // exportAsXLSX(): void {
  //   if (this.reportData.length > 0) {
  //     this.excelService.exportAsExcelFile(this.reportData, 'QC Feedback Report');
  //     // Swal.fire({ text: 'Surveys Results Download Successfully', icon: 'success' });
  //   }
  //   else
  //     this.swapAlerts('Not Found!!');
  // }

   //Excel Export
   exportexcel(): void
   {
    //  let element = document.getElementById('excel-table');
    //  const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);
    //  const wb: XLSX.WorkBook = XLSX.utils.book_new();
    //  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    //  /* save to file */
    //  XLSX.writeFile(wb, 'QcFeedbackReport.xlsx');
    if (this.reportData.length > 0) {
      for (let s = 0; s <= this.reportData.length -1; s++)
      {
        var objData={};
         objData={
          'Workstream': this.reportData[s]?.['w_name'],
          'Region': this.reportData[s]?.['region'],
          'Service': this.reportData[s]?.['service_name'],
          'Sub Service': this.reportData[s]?.['batch_name'],
          'Team Leader': this.reportData[s]?.['GLname'],
          'Record': this.reportData[s]?.['map'],
          'Record Type': this.reportData[s]?.['maptype'],
          'Feedback Received Date': formatDate(this.reportData[s]?.['date'], 'yyyy-MM-dd', 'en'),
          'Screen Name': this.reportData[s]?.['partScreen'],
          'Error Description': this.reportData[s]?.['errorDesc'],
          'Attribute Weightages': this.reportData[s]?.['weightage'],
          'Error Count': this.reportData[s]?.['totErr'],
          'Error Type': this.reportData[s]?.['Typeofrange'],
          'Feedback For Step': this.reportData[s]?.['feedbackstep'],
          'Feedback To': this.reportData[s]?.['feedbackTo'],
          'Feedback to Associate': this.reportData[s]?.['feedbackAssociate'],
          'Feedback given by': this.reportData[s]?.['doneby'],
          'Feedback given by Name': this.reportData[s]?.['donebyname'],
          'Feedback Comments': this.reportData[s]?.['remarks'],
          'Acceptance': this.reportData[s]?.['acceptance'],
          'Qual Per': this.reportData[s]?.['qual_per']
         }
         this.Exceldata.push(objData);
      }
    
      this.excelService.exportAsExcelFile(this.Exceldata, 'QcFeedbackReport');
    }
   

   }

  formatDate1(date) {
    var d = new Date(date),
      month = '' + d.getMonth(),
      day = '' + d.getDate(),
      year = d.getFullYear();
    console.log('month=',month);

    if (day.length < 2)
      day = '0' + day;
    if (month.length < 2)
      month = '0' + month;

    return [year, month, day].join('-');
  }


  getWindow(ws, se, bt, ind) {
    // console.log('frdt---',frdt);
    // console.log('todt---',todt);
    if(ws != ''){
      const modalRef = this.modalService.open(MaperrorComponent,
        {
          scrollable: true, windowClass: 'myCustomModalClass', size: 'lg', backdrop: 'static'
          //CustomClass
        },);
        var frmObj = this.waSearchFm.value;
        console.log('Form Object-->', frmObj);
        let frmDate: any = '';
        let toDate: any = '';
        // if (frmObj.receiveddt != '') {
        //   frmDate = new Date(frmObj.receiveddt.year, frmObj.receiveddt.month-1, frmObj.receiveddt.day);
        // }
        // if (frmObj.shipmentdt != '') {
        //   toDate = new Date(frmObj.shipmentdt.year, frmObj.shipmentdt.month-1, frmObj.shipmentdt.day);
        // }
            // console.log(frmObj.receiveddt)
    var frmObj = this.waSearchFm.value;
    console.log('Form Object-->', frmObj);
    // let frmDate: any = '';
    // let toDate: any = '';
    // console.log(frmObj.receiveddt)
    if (frmObj.receiveddt != '') {
      frmDate = formatDate(this.waSearchFm.value.receiveddt.year + '-' + this.waSearchFm.value.receiveddt.month + '-' + this.waSearchFm.value.receiveddt.day, 'yyyy-MM-dd', 'en');
      //new Date(frmObj.receiveddt.year, frmObj.receiveddt.month, frmObj.receiveddt.day);
      // console.log(frmDate)
    }
    if (frmObj.shipmentdt != '') {
      toDate = formatDate(this.waSearchFm.value.shipmentdt.year + '-' + this.waSearchFm.value.shipmentdt.month + '-' + this.waSearchFm.value.shipmentdt.day, 'yyyy-MM-dd', 'en');
      //toDate = new Date(frmObj.shipmentdt.year, frmObj.shipmentdt.month, frmObj.shipmentdt.day);
    }
    var getMapsList = {
      'wsname': frmObj.wsname,
      'service': frmObj.service,
      'batch': frmObj.batch,
      'recDate': frmDate,//(frmDate != '' ? this.formatDate(frmDate) : ''),
      'shipmentdt': toDate,//(toDate != '' ? this.formatDate(toDate) : ''),
      'report': this.rtype
    }
    console.log('Maplist----->', getMapsList);
      console.log('frmDate--',frmDate);
      console.log('toDate---',toDate);
      var revDtOb = {
        modws: ws,
        modse: se,
        modbt: bt,
        modfdt: getMapsList.recDate ,
        modtdt: getMapsList.shipmentdt,
        modind: ind
      }
      modalRef.componentInstance.fromParent = revDtOb;
      console.log('object--->', revDtOb);
    }
    else{
      this.swapAlerts("Please Select Mandatory Fields...!").then(function(){
        window.location.reload();
      });
    }
  }



  getModel(){
    const Ref = this.modalService.open(ExternalfeedbackComponent,
      {
        scrollable: true, windowClass: 'myCustomModalClass', size: 'lg', backdrop: 'static'

       // scrollable: true, windowClass: 'myCustomModalClass', size: 'lg'
      });
      //Ref.componentInstance.fromParent = this.reportData;
  }

  // onFileChangeBlkUp(ev) {
  //   var frmObj = this.waSearchFm.value;
  //   if (frmObj.wsname == '') {
  //     Swal.fire('Please select Workstream,Service(optional) and Batch(optional) for Import Excel !').then(function () {
  //       location.reload();
  //       ev.preventDefault();
  //       ev.stopPropagation();
  //     });
  //   }
  //   else {
  //     console.log('File Upload...!', ev);
  //     this.spinner.show();
  //     this.records = [];
  //     this.currentdata = [];
  //     let workBook = null;
  //     let jsonData = null;
  //     const reader = new FileReader();
  //     const file = ev.target.files[0];
  //     const fileext = ev.target.files[0]?.name.split(".").pop();
  //     if (fileext != 'xlsx') {
  //       this.spinner.hide();
  //       this.swapAlerts('Invalid File Uploaded..!');

  //     } else {
  //       reader.onload = (event) =>
  //       {
  //         const data = reader.result;
  //         //Reading and convreting XLSX data to Json
  //         workBook = XLSX.read(data, { type: 'binary', cellDates: true });
  //         jsonData = workBook.SheetNames.reduce((initial, name) => {
  //           const sheet = workBook.Sheets[name];
  //           initial[name] = XLSX.utils.sheet_to_json(sheet, { defval: '', header: 0, raw: false, dateNF: 'dd-mm-yyyy' });
  //           return initial;
  //         }, {});
  //         const dataString = JSON.parse(JSON.stringify(jsonData));
  //         var fileKey = Object.keys(dataString)[0];
  //         this.records = dataString[fileKey];
  //         this.IsShowTbl = true;
  //         var hedersDt = Object.keys(this.records[0]); //Headers
  //         console.log('headers--->', hedersDt);
  //         let result = this.headings.sort().filter(o1 => hedersDt.sort().some(o2 => o1 === o2));

  //         if (this.headings.sort().length != hedersDt.sort().length) {
  //           this.spinner.hide();
  //           this.swapAlerts('Columns count Missmatch..!');
  //         } else if (this.headings.sort().length != result.length) {
  //           this.spinner.hide();
  //           this.swapAlerts('Invalid Columns Names..!');
  //         } else {
  //           console.log("File Result-->", this.records)

  //           for (let s = 0; s <= this.records.length; s++)
  //            {
  //             console.log("Every SIngle Row -->", this.records[0])

  //             //Checking Validation for Workstream
  //             if (this.records[s]?.['Workstream'] != undefined) {
  //               var wrkstrm = this.records[s]?.['Workstream'].toString();
  //               //console.log('workstex--->',wrkstrm);
  //               const wrkresp = this.allMasterInfo.filter(function (y) { return y['w_name'] == wrkstrm});
  //               console.log('Work Stream master -->', wrkresp);
  //               if (wrkresp.length == 0) {
  //                 this.spinner.hide();
  //                 this.swapAlerts('Please check Work stream (' + this.records[s]?.['Workstream'] + ') in the uploaded file.!');
  //                 return false
  //               }
  //             }
  //             if (this.records[s]?.['Service'] != undefined) {
  //               var servc = this.records[s]?.['Service'].toString();
  //               const resp = this.allMasterInfo.filter(function (y) { return y['service_name'] == servc });
  //               console.log('Service master -->', resp);
  //               if (resp.length == 0) {
  //                 this.spinner.hide();
  //                 this.swapAlerts('Please check Service (' + servc + ') in the uploaded file.!');
  //                 return false;
  //               }
  //             }
  //             if (this.records[s]?.['Sub Service'] != undefined) {
  //               var btch = this.records[s]?.['Sub Service'].toString();
  //               const resb = this.allMasterInfo.filter(function (x) { return x.batch_name == btch });
  //               console.log('Batch master -->', resb);
  //               if (resb.length == 0) {
  //                 this.spinner.hide();
  //                 this.swapAlerts('Please check Batch (' + btch + ') in the uploaded file.!');
  //                 return false;
  //               }
  //             }
  //             if (this.records[s]?.['Screen Name'] != undefined) {
  //               var screenname = this.records[s]?.['Screen Name'].toString();
  //               const resscreen = this.allMastererrorInfo.filter(function (x) { return x.partScreen == screenname });
  //               console.log('Screen -->', resscreen);
  //               if (resscreen.length == 0) {
  //                 this.spinner.hide();
  //                 this.swapAlerts('Please check partScreen (' + screenname + ') in the uploaded file.!');
  //                 return false;
  //               }
  //             }
  //             if (this.records[s]?.['Weightage'] != undefined) {
  //               var weigh = this.records[s]?.['Weightage'].toString();
  //               const resweigth = this.allMastererrorInfo.filter(function (x) { return x.weightage == weigh });
  //               console.log('weight -->', resweigth);
  //               if (resweigth.length == 0) {
  //                 this.spinner.hide();
  //                 this.swapAlerts('Please check weightage (' + weigh + ') in the uploaded file.!');
  //                 return false;
  //               }
  //             }

  //             if (this.records.length > 0)
  //              {
  //                var finalObj =
  //                {
  //                 'month': this.records[s]?.['Month'],
  //                 'workstream': this.records[s]?.['Workstream'],
  //                 'region': (this.records[s]?.['Region'] == '' ? '0' : this.records[s]?.['Region']),
  //                 'service': this.records[s]?.['Service'],
  //                 'batch': this.records[s]?.['Sub Service'],
  //                 'map': this.records[s]?.['Record'].replace(/[^A-Za-z0-9/_-]/g, ''),
  //                 'feedbackrs_date': this.records[s]?.['Feedback Received Date'],
  //                 'screen_name': this.records[s]?.['Screen Name'],
  //                 'nameof_attribute': this.records[s]?.['Name of the Attribute'],
  //                 'weightage': this.records[s]?.['Weightage'],
  //                 'error_count': this.records[s]?.['Error Count'],
  //                 'error_type': this.records[s]?.['Error Type'],
  //                 'feedback_forstep': this.records[s]?.['Feedback For Step'],
  //                 'feedback_comments': this.records[s]?.['Feedback Comments']
  //               }
  //               this.currentdata.push(finalObj);
  //             }

  //           }

  //           this.spinner.hide();
  //           console.log('curreentdata', this.currentdata);
  //         }
  //       }
  //       reader.readAsBinaryString(file);
  //     }
  //   }
  // }


  // GetErrorMasterInfo() {
  //   var frmObj = this.waSearchFm.value;
  //   var geterrorsList = {
  //     'wsname': frmObj.wsname,
  //     'service': frmObj.service,
  //     'batch': frmObj.batch
  //   }
  //   if (geterrorsList.wsname == '') {
  //     this.swapAlerts('Please select Workstream,Service and Batch for Import Excel !')
  //   }
  //   else {
  //     this.spinner.show();
  //     if (geterrorsList.wsname != '' && geterrorsList.service != '' && geterrorsList.batch != '') {
  //       this.Apiservice.get('Tower/GetErrormasterList?ws=' + geterrorsList.wsname + '&service=' + geterrorsList.service + '&batch=' + geterrorsList.batch).subscribe((data: any) => {
  //         console.log('Error Report --->', data);
  //         this.allMastererrorInfo = data;
  //         this.spinner.hide();
  //       });
  //     }
  //     else if (geterrorsList.wsname != '' && geterrorsList.service != '' && geterrorsList.batch == '') {
  //       this.Apiservice.get('Tower/GetErrormasterList?ws=' + geterrorsList.wsname + '&service=' + geterrorsList.service + '&batch=' + 'bt').subscribe((data: any) => {
  //         console.log('Error Report --->', data);
  //         this.allMastererrorInfo = data;
  //         this.spinner.hide();
  //       });
  //     }
  //     else {
  //       this.Apiservice.get('Tower/GetErrormasterList?ws=' + geterrorsList.wsname + '&service=' + 'bt' + '&batch=' + 'bt').subscribe((data: any) => {
  //         console.log('Error Report --->', data);
  //         this.allMastererrorInfo = data;
  //         this.spinner.hide();
  //       });
  //       this.allMastererrorInfo = [];
  //     }
  //   }
  // }
}

