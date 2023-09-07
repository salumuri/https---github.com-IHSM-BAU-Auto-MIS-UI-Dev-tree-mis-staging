import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import * as XLSX from 'xlsx';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../Api/api.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ExcelService } from 'app/Api/ExcelService';
import { FormBuilder } from '@angular/forms';
import { GlobalConstants } from '../../common/global-constants';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-externalfeedback',
  templateUrl: './externalfeedback.component.html',
  styleUrls: ['./externalfeedback.component.scss']
})
export class ExternalfeedbackComponent implements OnInit {
  user: string;
  records: any[];
  currentdata: any[];
  allMasterInfo: any;
  report: any;
  tableshow:boolean=false;
  resultsArray: any;
  exceldata: [];
  QualityFeedbackReport = 'assets/excelfiles/QualityFeedbackReport.xlsx'

  constructor(public globalConst: GlobalConstants,private modalService: NgbModal,public activeModal: NgbActiveModal, private spinner: NgxSpinnerService, public router: Router, private Apiservice: ApiService, private fb: FormBuilder, private http: HttpClient, private excelService: ExcelService) { }

  @ViewChild('csvReader', { static: false }) csvReader: any;
  //headings: any = ["Feedback Accepted Date", "Workstream", "Region", "Service", "Sub Service", "Map", "Map Type","Feedback Received Date", "Screen Name", "Name of the Attribute","Weightage", "Error Count", "Error Type", "Feedback For Step","Feedback To", "Feedback Comments","Rework done by","Rework Time","Root Cause","Range","Remarks"];
  headings: any = ["Feedback Accepted Date", "Workstream", "Region", "Service", "Sub Service", "Map", "Map Type","Error Type", "Part Screen", "Error Desc","Weightage", "Act Errors", "Feedback Received Date", "Feedback For Step","Feedback To", "Rework done by","Rework Time","SME Remarks","Attributes"];
  //public errortype:[error:"Missing",error:"Wrong Entry", error:"Misinterpretation",error: "Typo"];
  // public errortype = [
  //   {
  //     etype: 'Missing'
  //   },
  //   {
  //     etype: 'Wrong Entry'
  //   },
  //   {
  //     etype: 'Misinterpretation'
  //   },
  //   {
  //     etype: 'Typo'
  //   }
  // ]

  ngOnInit(): void {
    this.user = localStorage.getItem('CorpId');
    console.log('user----->', this.user);
    this.GetAllMasterInfo();
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
  onFileChangeBlkUp(ev) {
    console.log('File Upload...!', ev);
    //this.spinner.show();
    this.records = [];
    this.currentdata = [];
    let workBook = null;
    let jsonData = null;
    const reader = new FileReader();
    const file = ev.target.files[0];
    const fileext = ev.target.files[0]?.name.split(".").pop();
    if (fileext != 'xlsx') {
      this.spinner.hide();
      this.swapAlerts('Invalid File Uploaded..!');

    } else {
      reader.onload = (event) =>
      {
        const data = reader.result;
        //Reading and convreting XLSX data to Json
        workBook = XLSX.read(data, { type: 'binary', cellDates: true });
        jsonData = workBook.SheetNames.reduce((initial, name) => {
          const sheet = workBook.Sheets[name];
          initial[name] = XLSX.utils.sheet_to_json(sheet, { defval: '', header: 0, raw: false, dateNF: 'dd-mm-yyyy' });
          return initial;
        }, {});
        const dataString = JSON.parse(JSON.stringify(jsonData));
        var fileKey = Object.keys(dataString)[0];
        this.records = dataString[fileKey];
        var hedersDt = Object.keys(this.records[0]); //Headers
        console.log('headers--->', hedersDt);
        let result = this.headings.sort().filter(o1 => hedersDt.sort().some(o2 => o1 === o2));

        if (this.headings.sort().length != hedersDt.sort().length) {
          this.spinner.hide();
          this.swapAlerts('Columns count Missmatch..!');
        } else if (this.headings.sort().length != result.length) {
          this.spinner.hide();
          this.swapAlerts('Invalid Columns Names..!');
        } else {
          console.log("File Result-->", this.records)
          var finalObj={};
          for (let s = 0; s <= this.records.length -1; s++)
           {
            console.log("Every SIngle Row -->", this.records[0])

            //Checking Validation for Workstream
            if (this.records[s]?.['Workstream'] != undefined) {
              var wrkstrm = this.records[s]?.['Workstream'].toString();
              console.log('All master information--->',this.allMasterInfo);
              const wrkresp = this.allMasterInfo.filter(function (y) { return y['w_name'] == wrkstrm});
              console.log('Work Stream master -->', wrkresp);
              if (wrkresp.length == 0) {
                this.spinner.hide();
                this.swapAlerts('Please check Work stream (' + this.records[s]?.['Workstream'] + ') in the uploaded file.!');
                return false
              }
            }
            if (this.records[s]?.['Service'] != undefined) {
              var servc = this.records[s]?.['Service'].toString();
              const resp = this.allMasterInfo.filter(function (y) { return y['service_name'] == servc });
              console.log('Service master -->', resp);
              if (resp.length == 0) {
                this.spinner.hide();
                this.swapAlerts('Please check Service (' + servc + ') in the uploaded file.!');
                return false;
              }
            }
            if (this.records[s]?.['Sub Service'] != undefined) {
              var btch = this.records[s]?.['Sub Service'].toString();
              const resb = this.allMasterInfo.filter(function (x) { return x.batch_name == btch });
              console.log('Batch master -->', resb);
              if (resb.length == 0) {
                this.spinner.hide();
                this.swapAlerts('Please check Batch (' + btch + ') in the uploaded file.!');
                return false;
              }
            }
            // if (this.records[s]?.['Error Type'] != undefined) {
            //   var errortype1 = this.records[s]?.['Error Type'].toString();
            //   console.log('errortype1 -->', errortype1);
            //   const reserror = this.errortype.filter(function (x) { return x.etype == errortype1 });
            //   console.log('Error -->', reserror);
            //   if (reserror.length == 0) {
            //     this.spinner.hide();
            //     this.swapAlerts('Please check ErrorType (' + errortype1 + ') in the uploaded file.!');
            //     return false;
            //   }
            // }
            if (this.records[s]?.['Screen Name'] != undefined) {
              var screenname = this.records[s]?.['Screen Name'].toString();
              const resscreen = this.allMasterInfo.filter(function (x) { return x.partScreen == screenname });
              console.log('Screen -->', resscreen);
              if (resscreen.length == 0) {
                this.spinner.hide();
                this.swapAlerts('Please check partScreen (' + screenname + ') in the uploaded file.!');
                return false;
              }
            }
            if (this.records.length > 0)
             {
               finalObj =
               {
                'Feedback_Accepted_Date': formatDate(this.records[s]?.['Feedback Accepted Date'], 'yyyy-MM-dd', 'en'),
                //this.formatDate(this.records[s]?.['Feedback Accepted Date']),
                'workstream': this.records[s]?.['Workstream'],
                'region': (this.records[s]?.['Region'] == '' ? '0' : this.records[s]?.['Region']),
                'service': this.records[s]?.['Service'],
                'subservice': this.records[s]?.['Sub Service'],
               // 'map': this.records[s]?.['Map'].replace(/[^A-Za-z0-9/_-]/g, ''),
                'map': this.records[s]?.['Map'],
                'mapType': this.records[s]?.['Map Type'],                
                'Error_Type': this.records[s]?.['Error Type'],
                'Part_Screen': this.records[s]?.['Part Screen'],
                'Error_Desc': this.records[s]?.['Error Desc'],
                'weightage': this.records[s]?.['Weightage'],
                'Act_Errors': this.records[s]?.['Act Errors'],
                'Feedbac_RecDate':  formatDate(this.records[s]?.['Feedback Received Date'], 'yyyy-MM-dd', 'en'),
                //this.formatDate(this.records[s]?.['Feedback Received Date']),
                'feedback_forstep': this.records[s]?.['Feedback For Step'],
                'feedback_to': this.records[s]?.['Feedback To'],                
                'rework_done_by': this.records[s]?.['Rework done by'],
                'rework_time': this.records[s]?.['Rework Time'],                
                'remarks': this.records[s]?.['SME Remarks'],
                'Attributes': this.records[s]?.['Attributes']
              }
            }
            this.currentdata.push(finalObj);
            this.tableshow=true;
          }
          console.log('curreentdata', this.currentdata);
          this.spinner.hide();

          Swal.fire({text:"Please Click Upload Button..",icon:"success"});

        }
      }
      reader.readAsBinaryString(file);
    }

}
saveBulkData() {
  console.log(this.currentdata)
  var userId = localStorage.getItem('LoginId');
  this.spinner.show();
  if (this.currentdata == undefined || this.currentdata.length == 0) {
    this.spinner.hide();
    Swal.fire({ text: "Please Upload the XLS file", icon: 'warning' });
  }
  else {
    let obj = {
      "errorList": this.currentdata,
      "createdById": Number(userId)
      // "PlannedMonth":this.mAndYear
    }
    this.Apiservice.postmethod('Tower/BulkErrors', obj).subscribe((data: any) => {
      console.log('Response --->', data);
      this.globalConst.checkOriginAccess(data);

      this.exceldata = data;
      if (this.exceldata.length == 0 ) {
        this.spinner.hide();
        Swal.fire({ text: "Insertion success!", icon: 'success' });
      }
      else{
        this.spinner.hide();
        Swal.fire({ text: "Insertion failed!", icon: 'error' });
      }
    }
    );
  }
}
GetAllMasterInfo(){
  //this.allMasterInfo=[];
  var wlst = JSON.parse(localStorage.getItem('WorkStreams'));
  console.log('wlst-->',wlst);
  var str = '';
  wlst.forEach(element => {
    str = str + element.wid+','
  });
  str = str.replace(/,\s*$/, "");
  //console.log('Final Wrkalot', str);
  this.Apiservice.get('Tower/GetDetailedList?wid='+str).subscribe((data: any) => {
    console.log('Get All List -->',data);
    this.globalConst.checkOriginAccess(data);

    this.allMasterInfo = data;
  });
}
resetAll() {
  this.currentdata = [];
  this.fileReset();
}
fileReset() {
  this.csvReader.nativeElement.value = "";
  this.records = [];
  this.currentdata = [];
  this.records = [];
}
closeModal(bnttyp) {
  this.activeModal.close('');
}
formatDate1(date) {
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
}
