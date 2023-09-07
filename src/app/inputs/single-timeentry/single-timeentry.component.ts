import { NgModule, Component, OnInit, ViewEncapsulation, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DatatableData } from '../../data-tables/datatables.data';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { WkDatatableData } from '../../data-tables/workstreamdttbl.data';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as XLSX from 'xlsx';
import { ApiService } from '../../Api/api.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { forEach } from 'core-js/core/array';
import { NgbModal, ModalDismissReasons, NgbActiveModal, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';

import { ChecklistmodalComponent } from "../../modals/checklistmodal/checklistmodal.component";
import { RemarksComponent } from "../../modals/remarks/remarks.component";
import { FeedbackComponent } from "../../modals/feedback/feedback.component";
import { FeedbackErrorListComponent } from "../../modals/feedback-error-list/feedback-error-list.component";
import { GlobalConstants } from '../../common/global-constants';
import { DatePipe } from '@angular/common';

import { ExternalFeedbackErrorlistComponent } from 'app/modals/external-feedback-errorlist/external-feedback-errorlist.component';

@Component({
  selector: 'app-single-timeentry',
  templateUrl: './single-timeentry.component.html',
  styleUrls: ['./single-timeentry.component.scss']
})
export class SingleTimeentryComponent implements OnInit {
  feedbackErrorlist = [];
  fbchk = true;
  workstreamData: any; walotServices: any; walotBatches: any; selectedWrkStrm: any = '';
  walotRegions: any = ''; userSteps: any; userStepsSeq: any; bulkSteps: any; services: any; timedata: any; isShown: boolean = false; gridPos: any = 1;
  public exlsJson: any = []; public finalExcelJson: any = []; timeentryReport: any = []; timeentryReportCopy: any = [];
  public entrydate: any;
  public bentrydate: any; public minDate: any;
  public bulkHeaders: any;
  public copyDt: any = [];
  public userCustomGrid: any;
  public selectedStep: any;
  public totalKMS: any;
  public runs: any;
  public foldername: any;
  public checklistVersion: any;
  public checllistStatus: any;
  public sltshift: any = 'WFH';
  public timeBtn: any = true;
  public tomapData: any = [];
  public selTom: any;
  public walotwid: any;
  public walotsid: any;
  public stepname: any;
  public stateId: any;
  public currentDateTime: any;
  public entryDate: any;
  public currentKMS: any;

  public totalEntities: any = 0;
  objectKeys = Object.keys;

  stSearchFm: FormGroup = new FormGroup({
    stepname: new FormControl(''),
    wsname: new FormControl(''),
    region: new FormControl(''),
    service: new FormControl(''),
    state: new FormControl(''),
    shift: new FormControl(''),

  });

  generalSearchFm: FormGroup = new FormGroup({
    gwsname: new FormControl(''),
    gregion: new FormControl(''),
    gservice: new FormControl(''),
    gstate: new FormControl(''),
    gstepname: new FormControl(''),
    gtimeentry: new FormControl(''),
    gtimeentrydate: new FormControl(''),
    gshift: new FormControl(''),
    gremarks: new FormControl(''),
  });

  waSearchFmb: FormGroup = new FormGroup({
    bstepname: new FormControl(''),
    bwsname: new FormControl(''),
    bservice: new FormControl(''),
    bsubservice: new FormControl('')
  });

  public userRole = localStorage.getItem('Role');
  submitted = false;
  submittedb = false;
  closeResult: string;
  selRec = '';
  selInd = '';
  chkdata: any = [];
  revdata: any = [];
  empName = localStorage.getItem("Name");
  empId = localStorage.getItem("LoginId");
  curDate = new Date().toISOString().slice(0, 10);
  tmremarks = '';
  bulkTimeEntryList = [];
  excelUpload = false;
  allMasterInfo = [];
  timeenteryCal = '0';
  exTimeEntry = '';
  mapsearchtext:any = '';
  searchBtn = false;
  generalSteps = [];
  chkAllOption = false;
  selStep: any = '';
  maxDate: any = '';
  recdate: any = [];
  receivedDates: any = [];
  percent: any = 0;
  public resetData: any = [];
  seqType = 'seq';
  allRowsSelected: any = false;
  public isMasterSel2: any = false;
  batchQA: any = false;
  batchQANumber: any = ''; iPerval: any = 0;
  stepSeqDetails: any = [];
  cusEntities:any=''
  // currentDate = moment().date();
  // maxDate = moment([this.currentDate + 2, 11, 31]);

  @ViewChild('csvReader', { static: false }) csvReader: any;
  //   datepipe: any;

  constructor(private datePipe: DatePipe, public globalConst: GlobalConstants, private modalService: NgbModal, private spinner: NgxSpinnerService, public router: Router, private Apiservice: ApiService, private fb: FormBuilder, private http: HttpClient) {
    this.empId = localStorage.getItem("LoginId");

    const current = new Date();
    // myDate = this.datePipe.transform(this.myDate, 'yyyy-MM-dd');

    this.minDate = {
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      day: current.getDate()
    };
    this.entrydate = {
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      day: current.getDate()
    };
  }

  ngOnInit(): void {

    const now = new Date();
    const since = moment().subtract(14, 'd').toDate();

    this.getFeedbackList();


    this.selectedWrkStrm = localStorage.getItem('selectedWrkStrm');
    //console.log('Sel work strm --->', this.selectedWrkStrm)

    if (this.selectedWrkStrm == '' || this.selectedWrkStrm == null) {
      this.swapAlerts('Please select Workstream.!', 'swal2-warning')
    }


    this.stSearchFm = this.fb.group({
      stepname: [''],
      wsname: ['', Validators.required],
      region: [''],
      service: ['', Validators.required],
      state: [''],
      shift: [''],
      recdate: ['']

    });

    this.generalSearchFm = this.fb.group({
      gwsname: ['null', Validators.required],
      gregion: ['null'],
      gservice: ['null', Validators.required],
      gstate: ['null'],
      gstepname: ['null', Validators.required],
      gtimeentry: ['', Validators.required],
      gtimeentrydate: ['null', Validators.required],
      gshift: ['null'],
      gremarks: ['', Validators.required],
    });

    // Initially load first page
    this.waSearchFmb = this.fb.group({
      bstepname: ['', Validators.required],
      bwsname: ['', Validators.required],
      bservice: ['', Validators.required],
      bsubservice: ['', Validators.required]
    });

    this.GetWorkstream();
    this.GetAllMasterInfo();
    this.GettingUserWCustomGrid();
    this.getGeneralSteps();
    //this.onSubmitb();
    //this.GetBulkTimeEntryList();
  }

  //Grid postion
  getTabPos(gpos) {
    this.gridPos = gpos;
    this.userSteps = [];
    this.walotServices = [];
  }

  GetAllMasterInfo() {
    var wlst = JSON.parse(localStorage.getItem('WorkStreams'));
    var str = '';
    wlst.forEach(element => {
      str = str + element.wid + ','
    });
    str = str.replace(/,\s*$/, "");
    //console.log('Final Wrkalot', str);
    this.Apiservice.get('WorkAllotment/GetDetailedList?wid=' + str).subscribe((data: any) => {
      console.log('Get All List -->', data);

      this.globalConst.checkOriginAccess(data);

      this.allMasterInfo = data;


    });
  }

  getGeneralSteps() {
    this.Apiservice.get('TimeEntry/GetGeneralSteps').subscribe((data: any) => {
      console.log('General Steps -->', data);
      this.globalConst.checkOriginAccess(data);

      this.generalSteps = data;
    });
  }


  //Getting List of Feedabck for Maps
  getFeedbackList() {
    this.spinner.show();
    this.Apiservice.get('Feedback/GetFeedbackDetailsList?login_ID=' + this.empId).subscribe((data: any) => {
      console.log('Feedback List -->', data);
      this.globalConst.checkOriginAccess(data);

      this.feedbackErrorlist = data;
      if (data > 0) {
        this.fbchk = true;
      } else {
        this.fbchk = false;
      }
      this.spinner.hide();
    });
  }


  GetBulkTimeEntryList() {
    this.Apiservice.get('TimeEntry/GetBulkentryList?empId=' + this.empId + '&workstream=&state=&service=&step=').subscribe((data: any) => {
      //console.log('Bulk List -->',data);
      this.globalConst.checkOriginAccess(data);

      this.exlsJson = data;
      this.exlsJson.forEach(x => {

        var ind = this.userSteps.findIndex(x => x.step_name == x.StepName);
        //console.log('Step Ind ->', ind);
        var curStepInfo = '';
        if (this.userSteps.length > ind && ind != -1) {
          curStepInfo = this.userSteps[ind + 1].step_name;
        } else {
          curStepInfo = this.userSteps[0].step_name;
        }
        //console.log('Step Ind 2->', curStepInfo);
        x.NextStep = curStepInfo;
        x.Time = '';
        x.Status = '';
        x.Chk = 'No';
        x.Remarks = '';
      });
    });
  }

  //Workstream
  GetWorkstream() {
    // this.workstreamData = JSON.parse(localStorage.getItem('WorkStreams'));
    let id = localStorage.getItem('LoginId');
    this.Apiservice.get('WorkAllotment/GetWorkStream?id=' + id).subscribe((data: any) => {
      console.log('Work Allot-->', data);
      this.globalConst.checkOriginAccess(data);

      this.workstreamData = data;
    });

    if (this.selectedWrkStrm != "") {
      //this.getServiceslist('a');
      this.stSearchFm.controls.stepname.setValue('');
      this.waSearchFmb.controls.bstepname.setValue('');
      this.userSteps = [];
    }
  }

  //Region
  GetRegions(wrkstrm) {
    this.Apiservice.get('WorkAllotment/GetRegionList?wid=' + wrkstrm).subscribe((data: any) => {
      //console.log('Regions-->',data);
      this.globalConst.checkOriginAccess(data);

      this.walotRegions = data;
    });
  }

  //Service List
  getServiceslist(typ) {
    this.spinner.show();
    this.resetAll();

    var walotwid = '';
    if (typ == 'a') {
      if (this.stSearchFm.get('wsname').value != '')
        walotwid = this.stSearchFm.get('wsname').value;
      else if (this.generalSearchFm.get('gwsname').value != '')
        walotwid = this.generalSearchFm.get('gwsname').value;
    } else {
      walotwid = this.waSearchFmb.get('bwsname').value;
    }

    this.GetRegions(walotwid);
    //const walotwid = this.stSearchFm.get('wsname').value;
    this.Apiservice.get('WorkAllotment/GetAreaList?wid=' + walotwid).subscribe((data: any) => {
      //console.log('Services-->',data);
      this.globalConst.checkOriginAccess(data);

      this.walotServices = data;
      // this.getUserWiseSteps();
      this.spinner.hide();
    });
    this.spinner.hide();
  }

  // Resetall
  resetAll() {
    this.userSteps = [];
    this.timeentryReport = [];
    this.timeentryReportCopy = [];
    this.finalExcelJson = [];
    this.exlsJson = [];
    this.stSearchFm.patchValue({ region: '' });
    this.stSearchFm.patchValue({ service: '' });
    this.stSearchFm.patchValue({ state: '' });
    this.stSearchFm.patchValue({ stepname: '' });


    this.waSearchFmb.patchValue({ bservice: '' });
    this.waSearchFmb.patchValue({ bstepname: '' });

    //this.csvReader.nativeElement.value = "";
  }

  resetSome() {
    this.timeentryReport = [];
    this.timeentryReportCopy = [];
    this.finalExcelJson = [];
    this.exlsJson = [];
    //this.csvReader.nativeElement.value = "";
  }

  getBatches(typ) {
    var walotwid = '';
    var walotsid = '';


    if (typ == 'a') {
      if (this.stSearchFm.get('wsname').value != '') {
        walotwid = this.stSearchFm.get('wsname').value;
        walotsid = this.stSearchFm.get('service').value;
      }
      else if (this.generalSearchFm.get('gwsname').value != '') {
        walotwid = this.generalSearchFm.get('gwsname').value;
        walotsid = this.generalSearchFm.get('gservice').value;
      }
    } else {
      walotwid = this.waSearchFmb.get('bwsname').value;
      walotsid = this.waSearchFmb.get('bservice').value;
      //this.getUserWiseSteps(walotwid,walotsid);
    }




    this.Apiservice.get('WorkAllotment/GetBatchList?wid=' + walotwid + '&sid=' + walotsid).subscribe((data: any) => {
      console.log('Batches-->', data);
      this.globalConst.checkOriginAccess(data);

      this.walotBatches = data;
    });

    if (walotsid != '' && walotsid != null) {
      this.userSteps = [];
      this.userStepsSeq = [];
      //this.getSteps(walotwid,walotsid);
      //this.getStepsSeq(walotwid,walotsid);

      // this.getUserWiseSteps(walotwid,walotsid);
    } else {
      this.userSteps = [];
      this.exlsJson = [];
      this.finalExcelJson = [];
      this.bulkHeaders = [];
    }

  }

  getUserWiseStepsBySubService() {
    var walotwid = this.waSearchFmb.get('bwsname').value;
    var walotsid = this.waSearchFmb.get('bservice').value;
    var walotssid = this.waSearchFmb.get('bsubservice').value;
    this.getUserWiseSteps(walotwid, walotsid,walotssid);
  }
  getSeqnce() {
    var walotwid = this.stSearchFm.get('wsname').value;
    var walotsid = this.stSearchFm.get('service').value;
    var walotbid = this.stSearchFm.get('state').value;
    this.userSteps = [];
    this.userStepsSeq = [];
    this.getSteps(walotwid, walotsid,walotbid);
    this.getStepsSeq(walotwid, walotsid);
  }

  getStepsSeq(wid, sid) {
    this.spinner.show();
    this.userStepsSeq = [];
    this.stSearchFm.controls.stepname.setValue('');
    //this.waSearchFmb.controls.bstepname.setValue('');
    const stateId = (this.stSearchFm.get('state').value == '' ? '' : this.stSearchFm.get('state').value);
    this.Apiservice.get('WorkAllotment/GetStepSeq?wid=' + wid + '&sid=' + sid + '&ssid=' + stateId).subscribe((data: any) => {
      console.log('Steps Seq-->', data);
      this.globalConst.checkOriginAccess(data);

      this.userStepsSeq = data;
      this.spinner.hide();
    });
  }

  //Get Steps
  getSteps(wid, sid, bid) {
    this.spinner.show();
    this.userSteps = [];
    this.stSearchFm.controls.stepname.setValue('');
    this.waSearchFmb.controls.bstepname.setValue('');
    const stateId = (this.stSearchFm.get('state').value == '' ? '' : this.stSearchFm.get('state').value);
    console.log(wid,'-',sid,'-',bid)
    this.Apiservice.get('WorkAllotment/GetTimeEntryUserwiseAccess?wid=' + wid + '&sid=' + sid + '&ssid=' + bid).subscribe((data: any) => {
      console.log('Steps 2-->', data);
      this.globalConst.checkOriginAccess(data);

      this.userSteps = data;
      this.spinner.hide();
    });
  }

  getUserWiseSteps(wid, sid,ssid) {
    this.spinner.show();
    this.userSteps = [];
    this.stSearchFm.controls.stepname.setValue('');
    this.waSearchFmb.controls.bstepname.setValue('');
    const stateId = (this.stSearchFm.get('state').value == '' ? '' : this.stSearchFm.get('state').value);
    this.Apiservice.get('WorkAllotment/GetUserwiseAccess?wid=' + wid + '&sid=' + sid + '&ssid=' + ssid).subscribe((data: any) => {
      console.log('Steps 2-->', data);
      this.globalConst.checkOriginAccess(data);
      this.bulkSteps = data;
      this.spinner.hide();
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.stSearchFm.controls;
  }
  // getAllSt(ite){
  //   console.log(ite)
  // }
  onSubmit() {
    //console.log('Submit working...!')
    this.batchQA = false;
    this.timeBtn = true;
    this.chkAllOption = false;
    this.timeentryReport = [];
    this.timeentryReportCopy = [];
    this.timeenteryCal = '0';
    this.searchBtn = true;
    this.spinner.show();
    this.resetSome();
    const walotwid = this.stSearchFm.get('wsname').value;
    const walotsid = this.stSearchFm.get('service').value;
    const stepname = this.stSearchFm.get('stepname').value;
    const recdate = this.stSearchFm.get('recdate').value;
    const stateId = (this.stSearchFm.get('state').value == '' ? '' : this.stSearchFm.get('state').value);
    this.walotwid = walotwid;
    this.walotsid = walotsid;
    this.stepname = stepname;
    this.stateId = stateId;
    var rdbSelectedStep: any = ''
    if (stepname == '' || stepname == null) {
      this.swapAlerts('Please select Step to continue..!', 'swal2-warning');
      this.spinner.hide();
    }
    console.log("sample 1--->", recdate);

    var userId = localStorage.getItem('LoginId');
    this.selectedStep = stepname;
    var ind1 = this.userSteps.findIndex(x => x.step_id == stepname);
    if (this.userSteps.length > ind1 && ind1 != -1) {
      rdbSelectedStep = this.userSteps[ind1]?.step_name;
    }

    if (rdbSelectedStep == 'QA') {
      this.checkBatchQA(walotwid, walotsid, stateId)//QA step - check for batchQA or not      
    }
  // Getting Previous Step
  let prevStep
  this.Apiservice.get('WorkAllotment/GetStepSeq?wid=' + walotwid + 
  '&sid=' + walotsid + '&ssid=' + stateId).subscribe((data: any) => {
    console.log('Steps Seq-->', data);
   
    this.stepSeqDetails = data;
    if(stepname == 5)
     prevStep = 4;
    else if(stepname == 7)
     prevStep = 6;
    else if(stepname == 214)
     prevStep = 181;
    else if(stepname == 215)
     prevStep = 182;
    else {
    for(var s = 0; s < this.stepSeqDetails.length; s++){
      if(this.stepSeqDetails[s].step_id == stepname)
        {
          if(s == 0)
           prevStep = 1;
          else
           prevStep = this.stepSeqDetails[s-1].step_id;
        }
          
    }
  }
   

    this.Apiservice.get('TimeEntry/GetTimeentryListDate?tservice=' + walotsid + '&tworkstream=' + walotwid +
      '&tstep=' + stepname + '&tloginid=' + userId + '&tsubservice=' + stateId + '&date=' + recdate +
       '&tprevioustep=' + prevStep).subscribe((data: any) => {
        console.log("Get data -------------->", data)
       
        // return
        // Getting type of map data
        this.Apiservice.get('Feedback/GetCanadaTypeofMapList?workstream=' + walotwid + '&service=' + walotsid + '&batch=' +
          stateId + '&step=' + stepname).subscribe((tomdata: any) => {
            console.log("Get data -------------->", tomdata)
            this.tomapData = tomdata;


            this.globalConst.checkOriginAccess(data);

            this.timeentryReport = data;
            this.resetData = data;
            this.timeentryReportCopy = data;
            this.timeentryReportCopy.forEach(f => {
              f.tomEditable = false;
              // if (f.type_of_map == '' || f.type_of_map == null || f.type_of_map == undefined) {
              //   f.type_of_map = '--';
              // }

            });
            this.timeentryReport.forEach(e => {
              e.editable = false;
              e.editables = false;
              e.timeentry = '';
              e.cusEntities = '';
              e.tstatus = 'COMP';
              e.tremarks = '';
              e.chk = 'No';
              e.checklist = [];
              e.currentKMS = 0;
            });
            this.spinner.hide();
          });
      });
    });
  }


  onSubmitGneral() {

    if (this.generalSearchFm.invalid) {
      this.swapAlerts('Please select all mandatory fields.!', 'swal2-warning');
    } else {
      var userId = localStorage.getItem('LoginId');
      console.log('Form Values--->', this.generalSearchFm);
      var gdt = this.generalSearchFm.value.gtimeentrydate;
      var fdt = gdt.year + '-' + gdt.month + '-' + gdt.day;
      var selDate = new Date(fdt);
      var fdt2 = this.formatDate2(selDate);
      var tskmngr = localStorage.getItem('taskManagerId');
      var glid = localStorage.getItem('glid');

      var finlObj = {
        "stepsList": [
          {
            "workstream": this.generalSearchFm.value.gwsname,
            "region": (this.generalSearchFm.value.gregion == 'null' ? '' : this.generalSearchFm.value.gregion),
            "service": this.generalSearchFm.value.gservice,
            "batch": (this.generalSearchFm.value.gstate == 'null' ? '1383' : this.generalSearchFm.value.gstate),
            "step": this.generalSearchFm.value.gstepname,
            "timeEntry_date": fdt2,
            "time_spent": this.timeenteryCal,
            "remarks": this.generalSearchFm.value.gremarks,
            "glID": glid,
            "taskManager": tskmngr,
            "shift": this.generalSearchFm.value.gshift
          }
        ],
        "loginBy": userId
      }


      console.log('Post General Obj--->', finlObj);
      //return;

      this.Apiservice.postmethod('TimeEntry/BulkSaveGeneralSteps', finlObj).subscribe((data: any) => {
        console.log('Time entry Resp-->', data);
        this.globalConst.checkOriginAccess(data);

        if (data && data.length == 0) {
          this.spinner.hide();
          this.generalSearchFm.reset();
          Swal.fire({ text: "Submited Successfullly!", icon: 'success' }).then(function () {

          });
        } else {
          this.spinner.hide();
          Swal.fire({ text: "Failed to update due to invalid inputs!", icon: 'error' }).then(function () {
            //this.fileReset();
          });
        }
      });

      //console.log('Final Obj-->', finlObj);
    }

  }


  //Form Submition
  onSubmitb() {
    console.log('Submit working...!');
    this.spinner.show();
    this.resetSome();

    var frmObj = this.waSearchFmb.value;
    console.log('Sample --->', frmObj)
    var wid = parseInt(frmObj.bwsname);
    var sid = parseInt(frmObj.bservice);
    var ssid = parseInt(frmObj.bsubservice);
    var stp = 0;
    var userId = localStorage.getItem('LoginId');
    if (frmObj.bstepname != "") {
      stp = frmObj.bstepname;
      //alert(stp);
    }

    //console.log('Sample 2 -->', stp)

    this.Apiservice.get('TimeEntry/GetBulkUpdateTracker?wid=' + wid + '&sid=' + sid + '&stepid=' + stp + '&ssid=' + ssid + '&login=' + userId).subscribe((data: any) => {
      console.log('Bulk List 1-->', data);
      this.globalConst.checkOriginAccess(data);

      this.spinner.hide();

      if (data && data.length > 0) {
        //alert('Hell!')
        this.exlsJson = data;

        // this.spinner.show();
        if (this.exlsJson.length > 0) {
          Object.assign(this.copyDt, data[0]);
          //var fileResult = dataString[fileKey];
          //console.log('Data -->', this.copyDt)
          this.loadHeaders();
          // this.Apiservice.get('TimeEntry/GetBulkUpdateTracker?wid='+wid+'&sid='+sid+'&stepid='+stp).subscribe((data: any) => {
          //   console.log('Headers-->', data)
          //   this.copyDt = data[0];
          //   this.loadHeaders();
          //   this.spinner.hide();
          // });
        }

        this.exlsJson.forEach(x => {
          var ind = this.userSteps.findIndex(y => y.step_name == x.step_name);
          //console.log('Step Ind ->', ind , x['step_name']);
          var curStepInfo = '';
          if (this.userSteps.length > ind && ind != -1) {
            curStepInfo = this.userSteps[ind + 1]?.step_name;
          } else if (this.userSteps.length > 0 && x['step_name'] == 'Shipment') {
            curStepInfo = 'Shipment';
          }
          x.NextStep = curStepInfo;
          x.Time = '';
          x.Status = '';
          x.Chk = 'No';
          x.Remarks = '';
        });
      } else {
        this.submittedb = true;
      }
    });
  }

  toggleShow() {
    this.isShown = !this.isShown;
  }

  //Load Headers
  loadHeaders() {
    this.spinner.show();
    let eJson = this.copyDt;
    if (this.exlsJson.length > 0 || this.finalExcelJson.length > 0) {
      delete eJson.Chk; delete eJson.NextStep; delete eJson.Remarks; delete eJson.Status;
      delete eJson.Time; delete eJson.B_Id; delete eJson.B_Name; delete eJson.Reg_Name;
      delete eJson.Entities; delete eJson.Id; delete eJson.map; delete eJson.map_type;
      delete eJson.R_Id; delete eJson.S_Id; delete eJson.Service_Name; delete eJson.WS_Id; delete eJson.WS_Name;
      delete eJson.total_kms; delete eJson.Entities; delete eJson.total_units; delete eJson.map_received_date
      //delete eJson[0]; delete eJson[1]; delete eJson[2]; delete eJson[3]; delete eJson[4];
      console.log('Final Obj headers---->', eJson);
      this.bulkHeaders = eJson;
      this.spinner.hide();
    } else {
      this.spinner.show();
    }
  }

  onFileChangechk(ev) {
    console.log('File Upload...!', ev)
    this.spinner.show();
    this.excelUpload = true;
    this.exlsJson = [];
    this.submittedb = false;
    let workBook = null;
    let jsonData = null;
    const reader = new FileReader();
    const file = ev.target.files[0];
    if (ev.target.files[0]) {
      reader.onload = (event) => {
        const data = reader.result;
        workBook = XLSX.read(data, { type: 'binary', cellDates: true });
        jsonData = workBook.SheetNames.reduce((initial, name) => {
          const sheet = workBook.Sheets[name];
          console.log(sheet)
          initial[name] = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
          return initial;
        }, {});
        console.log(jsonData)
        const dataString = JSON.parse(JSON.stringify(jsonData));
        //console.log('Sample Excel--->', dataString)
        var fileKey = Object.keys(dataString)[0];
        var fileResult = dataString[fileKey];
        //console.log('Excel Data--->', this.exlsJson)

        var userId = localStorage.getItem('LoginId');

        const mnObj = {
          "mapssList": [],
          "CreatedById": Number(userId),
          "empid": 13
        };

        console.log('Uploaded Excel-->', fileResult);

        this.finalExcelJson = fileResult;
        this.copyDt = fileResult[0];
        this.loadHeaders();

        if (this.bulkSteps.length == 0) {
          this.swapAlerts('Please Select Workstream and service before you upload the file.!', 'swal2-warning');
          this.fileReset();
          this.spinner.hide();
          return false;
        }

        this.finalExcelJson.forEach(x => {

          //Checking Validation for Workstream
          if (x?.['Workstream'] != undefined) {
            //var resp = Object.values(this.waobj).includes(this.records[s]?.['Work stream']);
            var wrkstrm = x?.['Workstream'].toString();
            const wrkresp = this.allMasterInfo.filter(function (y) { return y['w_name'] == x.Workstream });
            //console.log('Work Stream -->', wrkresp);
            if (wrkresp.length == 0) {
              this.spinner.hide();
              this.swapAlerts('Please check Work stream (' + x?.['Workstream'] + ') in the uploaded file.!', '');
              this.fileReset();
              return false
            }
          }

          //Checking Validation for Service
          if (x?.['Service'] != undefined) {
            var servc = x?.['Service'].toString();
            const resp = this.allMasterInfo.filter(function (y) { return y['service_name'] == servc });
            //console.log("service Resp -->", this.walotServices);
            if (resp.length == 0) {
              this.spinner.hide();
              this.swapAlerts('Please check Service (' + servc + ') in the uploaded file.!', '');
              this.fileReset();
              return false;
            }
          }

          //Checking Validation for State
          if (x?.['Batch'] != undefined) {
            var btch = x?.['Batch'].toString();
            // const resp = this.allMasterInfo.filter(function (x) { return x.batch_name == btch});
            var services = x?.['Service'].toString();
            var resp = this.allMasterInfo.filter(function (x) { return (x.batch_name == btch && x.service_name == services) });
            if (resp.length == 0) {
              this.spinner.hide();
              this.swapAlerts('Please check Batch (' + btch + ') in the uploaded file.!', '');
              this.fileReset();
              return false;
            }
          }
        });
        //this.exlsJson = [];
        this.spinner.hide();

      }
      reader.readAsBinaryString(file);
    } else {
      this.spinner.hide();
    }


  }

  fileReset() {
    this.csvReader.nativeElement.value = "";
    this.finalExcelJson = [];
  }

  updateTimeEntry(con) {
    console.log('Time ENtry Obj -->', this.entrydate);
  
    this.timeBtn = false;
    if (this.entrydate == undefined) {
      this.swapAlerts('Please Select Date to Time Entry.!', 'swal2-warning');
      this.timeBtn = true;
      this.spinner.hide();
      return false;
    } else {
      var temp = new Date(this.entrydate.year, this.entrydate.month - 1, this.entrydate.day);

      temp.setDate(temp.getDate());
      var temp2 = temp.getTime();
      var d = new Date();
      d.setDate(d.getDate() - 2);
      var d2 = d.getTime();
      // if(temp2 < d2){
      //   this.swapAlerts('Selected date should not be less than yesterday.!', 'swal2-warning');
      // }
      this.timeBtn = true;
    }
    //return false;
    this.spinner.show();

    var userId = localStorage.getItem('LoginId');
    var stepname = this.stSearchFm.get('stepname').value;
    var shift = this.stSearchFm.get('shift').value;
    //var sid = this.userSteps.map(function(e) { return e.step_id; }).indexOf(stepname);
    var ind = this.userSteps.findIndex(x => x.step_id == stepname);


    // if(this.userSteps.length > ind){
    //   var curStepInfo = this.userSteps[ind + 1];
    // }else{
    //   var curStepInfo = this.userSteps[ind];
    // }

    if (this.entrydate != undefined) {
      var fdt = this.entrydate.year + '-' + this.entrydate.month + '-' + this.entrydate.day
      var selDate = new Date(fdt);
      var fdt2 = this.formatDate2(selDate);

      var apiObj = {
        "timeList": [],
        "userid": (parseInt(userId)).toString(),
        "date": fdt2
      }

     
    }
    console.log("Time Entry Obj --->", this.timeentryReport);
    //var chkrsp = this.chkAllOption;
    var cuValidation=""
    this.timeentryReport.forEach(x => {
      if (x.timeentry.toString() != '' && x.chk == 'Yes' && x.tstatus.toString() != '') {
       // cuValidation=""
        var Entryhours = this.newTimeConvert2(x.timeentry);
        var nextStep = '9';
        var nexStepName = "End of Process";
        var currStep = '0';
        var currStepName = '';
        var prevStepid = '0';
        var prevStepName = '';
        
        console.log('Testing steps-->', this.userSteps);
        console.log('Tsting steps seq -->', this.userStepsSeq);
        this.userStepsSeq.forEach((y, indx) => {
          //console.log('Testing-->',x)
          if (y.step_id == this.stSearchFm.value.stepname) {
            //alert(x.tstatus.toString().toLowerCase())
            if (x.tstatus.toString().toLowerCase() == 'Comp'.toLowerCase()) {
              console.log(this.userStepsSeq[indx + 1])
              // if(this.userStepsSeq[indx].step_id == 8){
              //   nextStep = '9';
              //   nexStepName = "End of Process";
              //   currStep    = this.userStepsSeq[indx].step_id;
              //   currStepName= this.userStepsSeq[indx].step_name;
              // }else
              if (this.userStepsSeq[indx + 1]) {
                // alert('Part 1'+  this.userStepsSeq[indx+1].step_id)
                currStep = this.userStepsSeq[indx].step_id;
                currStepName = this.userStepsSeq[indx].step_name;

                if (currStep == '6' && x.w_name == "Energy Midstream") {
                  nextStep = '9';
                  nexStepName = "End of Process";
                } else {
                  let cnt = ind + 1;

                  if (this.userStepsSeq[cnt].step_name.includes('Rework_to_Production') && x.tstatus == 'COMP') {
                    cnt = cnt + 1;
                    if (this.userStepsSeq[cnt]?.step_name && this.userStepsSeq[cnt].step_name.includes('Rework_to_QC')) {
                      cnt = cnt + 1;
                    }
                  } else if (this.userStepsSeq[cnt]?.step_name.includes('Rework_to_QC') && x.tstatus == 'COMP') {
                    cnt = cnt + 1;
                  }
                  //console.log('Final Step ------------------------>', cnt);
                  //console.log(this.userStepsSeqSeq[cnt]);

                  if (this.userStepsSeq[cnt]) {
                    nextStep = this.userStepsSeq[cnt].step_id;
                    nexStepName = this.userStepsSeq[cnt].step_name;
                  } else {
                    nextStep = '9';
                    nexStepName = "End of Process";
                  }

                  console.log('Currnt Step -->', currStep, '-', currStepName);
                  console.log('Next Step -->', nextStep, '-', nexStepName);

                }

              } else {
                //console.log('Else...');
                //alert('Part 2'+  this.userStepsSeq[indx].step_id)
                currStep = this.userStepsSeq[indx].step_id;
                currStepName = this.userStepsSeq[indx].step_name;
                nextStep = '9';
                nexStepName = "End of Process";
              }
            }

            if (this.userStepsSeq[indx - 1]) {
              let cnt = indx - 1;

              if (this.userStepsSeq[cnt].step_name.includes('Rework_to_Production') && x.tstatus == 'COMP') {
                cnt = cnt - 1;
                if (this.userStepsSeq[cnt]?.step_name && this.userStepsSeq[cnt].step_name.includes('Rework_to_QC')) {
                  cnt = cnt - 1;
                }
              } else if (this.userStepsSeq[cnt]?.step_name.includes('Rework_to_QC') && x.tstatus == 'COMP') {
                cnt = cnt - 1;
              } else if (this.userStepsSeq[cnt]?.step_name.includes('Rework to Data Capture (1-12)') && x.tstatus == 'COMP') {
                if (this.userStepsSeq[cnt - 1])
                  cnt = cnt - 1;
              } else if (this.userStepsSeq[cnt]?.step_name.includes('Rework to Data Capture (13-14)') && x.tstatus == 'COMP') {
                if (this.userStepsSeq[cnt - 1])
                  cnt = cnt - 1;
              } else {
                cnt = -1;
              }

              if (this.userStepsSeq[indx - 1]) {
                prevStepid = this.userStepsSeq[indx - 1].step_id;
                prevStepName = this.userStepsSeq[indx - 1].step_name;
              } else {
                prevStepid = '1';
                prevStepName = 'Yet to Start';
              }

            } else {
              prevStepid = '1';
              prevStepName = 'Yet to Start';
            }

            if (x.tstatus.toString().toLowerCase() == 'Pend'.toLowerCase()) {
              currStep = this.userStepsSeq[indx].step_id;
              currStepName = this.userStepsSeq[indx].step_name;
            }
          }

        });

        
        //Energy logs custom entities
        if (x.workstream==4 && x.service == 38) { 
          if(x.tstatus=="COMP"){
            //var totEntities=Number(x.balance_entities)+Number(x.cusEntities)
            if(Number(x.balance_entities)!=Number(x.cusEntities) || Number(x.cusEntities)==0 || x.cusEntities==""){                           
              cuValidation="found"              
            }  
          }
          else if(x.tstatus=="PEND"){
            //var totEntities=Number(x.balance_entities)+Number(x.cusEntities)
            if(Number(x.cusEntities)==0 || (Number(x.cusEntities)>=Number(x.balance_entities)) || x.cusEntities==""){                           
              cuValidation="pend found"              
            }  
          }
        }
        var vEntities="";
        if (x.workstream.toString()==4 && x.service.toString() == 38 ) {
          vEntities=x.cusEntities;
        }
        else{
          vEntities=x.total_kms.toString()
        }
           var obj = {
            "workstream": x.workstream.toString(),
            "service": x.service.toString(),
            "state": x.batch.toString(),
            "record": x.map.toString(),
            "recordtype": x.map_type.toString(),
            "receiveddate": x.inst_date,
            "time": Entryhours.toString(),
            "status": x.tstatus.toString(),
            "remarks": x.tremarks.toString(),
            "chk": x.chk,
            "curStepid": currStep.toString(),
            "curStepName": currStepName,
            "nextStepid": nextStep.toString(),
            "nextStepName": nexStepName,
            "prevStepid": prevStepid,
            "prevStepName": prevStepName,
            "glid": (localStorage.getItem('glid')).toString(),
            "taskManager": (localStorage.getItem('taskManagerId')).toString(),
            "shift": this.sltshift,
            "entities": vEntities,//x.cusEntities,//x.total_kms.toString(),
            "runs": x.runs,
            "folder": x.folder_name,
            "type_of_map": x.type_of_map,                      
            "balance_entities":Number(x.balance_entities)-Number(vEntities)//Number(x.cusEntities)
          }
  
        apiObj.timeList.push(obj)
      }
    });

    console.log('Finalllllllll ---->', apiObj);
  //  return;
    if (apiObj?.timeList.length != 0) {
       var cha = 0;
      apiObj?.timeList.forEach(e => {
        if(e.type_of_map == '' && e.workstream == 2 && e.service == 31 &&
         (e.state == 187 || e.state == 180 || e.state ==184 || e.state == 179 || e.state == 193 ||
          e.batch == 187 || e.batch == 180 || e.batch ==184 || e.batch == 179 || e.batch == 193)) {
          this.swapAlerts('Please Select Type of map.!', 'swal2-warning');
          this.spinner.hide();
          cha = 1;
       }
        
      });
      if(cha == 1)
        return;
     }
   if(cuValidation=="pend found") {
      this.swapAlerts('Cu-Entities and Ba-Entities should Not be equal for PEND records.', 'swal2-warning');
      this.spinner.hide();
      return;
   }
   else if(cuValidation=="found") {
    this.swapAlerts('Cu-Entities and Ba-Entities should be equal for COMP records.', 'swal2-warning');
    this.spinner.hide();
    return;
 }
   else if (apiObj?.timeList.length == 0) {
      this.swapAlerts('Please enter atleast one map.!', 'swal2-warning');
      this.spinner.hide();
    }  
     
    else {
      console.log("Final Time Entry Obj -->", apiObj);
      var rmCount = 0;
      
      if (apiObj.timeList.length > 0) {
        apiObj.timeList.forEach(y => {        
          //alert(parseInt(y.time))
          if (parseInt(y.time) > 9.0) {
            rmCount = 1;
          }
        });
      }
      this.spinner.hide();
      if(cuValidation==""){
        if (rmCount == 1) {
          this.postTimeentry(apiObj);
        } else {
          this.postTimeentry(apiObj);
        }
      }
        
      
      
    }
    //this.spinner.hide();
  }

  updateTimeEntryF(con) {
    console.log('Time ENtry Obj 2-->', this.entrydate);
    var objTotBatchQA = [];
    var objTotBatchQAFinal = {
      "BatchQAbulkl": [],
      "empid": '',
      "Sampled": 0,
      "date": '',
      "Batchname": '',
    }

    this.timeBtn = false;
    if (this.entrydate == undefined) {
      this.swapAlerts('Please Select Date to Time Entry.!', 'swal2-warning');
      this.timeBtn = true;
      this.spinner.hide();
      return false;
    } else {
      var temp = new Date(this.entrydate.year, this.entrydate.month - 1, this.entrydate.day);

      temp.setDate(temp.getDate());
      var temp2 = temp.getTime();
      var d = new Date();
      d.setDate(d.getDate() - 2);
      var d2 = d.getTime();
      // if(temp2 < d2){
      //   this.swapAlerts('Selected date should not be less than yesterday.!', 'swal2-warning');
      // }
      this.timeBtn = true;
    }
    //return false;
    this.spinner.show();

    var userId = localStorage.getItem('LoginId');
    var stepname = this.stSearchFm.get('stepname').value;
    var shift = this.stSearchFm.get('shift').value;
    //var sid = this.userSteps.map(function(e) { return e.step_id; }).indexOf(stepname);
    var ind = this.userSteps.findIndex(x => x.step_id == stepname);

    //retrieve batc QA number 


    if (this.entrydate != undefined) {
      var fdt = this.entrydate.year + '-' + this.entrydate.month + '-' + this.entrydate.day
      var selDate = new Date(fdt);
      var fdt2 = this.formatDate2(selDate);

      var apiObj = {
        "timeList": [],
        "userid": (parseInt(userId)).toString(),
        "date": fdt2

      }

      var rowObj = [];
      // console.log("Time Entry Obj --->", this.timeentryReport);
      // return;

      //bhuvana
      if (this.batchQA) {
        var itimeCheck = 0;
        this.getBatchNumber(this.stSearchFm.get('wsname').value);///issue check with team on monday        
        this.timeentryReport.forEach(x => {
          if (x.timeentry.toString() == '' && x.chkBox == true) {
            itimeCheck = itimeCheck + 1;

          }
        });
        if (itimeCheck > 0) {
          Swal.fire({ text: "Please update time for complete Batch", icon: 'warning' })
          this.spinner.hide();
          return;
        }
        this.spinner.show();
        this.timeentryReport.forEach(x => {
          if (x.timeentry.toString() != '' && x.chk == 'Yes' && x.tstatus.toString() == 'COMP' && x.chkBox == true) {
            var objBatchQA = {
              "workstream": x.workstream,
              "Area": x.service,
              "Batch": x.batch,
              "Typeofmap": x.map_type,
              "Map": x.map
            }
            objTotBatchQA.push(objBatchQA);
          }

        });

        objTotBatchQAFinal = {
          "BatchQAbulkl": objTotBatchQA,
          "Sampled": this.percent,
          "empid": localStorage.getItem('CorpId'),
          "date": fdt2,
          "Batchname": this.batchQANumber,
        }

        if (this.seqType == 'seq' && this.percent > 0) {
          this.iPerval = Math.round((this.timeentryReport.length * this.percent) / 100)
        }
        if (this.iPerval != objTotBatchQAFinal.BatchQAbulkl.length) {
          Swal.fire({ text: "Percent & Batch QA Map selection is not matching.Please check...", icon: 'warning' })
          this.spinner.hide();
          return;
        }
        this.spinner.show();
      }
      else {
        this.batchQANumber = '';
      }
    }


    //var chkrsp = this.chkAllOption;
    //batchQANumber
    var cuValidation=""
    this.timeentryReport.forEach(x => {
      //cuValidation=""
      if (x.timeentry.toString() != '' && x.chk == 'Yes' && x.tstatus.toString() != '') {
        var Entryhours = this.newTimeConvert2(x.timeentry);
        var nextStep = '9';
        var nexStepName = "End of Process";
        var currStep = '0';
        var currStepName = '';
        var prevStepid = '0';
        var prevStepName = '';

        this.userSteps.forEach((y, indx) => {
          //console.log('Testing-->',x)
          if (y.step_id == this.stSearchFm.value.stepname) {
            //alert(x.tstatus.toString().toLowerCase())
            if (x.tstatus.toString().toLowerCase() == 'Comp'.toLowerCase()) {
              //console.log(this.userStepsSeq[indx+1])
              if (!this.userStepsSeq[indx + 1] && this.userSteps[indx].step_id == 8) {
                nextStep = '9';
                nexStepName = "End of Process";
                currStep = this.userSteps[indx].step_id;
                currStepName = this.userSteps[indx].step_name;
              } else if (this.userSteps[indx + 1]) {
                currStep = this.userSteps[indx].step_id;
                currStepName = this.userSteps[indx].step_name;

                if (currStep == '6' && x.w_name == "Energy Midstream") {
                  nextStep = '9';
                  nexStepName = "End of Process";
                } else {
                  let myind = indx;
                  if (this.userSteps[myind + 1] && this.userSteps[myind + 1].step_id == 5) {
                    let myind2 = myind + 1;
                    if (this.userSteps[myind2 + 1] && this.userSteps[myind2 + 1].step_id == 7) {
                      let myind3 = myind2 + 1
                      if (this.userSteps[myind3 + 1]) {
                        nextStep = this.userSteps[myind3 + 1].step_id;
                        nexStepName = this.userSteps[myind3 + 1].step_name;
                      } else {
                        nextStep = '9';
                        nexStepName = "End of Process";
                      }
                    } else {
                      if (this.userSteps[indx + 1]) {
                        nextStep = this.userSteps[indx + 1].step_id;
                        nexStepName = this.userSteps[indx + 1].step_name;
                      } else {
                        nextStep = '9';
                        nexStepName = "End of Process";
                      }
                    }
                  } else if (this.userSteps[indx + 1]) {
                    var cnt = indx + 1;
                    if (this.userSteps[cnt].step_name.includes('Rework_to_Production') && x.tstatus == 'COMP') {
                      cnt = cnt + 1;
                      if (this.userSteps[cnt].step_name.includes('Rework_to_QC')) {
                        cnt = cnt + 1;
                      }
                    } else if (this.userSteps[cnt].step_name.includes('Rework_to_QC') && x.tstatus == 'COMP') {
                      cnt = cnt + 1;
                    } else if (this.userSteps[cnt]?.step_name.includes('Rework to Data Capture (1-12)') && x.tstatus == 'COMP') {
                      if (this.userSteps[cnt + 1])
                        cnt = cnt + 1;
                    } else if (this.userSteps[cnt]?.step_name.includes('Rework to Data Capture (13-14)') && x.tstatus == 'COMP') {
                      if (this.userSteps[cnt + 1])
                        cnt = cnt + 1;
                    }

                    //console.log('Final Step ------------------------>', cnt);

                    if (this.userSteps[cnt]) {
                      nextStep = this.userSteps[cnt].step_id;
                      nexStepName = this.userSteps[cnt].step_name;
                    } else {
                      nextStep = '9';
                      nexStepName = "End of Process";
                    }
                  } else {
                    nextStep = '9';
                    nexStepName = "End of Process";
                  }

                }

              } else {
                //console.log('Else...');
                //alert('Part 2'+  this.userSteps[indx].step_id)
                currStep = this.userSteps[indx].step_id;
                currStepName = this.userSteps[indx].step_name;
                nextStep = '9';
                nexStepName = "End of Process";
              }
            }

            if (this.userSteps[indx - 1]) {
              var cnts = indx - 1;

              if (this.userSteps[cnts]?.step_name.includes('Rework to Data Capture (13-14)')) {
                cnts = cnts - 1;

                prevStepid = this.userSteps[cnts].step_id;
                prevStepName = this.userSteps[cnts].step_name;

              } else if (this.userSteps[cnts]?.step_name.includes('Rework to Data Capture (1-12)')) {
                cnts = cnts - 1;
                prevStepid = this.userSteps[cnts].step_id;
                prevStepName = this.userSteps[cnts].step_name;
              } else {
                prevStepid = this.userSteps[indx - 1].step_id;
                prevStepName = this.userSteps[indx - 1].step_name;
              }

            } else {
              prevStepid = '1';
              prevStepName = 'Yet to Start';
            }

            // if (x.tstatus.toString().toLowerCase() == 'Pend'.toLowerCase()) {
            //   currStep = this.userSteps[indx].step_id;
            //   currStepName = this.userSteps[indx].step_name;
            // }
            if (x.tstatus.toString().toLowerCase() == 'Pend'.toLowerCase()) {             

              currStep = this.userSteps[indx].step_id;

              currStepName = this.userSteps[indx].step_name;

              if(this.userSteps[indx+1] && this.userSteps[ind].step_id !=8){

                nextStep = this.userSteps[indx+1].step_id;

                nexStepName = this.userSteps[indx+1].step_name;

            }
          }
          }

        });

        var Entryhours = this.newTimeConvert2(x.timeentry);
        
        //Energy logs custom entities
        if (x.workstream==4 && x.service == 38) { 
          if(x.tstatus=="COMP"){
           // var totEntities=Number(x.balance_entities)+Number(x.cusEntities)
            if(Number(x.balance_entities)!=Number(x.cusEntities) || Number(x.cusEntities)==0 || x.cusEntities==""){                           
              cuValidation="found"              
            }  
          }
          else if(x.tstatus=="PEND"){
            //var totEntities=Number(x.balance_entities)+Number(x.cusEntities)
            if(Number(x.cusEntities)==0 || (Number(x.cusEntities)>=Number(x.balance_entities)) || x.cusEntities==""){                           
              cuValidation="pend found"              
            }  
          }
        }
        var vEntities="";
        if (x.workstream.toString()==4 && x.service.toString() == 38) {
          vEntities=x.cusEntities;
        }
        else{
          vEntities=x.entities
        }
        var feedbackList = {
          "acceptance": "Accepted",
          "workstream": x.workstream,
          "service": x.service,
          "batch": x.batch,
          "map": x.mid,
          "mapType": x.map_type,
          "step": currStep,
          "preStepId": prevStepid,
          "preStepName": prevStepName,
          "currStepId": currStep,
          "currStepName": currStepName,
          "nextStepID": nextStep,
          "nextStepName": nexStepName,
          "time": Entryhours,
          "time_status": x.tstatus,
          "timeEntry_date": fdt2,
          "time_shift": this.sltshift,
          "time_remarks": x.tremarks,
          "chk_status": x.chk,
          "chk_version": (this.checklistVersion == undefined ? 0 : this.checklistVersion),
          "wtg": 0,
          "actErrors": 0,
          "totalErros": 0,
          "qual_per": 100,
          "received_date": this.formatDate(x.inst_date),
          "entities": vEntities,//x.entities,
          "errRemakrs": '',
          "runs": x.runs,
          "folder": x.folder_name,
          "type_of_maps": x.type_of_map,
          "balance_entities":Number(x.balance_entities)-Number(vEntities)//Number(x.cusEntities)
        }

        rowObj.push(feedbackList)
      }

    });


    console.log(rowObj)
    if (rowObj.length != 0) {
      var cha = 0;
      rowObj.forEach(e => {
       if(e.type_of_maps == '' && e.workstream == 2 && e.service == 31 && (e.batch == 187 || e.batch == 180 || e.batch ==184 || e.batch == 179 || e.batch == 193)) {
         this.swapAlerts('Please Select Type of map.!', 'swal2-warning');
         this.spinner.hide();
         cha = 1;
      }
       
     });
     if(cha == 1)
       return;
    }
  
    if(cuValidation=="pend found") {
      this.swapAlerts('Cu-Entities and Ba-Entities should Not be equal for PEND records.', 'swal2-warning');
      this.spinner.hide();
      return;
   }
   else if(cuValidation=="found") {
    this.swapAlerts('Cu-Entities and Ba-Entities should be equal for COMP records.', 'swal2-warning');
    this.spinner.hide();
    return;
 }
   else if (rowObj.length == 0) {
      this.swapAlerts('Please enter atleast one map.!', 'swal2-warning');
      this.spinner.hide();
    }

    // if (rowObj.length == 0) {
    //   this.swapAlerts('Please enter atleast one map.!', 'swal2-warning');
    //   this.spinner.hide();
    // } 
    else {

      Swal.fire({
        title: "Are you sure.! Do you want to enter time sheet without Feedback.!",
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: 'Yes',
        denyButtonText: 'No',
        customClass: {
          actions: 'my-actions',
          confirmButton: 'order-2',
          denyButton: 'order-3',
        }
      }).then((result) => {


        if (result.isConfirmed) {
          var finalOb = {
            feedbackData: rowObj,
            logid: userId,
            Batchnumber: this.batchQANumber
          }

          var urlPath = 'Feedback/FeedbackTimeEntry2';

          // console.log('Odd Testing -->',finalOb);
          // return

          this.Apiservice.postmethod(urlPath, finalOb).subscribe((data: any) => {
            console.log('Time entry Feeback Resp-->', data);
            this.globalConst.checkOriginAccess(data);

            if (data == null || data == 'null') {
              this.spinner.hide();
              Swal.fire({ text: "Failed to Insert Feedback!", icon: 'error' });
            } else {
              if (data.length == 0) {
                //bhuvana
                if (objTotBatchQAFinal.Batchname.length > 0 && objTotBatchQAFinal.BatchQAbulkl.length > 0) {
                  this.Apiservice.postmethod('Feedback/BatchQA_Insertion', objTotBatchQAFinal).subscribe((data: any) => {
                    console.log('Batch QA insertion-->', data);
                    this.globalConst.checkOriginAccess(data);
                  });///batch QA insertion
                }

                this.spinner.hide();
                this.onSubmit();
                Swal.fire({ text: "Feedback Submited Successfullly!", icon: 'success' }).then(function () {
                  //this.fileReset();
                });

              } else {
                var htmlbody = `<h6>Update failed.!</h6><br>
                <center>
                <table  id="table" border=1 class="table m-0 custmTbl" style="font-size:9px;font-weight:bold">
                <thead class="thead-dark">
                    <tr>
                        <th>Map</th>
                        <th>Date</th>
                        <th>Step</th>
                        <th>Error</th>
                    </tr>
                </thead>
                <tbody>`;
                for (var x = 0; x < data.length; x++) {
                  console.log('Dt --->', data[x]?.map);
                  htmlbody = htmlbody + `<tr>`
                    + `<td>` + data[x]?.map + `</td>`
                    + `<td>` + data[x]?.date + `</td>`
                    + `<td>` + data[x]?.step + `</td>`
                    + `<td>` + data[x]?.errorType + `</td>`
                    + `</tr>`
                }
                htmlbody = htmlbody + `</tbody>
                </table>
                </center>`;
                this.spinner.hide();
                Swal.fire({ html: htmlbody, text: "Insertion Failed !", icon: 'error', width: '600px' });
              }
            }

          });
        } else {
          this.spinner.hide();
        }
      });


    }

  }


  //Check all
  chkMeAll(ev) {
    //alert(ev.target.checked)
    var chkvl;
    this.spinner.show();

    const stepname = this.stSearchFm.get('stepname').value;

    var userId = localStorage.getItem('LoginId');

    if (ev.target.checked) {
      this.Apiservice.get('Checklist/GetCheckList?workstream=' + this.timeentryReport[0].workstream + '&services=' + this.timeentryReport[0].service + '&state=' + this.timeentryReport[0].batch + '&empId=' + userId + '&stepId=' + stepname).subscribe(data => {
        console.log('Check List resp 1-->', data)
        this.globalConst.checkOriginAccess(data);

        if (data.length > 0 && data[0]['approvedCheckList']) {
          //alert(stepId)
          if (data.length > 0 && data[0].approvedCheckList && data[0].approvedCheckList.length > 0) {

            if (this.chkAllOption) {
              chkvl = (this.chkAllOption == true ? 'Yes' : 'No');
            } else {
              chkvl = (this.chkAllOption == true ? 'Yes' : 'No');
            }

            this.timeentryReport.forEach(element => {
              element.chk = chkvl;
            });
          } else {

            Swal.fire({ text: "No Checklist available !", icon: 'warning' }).then(function () {

            });

            chkvl = 'No'
            this.chkAllOption = false;

            this.timeentryReport.forEach(element => {
              element.chk = chkvl;
            });

            this.spinner.hide();
            return false;
          }
        }
        this.spinner.hide();
      }, error => {
        console.log('Error -->', error)
      });
    } else {

      chkvl = 'No'
      this.chkAllOption = false;

      this.timeentryReport.forEach(element => {
        element.timeentry = '';
        element.cusEntities = '';
        element.chk = chkvl;
      });

      this.spinner.hide();
    }

    console.log('Sample Resp --->', this.timeentryReport)
  }

  formatDate2(date) {
    var year = date.getFullYear().toString();
    var month = (date.getMonth() + 101).toString().substring(1);
    var day = (date.getDate() + 100).toString().substring(1);
    return year + "-" + month + "-" + day + ' 00:00:00.000';
  }

  postTimeentry(obj) {
    console.log('Post Obj -->', obj)
    //return;
    this.spinner.show();
    this.timeBtn = false;
    this.Apiservice.postmethod('TimeEntry/BulkSaveTimeentry', obj).subscribe((data: any) => {
      console.log('Time entry Resp-->', data);
      this.globalConst.checkOriginAccess(data);

      if (data && data.length == 0) {
        this.spinner.hide();
        Swal.fire({ text: "Submited Successfullly!", icon: 'success' }).then(function () {
          //this.fileReset();
        });
        this.onSubmit();
      } else if (data && data.length > 0) {

        var htmlbody = `<h6>Below Time Enter details are not Update.!</h6><br>
              <center>
              <table  id="table" border=1 class="table m-0 custmTbl" style="font-size:9px;font-weight:bold">
              <thead class="thead-dark">
                  <tr>
                      <th>Record</th>
                      <th>Status</th>
                      <th>Step</th>
                      <th>Remarks</th>
                  </tr>
              </thead>
              <tbody>`;
        for (var x = 0; x < data.length; x++) {
          console.log('Dt --->', data[x]?.map);
          htmlbody = htmlbody + `<tr>`
            + `<td>` + data[x]?.record + `</td>`
            + `<td>` + data[x]?.status + `</td>`
            + `<td>` + data[x]?.step + `</td>`
            + `<td>` + data[x]?.remarks + ' Record' + `</td>`
            + `</tr>`
        }
        htmlbody = htmlbody + `</tbody>
              </table>
              </center>`;
        this.onSubmit();
        this.spinner.hide();
        Swal.fire({ html: htmlbody, text: "Insertion Failed !", icon: 'error', width: '600px' });

      } else {
        this.spinner.hide();
      }
    });
  }


  postTimeentryFeedback(obj) {
    console.log('Sample Obj -->', obj)
    //return;
    //this.spinner.show();
    this.timeBtn = false;
    this.Apiservice.postmethod('TimeEntry/BulkSaveTimeentry', obj).subscribe((data: any) => {
      console.log('Time entry Resp-->', data);
      this.globalConst.checkOriginAccess(data);


      if (data.length == 0) {
        //this.spinner.hide();
        // Swal.fire({text: "Submited Successfullly!",icon: 'success'}).then(function() {
        //   //this.fileReset();
        // });
        return true;
      } else if (data.length > 0) {
        return false;
      }
    });
  }




  //GetKeys Column values
  getKey(item, ky) {
    //console.log('Ky 1--->', item);
    var rep = ky.toLowerCase().trim();
    let entries = Object.entries(item)
    let data = entries.map(([key, val]) => {
      var lpkey = key.toString().trim();
      if (lpkey.toLowerCase() == rep) {
        if (val != null) {
          var rtn = (val).toString();
          return rtn;
        }
      }
    });
    var rslt = data.filter(i => i);
    return rslt[0];
  }

  saveBulkData() {
    this.spinner.show();
    // if (this.bentrydate == undefined) {
      // this.swapAlerts('Please Select Date to Time Entry.!', 'swal2-warning');
      // this.spinner.hide();
      // return false;
    // } else {
      // var temp = new Date(this.bentrydate.year, this.bentrydate.month - 1, this.bentrydate.day);
      // temp.setDate(temp.getDate());
      // var temp2 = temp.getTime();
      // var d = new Date();
      // d.setDate(d.getDate() - 2);
      // var d2 = d.getTime();
      // // if(temp2 < d2){
      // //   this.swapAlerts('Selected date should not be less than yesterday.!', 'swal2-warning');
      // //   this.spinner.hide();
      // // }
    // }

    var userId = localStorage.getItem('LoginId');
    // var stepname = this.stSearchFm.get('stepname').value;
    // var selDate = new Date(this.bentrydate.year, this.bentrydate.month - 1, this.bentrydate.day);
	let yourDate = new Date();
    yourDate.toISOString().split('T')[0]
    var apiObj = {
      "finalmapsList": [],
      "empid": parseInt(userId),
      "Currentdate": this.formatDate(yourDate)
      //"CurrStepId"  : 2
    }

    var filterObj = [];
    var mainAry = [];
    var selRec = [];

    
    console.log('Final Obj -->',this.finalExcelJson);
    this.finalExcelJson.forEach(re => {
      let temp = re.Record;
      re.Record = (temp).trim();
    })
    console.log('Final Obj -->',this.finalExcelJson);
    //return;
    this.finalExcelJson.forEach(x => {

      const wrkresp = this.allMasterInfo.filter(function (y) { return y['w_name'] == x.Workstream });

      const serresp = this.allMasterInfo.filter(function (y) { return (y['w_name'] == x.Workstream && y['service_name'] == x.Service) });

      const btresp = this.allMasterInfo.filter(function (y) { return (y['w_name'] == x.Workstream && y['service_name'] == x.Service && y['batch_name'] == x['Sub Service']) });
      console.log(wrkresp)
      console.log(serresp)
      console.log(btresp)
      console.log(this.allMasterInfo)
      let entries = Object.entries(x)
      //console.log('Total Entries --->', x);
      console.log('Steps -->', this.bulkSteps)
      var sptsObj = this.bulkSteps;
      this.bulkSteps.forEach((y, ind) => {
        var prop_by = y.step_name + '_by';
        var prop_date = y.step_name + '_date';
        var prop_shift = y.step_name + '_shift';
        var prop_status = y.step_name + '_status';
        var prop_time = y.step_name + '_time';
        var prop_remarks = y.step_name + '_remarks';

        var exists = Object.keys(x).some(function (k, inx) {
          if (inx > 7) {
            console.log('Test Sample key--->', k )
            var newstp = k.replace('_by', '');


            // console.log('Step filter 1-->', k.toLowerCase());
             console.log('Step filter 2-->', prop_by.toLowerCase());
            if (k.toLowerCase() === prop_by.toLowerCase()) {
             
              if (x[prop_by] != '' && x[prop_date] != '' && x[prop_shift] != '' && x[prop_status] != '' && x[prop_time] != '') {
                var stp = k.replace('_by', '').replace('_date', '').replace('_shift', '').replace('_status', '').replace('_time', '').replace('_remarks', '')
                    
                var stepinfo = sptsObj.filter((x, ind) => {
                  return x.step_name == stp
                });

                var nextStepId;
                var nextStepName;
                var preStepId;
                var preStepName;

                // if(!sptsObj[ind+1] && sptsObj[ind].step_id == 8){
                //   nextStepId = 9;
                //   nextStepName = "End of Process";
                //   // currStep    = sptsObj[ind].step_id;
                //   // currStepName= sptsObj[ind].step_name;

                // }else
                //  console.log('Steps -->', sptsObj);
                //  console.log('Record Step -->', stp);
                if (sptsObj[ind + 1]) {

                  // var cnt = ind+1;
                  // if(sptsObj[cnt].step_name.includes('Rework_to_Production') && x.Step_status == 'COMP'){
                  //   cnt = cnt+1;
                  //   if(sptsObj[cnt].step_name.includes('Rework_to_QC')){
                  //     cnt = cnt+1;
                  //   }
                  // }else if(sptsObj[cnt].step_name.includes('Rework_to_QC') && x.Step_status == 'COMP'){
                  //     cnt = cnt+1;
                  // }

                  // console.log('My Step -->',cnt, sptsObj[cnt])
                  // if(sptsObj[cnt]){
                  //   nextStepId = sptsObj[cnt].step_id;
                  //   nextStepName = sptsObj[cnt].step_name;
                  // }else{
                  //   nextStepId = 9;
                  //   nextStepName = "End of Process";
                  // }

                  let cnt = ind + 1;
                  if (sptsObj[cnt] && sptsObj[cnt].step_name.includes('Rework_to_Production') && x.prop_status == 'COMP') {
                    cnt = cnt + 1;
                    if (sptsObj[cnt].step_name.includes('Rework_to_QC')) {
                      cnt = cnt + 1;
                    }
                  } else if (sptsObj[cnt] && sptsObj[cnt].step_name.includes('Rework_to_QC') && x.prop_status == 'COMP') {
                    cnt = cnt + 1;
                  }


                  if (sptsObj[cnt] && sptsObj[cnt].step_name != 'Rework_to_Production') {
                    nextStepId = sptsObj[cnt].step_id;
                    nextStepName = sptsObj[cnt].step_name;
                  } else if (sptsObj[cnt] && sptsObj[cnt].step_name == 'Rework_to_Production') {
                    cnt = cnt + 1;

                    if (sptsObj[cnt] && sptsObj[cnt].step_name != 'Rework_to_QC') {
                      nextStepId = sptsObj[cnt].step_id;
                      nextStepName = sptsObj[cnt].step_name;
                    } else if (sptsObj[cnt] && sptsObj[cnt].step_name == 'Rework_to_QC') {
                      cnt = cnt + 1;
                      if (sptsObj[cnt]) {
                        nextStepId = sptsObj[cnt].step_id;
                        nextStepName = sptsObj[cnt].step_name;
                      } else {
                        nextStepId = '9';
                        nextStepName = "End of Process";
                      }
                    }

                  } else {
                    nextStepId = '9';
                    nextStepName = "End of Process";
                  }
                } else {
                  nextStepId = 9;
                  nextStepName = "End of Process";
                }


                if (sptsObj[ind - 1]) {
                  preStepId = sptsObj[ind - 1].step_id;
                  preStepName = sptsObj[ind - 1].step_name;
                } else {
                  preStepId = '1';
                  preStepName = 'Yet to Start';
                }


                //console.log('My Step -->',nextStepId, nextStepName)
                console.log(btresp[0].bid)
                var everySingle = {
                  "workstream": wrkresp[0].wid,
                  "region": 0,
                  "service": serresp[0].sid,
                  "state": btresp[0].bid,
                  "Record": x.Record,
                  "RecordType": x.RecordType,
                  "Entities": x['No of Units'],
                  "Step_id": stepinfo[0]?.step_id,
                  "Step_by": x[prop_by],
                  "Step_date": x[prop_date],
                  "Step_shift": x[prop_shift],
                  "Step_status": x[prop_status],
                  "Step_time": x[prop_time],
                  "Step_remarks": x[prop_remarks],
                  "NextStep_id": nextStepId,
                  "NextStep_Name": nextStepName,
                  "PrevStep_id": preStepId,
                  "PrevStep_Name": preStepName,
                  "glid": "",
                  "taskManager": "",
                };

                console.log('---------------------- Break -----------------------')
                // console.log(everySingle)
                mainAry.push(everySingle);
              }
            }
          }
        });
        //console.log('Sample --->',exists);

      });


    });


    // console.log("Result fine--->", mainAry);
    // return false;
  console.log(this.finalExcelJson)
 // return

    if (this.finalExcelJson.length == 0) {
      this.swapAlerts('Please enter atleast one map.!', 'swal2-warning');
      this.spinner.hide();
    } else {
      console.log("Final Time Entry Obj -->", this.finalExcelJson);
      //apiObj.finalmapsList = this.finalExcelJson;
      apiObj.finalmapsList = mainAry;
      //console.log('Steps --->', this.userSteps)
      console.log('Final Obk--->', apiObj);
      // return;
      this.Apiservice.postmethod('TimeEntry/BulkSaveFinalMaps', apiObj).subscribe((data: any) => {
        console.log('Time entry Resp-->', data);
        this.globalConst.checkOriginAccess(data);

        var resp = data;
        if (data == null) {
          this.spinner.hide();
          Swal.fire({ text: "Failed to Update maps due to invalid input values.!", icon: 'warning' });
          return false;
        }
        if (data.length == 0) {
          this.spinner.hide();
          Swal.fire({ text: "Submited Successfullly!", icon: 'success' }).then(function () {
            //this.fileReset();
          });
        } else {
          var htmlbody = `<h6>Below Time Enter details are Updated.!</h6><br>
              <center>
              <table  id="table" border=1 class="table m-0 custmTbl" style="font-size:9px;font-weight:bold">
              <thead class="thead-dark">
                  <tr>
                      <th>Record</th>
                      <th>Date</th>
                      <th>Step</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Remarks</th>
                  </tr>
              </thead>
              <tbody>`;
          for (var x = 0; x < data.length; x++) {
            console.log('Dt --->', data[x]?.map);
            htmlbody = htmlbody + `<tr>`
              + `<td>` + data[x]?.record + `</td>`
              + `<td>` + (this.getFilteredDate(data[x]?.date)) + `</td>`
              + `<td>` + data[x]?.step + `</td>`
              + `<td>` + data[x]?.time + `</td>`
              + `<td>` + data[x]?.status + `</td>`
              + `<td>` + data[x]?.remarks + `</td>`
              + `</tr>`
          }
          htmlbody = htmlbody + `</tbody>
              </table>
              </center>`;
          this.spinner.hide();
          Swal.fire({ html: htmlbody, text: "Insertion Failed !", icon: 'warning', width: '1000px' });
        }
      });
    }
  }


  //Format Date
  getFilteredDate(dt) {
    var dts = new Date(dt)
    var year = dts.getFullYear().toString();
    var month = (dts.getMonth() + 101).toString().substring(1);
    var day = (dts.getDate() + 100).toString().substring(1);
    return year + "-" + month + "-" + day;
  }

  //Format Date
  formatDate(date) {

    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;

    return [year, month, day].join('-');
  }

  //Sweet Alert
  swapAlerts(msg, icon) {
    return Swal.fire({
      icon: 'warning', title: '', text: msg,
      customClass: {
        confirmButton: 'btn btn-danger',
      },
      buttonsStyling: false
    }).then(function () {
      return false;
    });
  }


  //Open Remarks Model
  openRemarks() {
    const modalRef = this.modalService.open(RemarksComponent,
      {
        scrollable: true, windowClass: 'myCustomModalClass', size: 'lg'
      },);

    modalRef.componentInstance.fromParent = '';
    modalRef.result.then((result) => {
      //this.spinner.show();
      console.log('Check List Response--->', result);

    }, (reason) => {

    });
  }

  // This function is used in open
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  //Check List Modal
  openModal(rowdt, ind, stp) {
    const modalRef = this.modalService.open(ChecklistmodalComponent,
      {
        scrollable: true, windowClass: 'myCustomModalClass', size: 'lg'
      },);
    var revDtOb = {
      rowind: ind,
      rowstp: stp,
      rowdt: rowdt
    }
    modalRef.componentInstance.fromParent = revDtOb;
    modalRef.result.then((result) => {
      this.spinner.show();
      //console.log('Check List Response--->', result);
      var mainind = result.mainind;
      if (result && result.mainrow.chk == 'Yes') {
        this.timeentryReport[mainind].chk = result.mainrow.chk;
        this.checklistVersion = result.rowchklist[0].version;
        this.spinner.hide();
      } else {
        var cnt = 0;
        // this.timeentryReport.forEach(element => {
        //     if(element.chk == 'Yes'){
        //       cnt = cnt + 1;
        //     }
        // });

        var bar = new Promise<void>((resolve, reject) => {
          this.timeentryReport.forEach((itm, index, array) => {
            console.log(itm);
            if (itm.chk == 'Yes') {
              cnt = cnt + 1;
            };
            resolve();
          });
        });

        bar.then(() => {
          if (cnt == 0) {
            this.chkAllOption = false;

            this.timeentryReport.forEach(element => {
              element.chk = 'No';
            });

          } else {
            this.timeentryReport[mainind].timeentry = '';
            this.timeentryReport[mainind].tremarks = '';
          }
        });

        this.spinner.hide();
      }
      this.timeentryCal('N', 'none');
    }, (reason) => {
    });
    
  }

 

  //Feedback Errors List Details
  openFeedbackErrorsModal(rowdt, ind) {
    console.log(rowdt)
    if(rowdt.feedback_type=='Internal'){
    this.getSteps(rowdt.workstream, rowdt.service, rowdt.batch);
    const modalRef = this.modalService.open(FeedbackErrorListComponent,
      {
        scrollable: true, windowClass: 'myCustomModalClass', size: 'lg'
      },);

    var revDtOb = {
      rowind: ind,
      rowdt: rowdt,
      userTyp: 'User'
    }

    var cdate = new Date();

    var fdt = cdate.getFullYear() + '-' + (cdate.getMonth() + 1) + '-' + cdate.getDate();
    var selDate = new Date(fdt);
    var fdt2 = this.formatDate2(selDate);
    var userId = localStorage.getItem('LoginId');

    var apiObj = {
      "timeList": [],
      "userid": (parseInt(userId)).toString(),
      "date": fdt2
    }
    
    modalRef.componentInstance.fromParent = revDtOb;
    modalRef.result.then((result) => {
      console.log('Model Result --->', result)
      
      //var rowdt = rowdt;
      if (result.recordStatus && result.recordStatus == 'Ok') {
        this.spinner.show();
        console.log('Post value ', rowdt);

        var Entryhours = this.newTimeConvert(result.timeentry);
        var nextStep = '9';
        var nexStepName = "End of Process";
        var currStep = '0';
        var currStepName = '';
        var prevStepid = '0';
        var prevStepName = '';
        console.log(this.userSteps)
        this.userSteps.forEach((y, indx) => {
          //console.log('Testing-->',x)
          if (y.step_name == rowdt.feedbackForStep_name) {
            //alert(x.tstatus.toString().toLowerCase())

            if (this.userSteps[indx]) {
              // alert('Part 1'+  this.userSteps[indx+1].step_id)
              if (this.userSteps[indx].step_name == 'Production' && rowdt.feedbackForStep_name == 'Production') {
                currStep = '5';
                currStepName = 'Rework_to_Production';

                // if(this.userSteps[indx-1]){
                //   prevStepid  = rowdt.feedbackForStep.toString()
                //   prevStepName = rowdt.feedbackForStep_name;
                // }else{
                //   prevStepid  = '1';
                //   prevStepName = 'Yet to Start';
                // }

                prevStepid = rowdt.feedbackForStep.toString()
                prevStepName = rowdt.feedbackForStep_name

                if (this.userSteps[indx + 1].step_name.includes('QC')) {
                  nextStep = this.userSteps[indx + 1].step_id.toString();
                  nexStepName = this.userSteps[indx + 1].step_name;
                }
              } else if (this.userSteps[indx].step_name == 'QC' && rowdt.feedbackForStep_name == 'QC') {
                currStep = '7';
                currStepName = 'Rework_to_QC';

                if (this.userSteps[indx - 1]) {
                  prevStepid = this.userSteps[indx - 1].step_id;
                  prevStepName = this.userSteps[indx - 1].step_name;
                } else {
                  prevStepid = '1';
                  prevStepName = 'Yet to Start';
                }

                if (this.userSteps[indx + 1].step_name.includes('QA')) {
                  nextStep = this.userSteps[indx + 1].step_id;
                  nexStepName = this.userSteps[indx + 1].step_name;
                }
              } else if (this.userSteps[indx].step_name == 'Data Capture (13-14)' && rowdt.feedbackForStep_name == 'Data Capture (13-14)') {
                currStep = '215';
                currStepName = 'Rework to Data Capture (13-14)';

                if (this.userSteps[indx - 1]) {
                  prevStepid = this.userSteps[indx - 1].step_id;
                  prevStepName = this.userSteps[indx - 1].step_name;
                } else {
                  prevStepid = '182';
                  prevStepName = 'Data Capture (13-14)';
                }

                nextStep = '103';
                nexStepName = 'QC (13-14)';
              } else if (this.userSteps[indx].step_name == 'Data Capture (1-12)' && rowdt.feedbackForStep_name == 'Data Capture (1-12)') {
                currStep = '214';
                currStepName = 'Rework to Data Capture (1-12)';

                if (this.userSteps[indx - 1]) {
                  prevStepid = this.userSteps[indx - 1].step_id;
                  prevStepName = this.userSteps[indx - 1].step_name;
                } else {
                  prevStepid = '181';
                  prevStepName = 'Data Capture (1-12)';
                }

                nextStep = '102';
                nexStepName = 'QC (1-12)';
              } 
              else if (this.userSteps[indx].step_name == 'QA'){
                currStep = '7';
                currStepName = 'Rework_to_QC';
                prevStepid = '4';
                prevStepName = 'QC'
                nextStep = '6'
                nexStepName = 'QA'
                
              }
            }

          }
        });
        console.log(rowdt)
        //return
        var obj = {
          "workstream": rowdt.workstream.toString(),
          "service": rowdt.service.toString(),
          "state": rowdt.batch.toString(),
          "record": rowdt.map_name.toString(),
          "recordtype": rowdt.maptype.toString(),
          "receiveddate": rowdt.inst_date,
          "time": Entryhours.toString(),
          "status": 'COMP',
          "remarks": rowdt.remarks.toString(),
          "chk": 'Yes',
          "curStepid": currStep.toString(),
          "curStepName": currStepName,
          "nextStepid": nextStep.toString(),
          "nextStepName": nexStepName,
          "prevStepid": prevStepid,
          "prevStepName": prevStepName,
          "glid": (localStorage.getItem('taskManagerId')).toString(),
          "taskManager": (localStorage.getItem('taskManagerId')).toString(),
          "shift": result.shift,
          "runs": rowdt.runs,
          "folder": rowdt.folder_name,
          "entities": rowdt.entities
          // "type_of_map" : rowdt.type_of_map
        }

        apiObj.timeList.push(obj);
        console.log('Time entry Obj-->', apiObj);
        // return

        if (apiObj.timeList.length > 0 && Entryhours != '') {

          this.Apiservice.postmethod('TimeEntry/BulkSaveTimeentry', apiObj).subscribe((data: any) => {
            console.log('Time entry Resp-->', data);
            this.globalConst.checkOriginAccess(data);

            if (data.length == 0) {
              this.Apiservice.get('Feedback/UpdateFeedbackChk?qc_ID=' + rowdt.qcID + '&chk_status=1&prmDone').subscribe(data => {
                console.log('Breckup list -->', data);
                this.globalConst.checkOriginAccess(data);

                if (data == 1) {
                  this.fbchk = true;
                  this.getFeedbackList();
                  location.reload();
                } else {
                  this.fbchk = false;
                }
                this.spinner.hide();
              });
            } else {

              var htmlbody = `<h6>Update failed.!</h6><br>
                    <center>
                    <table  id="table" border=1 class="table m-0 custmTbl" style="font-size:9px;font-weight:bold">
                    <thead class="thead-dark">
                        <tr>
                            <th>Map</th>
                            <th>Date</th>
                            <th>Step</th>
                            <th>Error</th>
                        </tr>
                    </thead>
                    <tbody>`;
              for (var x = 0; x < data.length; x++) {
                console.log('Dt --->', data[x]?.record);
                htmlbody = htmlbody + `<tr>`
                  + `<td>` + data[x]?.record + `</td>`
                  + `<td>` + data[x]?.date + `</td>`
                  + `<td>` + data[x]?.step + `</td>`
                  + `<td>` + data[x]?.remarks + `</td>`
                  + `</tr>`
              }
              htmlbody = htmlbody + `</tbody>
                    </table>
                    </center>`;
              this.spinner.hide();
              Swal.fire({ html: htmlbody, text: "Insertion Failed !", icon: 'error', width: '900px' });
              this.spinner.hide();
            }
          });
        }
      }
    });
  }
  if(rowdt.feedback_type=='External')

  {
    const modalRef = this.modalService.open(ExternalFeedbackErrorlistComponent,

      {
        scrollable: true, windowClass: 'myCustomModalClass', size: 'lg'
      },);
      var revDtOb = {
        rowind: ind,
        rowdt: rowdt,
        userTyp: 'User'
      }
      modalRef.componentInstance.fromParent = revDtOb;
      modalRef.result.then((data: any): void => {
        this.getFeedbackList();
    })
  }
  }

  newTimeConvert2(t) {
    var num = Number(t);
    var mints = ((num * 1.66666666666667) / 100);
    var rslt = mints;
    //console.log('Time Differ -->', rslt);
    return rslt;
  }
  updateRemarks(){
    var count = 0;
    var noCount = 0;
    var tval = 0;
    this.timeentryReport.forEach(x => {
      if (x.chk == 'Yes' && x.tremarks != '') {
        if (count == 0) {
          tval = x.tremarks;
        }
        count = count + 1;
      } else if (x.chk == 'Yes' && x.tremarks == '') {
        count = count + 1;
        noCount = noCount + 1;
      }
    });

    if (noCount > 0) {
      this.timeentryReport.forEach(x => {
        if (x.chk == 'Yes') {
          x.tremarks = tval; 
        }
      });
    }
    
  }
  updateTimeVals() {
    //alert('Dbl Click event');
    var count = 0;
    var noCount = 0;
    var tval = 0;
    this.timeentryReport.forEach(x => {
      if (x.chk == 'Yes' && x.timeentry != '') {
        if (count == 0) {
          tval = x.timeentry;
        }
        count = count + 1;
      } else if (x.chk == 'Yes' && x.timeentry == '') {
        count = count + 1;
        noCount = noCount + 1;
      }
    });

    if (noCount > 0) {
      this.timeentryReport.forEach(x => {
        if (x.chk == 'Yes') {
          x.timeentry = (tval / count);
        }
      });
    }

    // console.log('Count -->', count);
    // console.log('value -->', tval);
  }

  //Getting select step

  getSelecteStep(stepSel) {
    this.stSearchFm.controls.recdate.setValue('');
    this.selectedStep = this.stSearchFm.get('stepname').value;
    var sWrkSt = this.stSearchFm.get('wsname').value;
    var sService = this.stSearchFm.get('service').value;
    var sSubSer = this.stSearchFm.get('state').value;
    var sStep = stepSel;
    var userId = localStorage.getItem('LoginId');

    // Getting Received Date

    this.Apiservice.get('TimeEntry/GetTimeReceivedDate?tservice=' + sService +
      '&tworkstream=' + sWrkSt + '&tstep=' + sStep + '&tloginid=' + userId + '&tsubservice=' + sSubSer).subscribe((data: any) => {
        console.log("Modify Timeentry  List--->", data);
        if (data.Item1 == false && data.Item2 == 'You are not authorized to access!') {
          Swal.fire({ text: data.Item2, icon: 'warning' }).then(function () {
            window.localStorage.clear();
            this.router.navigate(['/pages/login']);
          });
          this.spinner.hide();
        }
        this.receivedDates = data;
        this.submitted = true;
        this.spinner.hide();

      });

  }

  //Feedback Entry
  openFeedback(rowdt, ind, stp) {
    const modalRef = this.modalService.open(FeedbackComponent,
      {
        scrollable: true, windowClass: 'myCustomModalClass', size: 'lg'
      },);
    var revDtOb = {
      rowind: ind,
      rowstp: stp,
      rowdt: rowdt
    }
    modalRef.componentInstance.fromParent = revDtOb;
    modalRef.result.then((result) => {
      //console.log('Result -->', result)

      //return;

      if (this.entrydate == undefined || this.entrydate == "Invalid Date") {
        this.swapAlerts('Please Select Date to Time Entry.!', 'swal2-warning');
        this.spinner.hide();
        return false;
      } else {
        var temp = new Date(this.entrydate.year, this.entrydate.month - 1, this.entrydate.day);
        temp.setDate(temp.getDate());
        var temp2 = temp.getTime();
        var d = new Date();
        d.setDate(d.getDate() - 2);
        var d2 = d.getTime();
        // if(temp2 < d2){
        //   this.swapAlerts('Selected date should not be less than yesterday.!', 'swal2-warning');
        // }
      }
      //return false;
      this.spinner.show();
      var userId = localStorage.getItem('LoginId');
      var stepname = this.stSearchFm.get('stepname').value;
      //var sid = this.userSteps.map(function(e) { return e.step_id; }).indexOf(stepname);
      var ind = this.userSteps.findIndex(x => x.step_id == stepname);

      if (this.userSteps.length > ind) {
        var curStepInfo = this.userSteps[ind + 1];
      } else {
        var curStepInfo = this.userSteps[ind];
      }

      if (this.entrydate != undefined) {
        var selDate = new Date(this.entrydate.year, this.entrydate.month - 1, this.entrydate.day);
      }

      var tskManagerId = localStorage.getItem('taskManagerId');
      //console.log('Feedback Response--->', result);

      var nextStep = 0
      var nexStepName = '';
      var currStep = 0;
      var currStepName = '';
      var preStep = 0;
      var preStepName = '';
      var fdt2 = this.formatDate2(selDate);

      if (result) {

        // if(result.postObj.feedbackList.length > 0){
        //   feedbackList.feedbackList = result.postObj.feedbackList;
        // }
        var Entryhours = this.newTimeConvert2(rowdt.timeentry);

        var feedbackList = {
          "acceptance": result.postObj.acceptance,
          "workstream": rowdt.workstream,
          "service": rowdt.service,
          "batch": rowdt.batch,
          "map": result.postObj.map,
          "mapType": rowdt.map_type,
          "step": result.postObj.step,
          "preStepId": 0,
          "preStepName": '',
          "currStepId": 0,
          "currStepName": '',
          "nextStepID": 0,
          "nextStepName": '',
          "time": Entryhours,
          "time_status": rowdt.tstatus,
          "timeEntry_date": fdt2,
          "time_shift": this.sltshift,
          "time_remarks": rowdt.tremarks,
          "chk_status": rowdt.chk,
          "chk_version": (this.checklistVersion == undefined ? 0 : this.checklistVersion),
          "wtg": result.postObj?.actWtg,
          "actErrors": (result.postObj?.ErrAttr == undefined ? 0 : result.postObj?.ErrAttr),
          "totalErros": (result.postObj?.totErros == undefined ? 0 : result.postObj?.totErros),
          "qual_per": (result.postObj?.Qcpercent == undefined ? 100 : result.postObj?.Qcpercent),
          "received_date": rowdt.inst_date,
          "entities": rowdt.total_kms,
          "errRemakrs": result.postObj?.errorRemarks,
          "runs": rowdt.runs,
          "folder": rowdt.folder_name
        }

        var feedbackObj = [];

        if (result.postObj.feedbackList && result.postObj.feedbackList.length > 0) {
          var resultDt = result.postObj.feedbackList;

          resultDt.forEach(x => {
            var qulper = parseFloat(x.qual_per)
            var fdobj = {
              "hostname": x.hostname,
              "errorno": x.actErrors,
              "screenprt": x.screenprt,
              "range": x.range,
              "errorDsp": x.errorDsp,
              "wtg": x.wtg,
              "actErrors": x.actErrors,
              "qual_per": qulper.toFixed(2)
            }

            feedbackObj.push(fdobj)
          });
        }

        // console.log('Feedback Response 2--->', feedbackList);
        // console.log('Common Steps --->', this.userSteps);
        // console.log('Seq Steps--->', this.userStepsSeq);
        //Next Step
        this.userSteps.forEach((y, indx) => {
          if (y.step_id == stepname) {


            var respObj = this.userSteps.filter(function (x) {
              if (x.step_name == 'Rework_to_Production') {
                return x;
              } else if (x.step_name == 'Production') {
                return x;
              }
            });

            //console.log(respObj)
            // if(rowdt.tstatus.toString().toLowerCase() == 'COMP'.toLowerCase()){
              if (feedbackList?.acceptance == 'Rejected') {

                if (feedbackList?.step == '102') {
  
                  nextStep = 214;
  
                  nexStepName = 'Rework to Data Capture (1-12)';
  
                  currStep = this.userSteps[indx].step_id;
  
                  currStepName = this.userSteps[indx].step_name;
  
                  preStep = 181
  
                  preStepName = 'Data Capture (1-12)';
  
                } else if (feedbackList?.step == '103') {
  
                  nextStep = 215;
  
                  nexStepName = 'Rework to Data Capture (13-14)';
  
                  currStep = this.userSteps[indx].step_id;
  
                  currStepName = this.userSteps[indx].step_name;
  
   
  
                  preStep = 102
  
                  preStepName = 'Data Capture (1-12)';
  
                } else {
  
                  // nextStep = respObj[0].step_id;
  
                  // nexStepName = respObj[0].step_name;
  
                  currStep = this.userSteps[indx].step_id;
  
                  currStepName = this.userSteps[indx].step_name;
  
                     if (this.userSteps[indx - 1]) {
  
                    preStep = this.userSteps[indx - 1].step_id
  
                    preStepName = this.userSteps[indx - 1].step_name;
  
                  } else {
  
                    preStep = 1;
  
                    preStepName = 'Yet to Start';
  
                  }
   
                  if (this.userSteps[indx + 1]) {
  
                    if (this.userSteps[indx].step_id == 4) {
  
                      nextStep = 5;
  
                      nexStepName = 'Rework_to_Production'
  
                    } else if (this.userSteps[indx].step_id == 6) {
  
                      nextStep = 7;
  
                      nexStepName = 'Rework_to_QC'
  
                    }
  
                  } else {
  
                    nextStep = 9;
  
                    nexStepName = "End of Process";
  
                  }
  
                }
  
              } else {
  
                if (this.userSteps[indx - 1].step_id) {
  
                  preStep = this.userSteps[indx - 1].step_id
  
                  preStepName = this.userSteps[indx - 1].step_name;
  
                }
  
                currStep = this.userSteps[indx].step_id;
                  currStepName = this.userSteps[indx].step_name;
    
                if (this.userSteps[indx + 1]) {
                    if (currStep == 6 && rowdt.w_name == "Energy Midstream") {
  
                    nextStep = 9;
                      nexStepName = "End of Process";
  
                  } else {
  
                    nextStep = this.userSteps[indx + 1].step_id;
                    nexStepName = this.userSteps[indx + 1].step_name;
  
                  }
    
                } else {
  
                  nextStep = 9;
                  nexStepName = "End of Process";
                  }
                }
          }
        });

        feedbackList.preStepId = preStep;
        feedbackList.preStepName = preStepName;
        feedbackList.currStepId = currStep;
        feedbackList.currStepName = currStepName;
        feedbackList.nextStepID = nextStep;
        feedbackList.nextStepName = nexStepName;


        var fnlObj = [];
        fnlObj.push(feedbackList);
        var finalOb;
        var urlPath;


        if (feedbackObj.length == 0) {
          finalOb = {
            feedbackData: fnlObj,
            logid: userId
          }

          urlPath = 'Feedback/FeedbackTimeEntry2';
        } else {
          finalOb = {
            feedbackData: fnlObj,
            feedbackObj: feedbackObj,
            logid: userId
          }

          urlPath = 'Feedback/FeedbackTimeEntry';
        }
        // Changing Next step while feedback accepted with errors
        //alert(finalOb.feedbackData[0].acceptance);
        if(finalOb.feedbackData[0].acceptance == 'Accepted'){
          this.Apiservice.get('WorkAllotment/GetStepSeq?wid=' + finalOb.feedbackData[0].workstream + '&sid=' + finalOb.feedbackData[0].service + '&ssid=' + finalOb.feedbackData[0].batch).subscribe((data: any) => {
            console.log('Steps Seq-->', data);
            console.log(finalOb)
           
            for(var i = 0; i < data.length; i++) {
               if(data[i].step_id == finalOb.feedbackData[0].currStepId)
               {
                  if((i+1) == data.length)
                  {
                    finalOb.feedbackData[0].nextStepID = 9;
                    finalOb.feedbackData[0].nextStepName = 'End of Process';
                  }
                  else
                  {
                 
                    finalOb.feedbackData[0].nextStepID = data[i + 1].step_id;
                    finalOb.feedbackData[0].nexStepName = data[i + 1].step_name
                  }
               }
            };
        
            this.Apiservice.postmethod(urlPath, finalOb).subscribe((data: any) => {
              //console.log('Time entry Feeback Resp-->', data);
              this.globalConst.checkOriginAccess(data);
    
              if (data == null || data == 'null') {
                this.spinner.hide();
                Swal.fire({ text: "Failed to Insert Feedback!", icon: 'error' });
              } else {
                if (data.length == 0) {
                  this.spinner.hide();
                  this.onSubmit();
                  Swal.fire({ text: "Feedback Submited Successfullly!", icon: 'success' }).then(function () {
                    //this.fileReset();
                  });
    
                } else {
                  var htmlbody = `<h6>Update failed.!</h6><br>
                        <center>
                        <table  id="table" border=1 class="table m-0 custmTbl" style="font-size:9px;font-weight:bold">
                        <thead class="thead-dark">
                            <tr>
                                <th>Map</th>
                                <th>Date</th>
                                <th>Step</th>
                                <th>Error</th>
                            </tr>
                        </thead>
                        <tbody>`;
                  for (var x = 0; x < data.length; x++) {
                    console.log('Dt --->', data[x]?.map);
                    htmlbody = htmlbody + `<tr>`
                      + `<td>` + data[x]?.map + `</td>`
                      + `<td>` + data[x]?.date + `</td>`
                      + `<td>` + data[x]?.step + `</td>`
                      + `<td>` + data[x]?.errorType + `</td>`
                      + `</tr>`
                  }
                  htmlbody = htmlbody + `</tbody>
                        </table>
                        </center>`;
                  this.spinner.hide();
                  Swal.fire({ html: htmlbody, text: "Insertion Failed !", icon: 'error', width: '600px' });
                }
              }
    
            });
             
          });
              
        }
        else
        {
          this.Apiservice.postmethod(urlPath, finalOb).subscribe((data: any) => {
            //console.log('Time entry Feeback Resp-->', data);
            this.globalConst.checkOriginAccess(data);
  
            if (data == null || data == 'null') {
              this.spinner.hide();
              Swal.fire({ text: "Failed to Insert Feedback!", icon: 'error' });
            } else {
              if (data.length == 0) {
                this.spinner.hide();
                this.onSubmit();
                Swal.fire({ text: "Feedback Submited Successfullly!", icon: 'success' }).then(function () {
                  //this.fileReset();
                });
  
              } else {
                var htmlbody = `<h6>Update failed.!</h6><br>
                      <center>
                      <table  id="table" border=1 class="table m-0 custmTbl" style="font-size:9px;font-weight:bold">
                      <thead class="thead-dark">
                          <tr>
                              <th>Map</th>
                              <th>Date</th>
                              <th>Step</th>
                              <th>Error</th>
                          </tr>
                      </thead>
                      <tbody>`;
                for (var x = 0; x < data.length; x++) {
                  console.log('Dt --->', data[x]?.map);
                  htmlbody = htmlbody + `<tr>`
                    + `<td>` + data[x]?.map + `</td>`
                    + `<td>` + data[x]?.date + `</td>`
                    + `<td>` + data[x]?.step + `</td>`
                    + `<td>` + data[x]?.errorType + `</td>`
                    + `</tr>`
                }
                htmlbody = htmlbody + `</tbody>
                      </table>
                      </center>`;
                this.spinner.hide();
                Swal.fire({ html: htmlbody, text: "Insertion Failed !", icon: 'error', width: '600px' });
              }
            }
  
          });
        }
        //Close

      console.log('Feedback Final 123--->', finalOb);
     
      } else {
        this.spinner.hide();
      }
    }, (reason) => {
    });

  }

  timeentryCal(typ: any, tme: any) {

   console.log(tme);

    if (tme !== 'none' && typ == 'N') {

      if (tme.timeentry == '' || tme.timeentry == 0 || tme.timeentry == null || tme.timeentry == undefined) {
        this.swapAlerts('Please enter valid time..!', 'swal2-warning');
        tme.timeentry = '';
      }
    }
    if (tme !== 'none' && typ == 'G') {
      if (tme.value.gtimeentry == '' || tme.value.gtimeentry == 0 || tme.value.gtimeentry == 'null' || tme.value.gtimeentry == undefined) {
        this.swapAlerts('Please enter valid time..!', 'swal2-warning');
        tme.timeentry = '';
      }
    }
    var timeCal = 0;
    var totEnt = 0;
    //alert('Chk!')
    if (typ == 'N') {
      //alert(typ)
     
     
      console.log(this.timeentryReport)
      this.timeentryReport.forEach(x => {
        if (x.chk == 'Yes') {
          timeCal = timeCal + Number(x.timeentry);
          if(Number(x.timeentry))
              totEnt = totEnt + Number(x.entities)
        }
      });
      this.totalEntities = totEnt;
      this.timeenteryCal = this.newTimeConvert(timeCal);
      if (parseInt(this.timeenteryCal) > 9.0 && this.exTimeEntry == '') {
        const modalRef = this.modalService.open(RemarksComponent,
          {
            scrollable: true, windowClass: 'myCustomModalClass', size: 'lg'
          },);

        modalRef.componentInstance.fromParent = '';
        modalRef.result.then((result) => {
          this.exTimeEntry = result;
          if (result == '') {
            this.swapAlerts('Please enter remarks for extra time entry..!', 'swal2-warning');
          }
        }, (reason) => {
        });
      }
    } else {
      var tm = this.generalSearchFm.get('gtimeentry').value;
      //
      this.timeenteryCal = this.newTimeConvert(tm);
    }

   }

  newTimeConvert(t) {
    var num = Number(t);
    var mints = ((num * 1.66666666666667) / 100);
    var rslt = mints.toFixed(2);
    // console.log('Time Differ -->', rslt);
    return rslt;
  }

  timeConvert(n) {
    var num = n;
    var hours = (num / 60);
    var rhours = Math.floor(hours);
    var minutes = Math.floor((hours - rhours) * 60);
    var rminutes = minutes;
    return (rhours.toString().length == 1 ? ('0' + rhours) : rhours) + "." + (rminutes.toString().length == 1 ? ('0' + rminutes) : rminutes);
  }


  toHoursAndMinutes(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours + ':' + minutes;
  }

  //Excel Export
  exportexcel(): void {
    /* pass here the table id */
    let element = document.getElementById('excel-table');
    //console.log(element)
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    for(var i = 2; i <= this.exlsJson.length + 1; i++){
      var rc = 'E' + i;
      ws[rc].v = ws[rc].v + ' ';
      ws[rc].v = ws[rc].v.trim();
    }
    /* save to file */
    XLSX.writeFile(wb, 'BulkTimeEntrySampleExcel.xlsx');
  }
  //type of map
  //type of map
  getTomData(ind,ite){
    console.log(ite)
    const cstep = this.stSearchFm.get('stepname').value;
    if (cstep == "8" ) {
      Swal.fire({ text: "You are not authorized to edit the type of map", icon: 'warning' })
      return;
    }
    this.Apiservice.get('Feedback/GetCanadaTypeofMapList?workstream=' + ite.workstream + '&service=' + ite.service + '&batch=' +
          ite.batch + '&step=' + this.selectedStep).subscribe((tomdata: any) => {
            console.log("Get data -------------->", tomdata)
            this.tomapData = tomdata;
          })
    this.timeentryReport[ind].tomEditable = true;
    this.selTom = this.timeentryReport[ind].type_of_map;
  }


  //Update Type of Map
  updateTom(ind,ele){
    console.log('Update Org...!', this.timeentryReportCopy[ind].total_kms);
    console.log('Update...!', this.timeentryReport[ind].total_kms);
    this.timeentryReport[ind].tomEditable = false;
    // if(this.timeentryReport[ind].type_of_map == ''){
    //   Swal.fire({text: "Zero's or Negative values are Not Allowed.!",icon: 'error'});
    //   this.timeentryReport[ind].total_kms  = this.totalKMS;
    //   return false;
    // }else if(this.timeentryReport[ind].total_kms  == this.totalKMS){
    //   return false;
    // }else if(this.timeentryReport[ind].total_kms == "" || this.timeentryReport[ind].total_kms == null){
    //   this.timeentryReport[ind].total_kms  = this.totalKMS;
    //   return false;
    // }else{
      this.spinner.show();
      const workstream = this.timeentryReport[ind].workstream;
      const service = this.timeentryReport[ind].service;
      const state = this.timeentryReport[ind].batch;
      var userId = localStorage.getItem('LoginId');
      const mid = this.timeentryReport[ind].mid;
      const map = this.timeentryReport[ind].map;
      const totKms = this.timeentryReport[ind].total_kms;
      const cstep = this.stSearchFm.get('stepname').value;
      const type_of_map = this.timeentryReport[ind].type_of_map;


      this.Apiservice.getMethod('Masters/UpdateCanadaTypeofMaps?userId='+userId+'&workstream='
      +workstream+'&service='+service+'&state='+state+'&typeofMaps='+type_of_map+'&map='+map+'&step='
      +cstep).subscribe((data:any)=>{
        console.log('Time entry Resp-->', data);
      //  this.globalConst.checkOriginAccess(data);

        if(data == '1'){
          //this.onSubmit();
          // this.spinner.hide();
          // Swal.fire({text: "Submited Successfullly!",icon: 'success'}).then(function() {
          //   //this.fileReset();
          // });
          this.spinner.hide();
          //this.onSubmit();
        }else{
            this.spinner.hide();
            Swal.fire({text: "Insertion Failed!",icon: 'error'});
        }
    });
    // }

  }
  //Kotal KMS
  changeTotKms(inx, ele) {
    console.log('I am double clicked...!')
    this.timeentryReport[inx].editable = true;
    this.totalKMS = this.timeentryReport[inx].total_kms;
  }

  changeToRuns(inx, ele) {
    // alert(inx)
    console.log('I am double clicked...!', this.timeentryReport)
    this.timeentryReport[inx].editables = true;
    this.runs = this.timeentryReport[inx].runs;
  }

  changeToFolder(inx, ele) {
    // alert(inx)
    console.log('I am double clicked...!', this.timeentryReport)
    this.timeentryReport[inx].editableFolder = true;
    this.foldername = this.timeentryReport[inx].folder_name;
  }

  //GetUserWiseCustomGrid
  GettingUserWCustomGrid() {
    const user = localStorage.getItem('CorpId')
    this.Apiservice.get('WorkAllotment/GetUserWiseCustomGrid?userId=' + user).subscribe((data: any) => {
      console.log('User Grid-->', data);
      this.globalConst.checkOriginAccess(data);

      this.userCustomGrid = data[0];
      if (data.length > 0) {
        Object.keys(this.userCustomGrid).forEach(key => {
          var val = this.userCustomGrid[key].toString();
          this.userCustomGrid[key] = val.trim();
        });
        console.log('Final Grid --->', this.userCustomGrid)
      }

      if (data.length == 0) {
        this.userCustomGrid = {
          "id": 0,
          "userId": "TV62254",
          "currency": "Y",
          "folderName": "N",
          "operatorName": "Y",
          "queryNumber": "Y",
          "recordType": "Y",
          "remarks": "N",
          "tlName": "N"
        }
      }
    });

  }

  //Change custome grid options
  changeCustomGrid(evnt, ind) {
    console.log('Grid Status-->', evnt.target.checked)
    if (evnt.target.checked == true) {
      this.userCustomGrid[ind] = 'Y';
    } else {
      this.userCustomGrid[ind] = 'N';
    }

    console.log('Final Grid ---->', this.userCustomGrid)
  }

  //Get
  getChecked(val) {
    var str = val.trim();
    if (str == 'Y')
      return true;
    else
      return false;
  }

  //Custom Label filter
  labFilter(lab) {
    var labs = lab;
    labs = labs.replace(/[A-Z]/g, ' $&').trim();
    labs = labs.charAt(0).toUpperCase() + labs.slice(1)
    return labs;
  }

  //Update User Custom Grid
  updateUserCustomGrid() {
    var finalObj = [this.userCustomGrid]
    finalObj[0].prmdone = "";
    finalObj[0].id = Number(finalObj[0].id);
    //console.log('Updated Grid: ',finalObj)

    this.Apiservice.postmethod('WorkAllotment/UpdateCustomGrid', finalObj).subscribe((data: any) => {
      console.log('Resp Custm Grid-->', data)
      this.globalConst.checkOriginAccess(data);

      if (data.Item1 == true) {
        this.swapSuccessAlerts('Updated Successfully.!', '');
      }
    });
  }

  swapSuccessAlerts(msg, typ) {
    return Swal.fire({
      icon: 'success', title: '', text: msg,
      customClass: {
        confirmButton: 'btn btn-success'
      },
      buttonsStyling: false
    }).then(function () {
      if (typ == 'bulk update') {
        this.onSubmit();
      }

    });
  }

   // Validate KMS
   validateKMS(ind,val){
      console.log(ind,'and',val.currentKMS)
   }
  //Update Total Kms
  updateTotKms(ind, ele) {
    console.log(ele)
    console.log('Update Org...!', this.timeentryReportCopy[ind].total_kms);
    console.log('Update...!', this.timeentryReport[ind].total_kms);
   
    this.timeentryReport[ind].editable = false;
	this.timeentryReport[ind].entities = this.timeentryReport[ind].total_kms;
    if (this.timeentryReport[ind].total_kms <= 0) {
      Swal.fire({ text: "Zero's or Negative values are Not Allowed.!", icon: 'error' });
      this.timeentryReport[ind].total_kms = this.totalKMS;
      return false;
    } else if (this.timeentryReport[ind].total_kms == this.totalKMS) {
      return false;
    } else if (this.timeentryReport[ind].total_kms == "" || this.timeentryReport[ind].total_kms == null) {
      this.timeentryReport[ind].total_kms = this.totalKMS;
      return false;
    } else {
      this.spinner.show();
      const workstream = this.timeentryReport[ind].workstream;
      const service = this.timeentryReport[ind].service;
      const state = this.timeentryReport[ind].batch;
      var userId = localStorage.getItem('LoginId');
      const mid = this.timeentryReport[ind].mid;
      const map = this.timeentryReport[ind].map;
      const totKms = this.timeentryReport[ind].total_kms;
      const cstep = this.stSearchFm.get('stepname').value;
      this.timeentryReport[ind].total_kms = ele.total_kms;
   
      this.Apiservice.getMethod('Masters/UpdateDailylogEntities?userId=' + userId + '&workstream=' + workstream + '&service=' + service + '&state=' + state + '&entities=' + totKms + '&map=' + map + '&step=' + cstep).subscribe((data: any) => {
        console.log('Time entry Resp-->', data);
      
        
        this.globalConst.checkOriginAccess(data);

        if (data == '1') {
          //this.onSubmit();
          this.spinner.hide();
          Swal.fire({ text: "Submited Successfullly!", icon: 'success' }).then(function () {
            //this.fileReset();
          });
          this.spinner.hide();
          //this.onSubmit();
        } else {
          this.spinner.hide();
          Swal.fire({ text: "Insertion Failed!", icon: 'error' });
        }
        //return
      });
    }

  }



  updateRuns(ind, ele) {
    console.log('Update Org...!', this.timeentryReportCopy[ind].runs);
    console.log('Update...!', this.timeentryReport[ind].runs);
    this.timeentryReport[ind].editables = false;
    if (this.timeentryReport[ind].mapsData <= 0) {
      Swal.fire({ text: "Zero's or Negative values are Not Allowed.!", icon: 'error' });
      this.timeentryReport[ind].runs = this.runs;
      return false;
    } else if (this.timeentryReport[ind].runs == this.runs) {
      return false;
    } else if (this.timeentryReport[ind].runs == "" || this.timeentryReport[ind].runs == null) {
      this.timeentryReport[ind].runs = this.runs;
      return false;
    } else {
      this.spinner.show();

      const workstream = this.timeentryReport[ind].workstream;
      const service = this.timeentryReport[ind].service;
      const state = this.timeentryReport[ind].batch;
      const map = this.timeentryReport[ind].map;
      const runs = this.timeentryReport[ind].runs;
      const cstep = this.stSearchFm.get('stepname').value;
      var userId = localStorage.getItem('LoginId');
      this.Apiservice.getMethod('Masters/UpdateDailylogRuns?userId=' + userId + '&workstream=' + workstream + '&service=' + service + '&state=' + state + '&runs=' + runs + '&map=' + map + '&step=' + cstep).subscribe((data: any) => {
        console.log('Time entry Resp-->', data);
        this.globalConst.checkOriginAccess(data);

        if (data == '1') {
          //this.onSubmit();
          this.spinner.hide();
          Swal.fire({ text: "Submited Successfullly!", icon: 'success' }).then(function () {
            //this.fileReset();
          });
          this.spinner.hide();
          // this.onSubmit();
        } else {
          this.spinner.hide();
          Swal.fire({ text: "Insertion Failed!", icon: 'error' });
        }
      });
    }

  }


  updateFolderName(ind, ele) {
    console.log('Update Org...!', this.timeentryReportCopy[ind].folder_name);
    console.log('Update...!', this.timeentryReport[ind].folder_name);
    this.timeentryReport[ind].editables = false;
    if (this.timeentryReport[ind].mapsData <= 0) {
      Swal.fire({ text: "Zero's or Negative values are Not Allowed.!", icon: 'error' });
      this.timeentryReport[ind].folder_name = this.foldername;
      return false;
    } else if (this.timeentryReport[ind].folder_name == this.foldername) {
      return false;
    } else if (this.timeentryReport[ind].folder_name == "" || this.timeentryReport[ind].folder_name == null) {
      this.timeentryReport[ind].folder_name = this.foldername;
      return false;
    } else {
      this.spinner.show();

      const workstream = this.timeentryReport[ind].workstream;
      const service = this.timeentryReport[ind].service;
      const state = this.timeentryReport[ind].batch;
      const map = this.timeentryReport[ind].map;
      const folder = this.timeentryReport[ind].folder_name;
      const cstep = this.stSearchFm.get('stepname').value;
      var userId = localStorage.getItem('LoginId');
      this.Apiservice.getMethod('Masters/UpdateDailylogFolder?userId=' + userId + '&workstream=' + workstream + '&service=' + service + '&state=' + state + '&folder=' + folder + '&map=' + map + '&step=' + cstep).subscribe((data: any) => {
        console.log('Time entry Resp-->', data);
        this.globalConst.checkOriginAccess(data);

        if (data == '1') {
          //this.onSubmit();
          this.spinner.hide();
          Swal.fire({ text: "Submited Successfullly!", icon: 'success' }).then(function () {
            //this.fileReset();

          });
          this.timeentryReport[ind].editableFolder = false;
          this.spinner.hide();
          // this.onSubmit();
        } else {
          this.spinner.hide();
          this.timeentryReport[ind].editableFolder = false;
          Swal.fire({ text: "Insertion Failed!", icon: 'error' });
        }
      });
    }

  }

  checkUncheckAll() {

    for (var i = 0; i < this.timeentryReport.length; i++) {
      this.timeentryReport[i].chkBox = this.isMasterSel2;
    }

    //this.getCheckedItemList();
  }
  isAllSelected() {

    this.isMasterSel2 = this.timeentryReport.every(function (item: any) {
      return item.chkBox == true;

    })

    //this.getCheckedItemList();
  }

  checkEmpty() {
    //console.log('Checking ..!' , this.wcount)
    if (this.percent == 0 || this.percent == null) {
      //this.mapsData = this.resetData;

      this.timeentryReport = this.resetData;


      this.checkUncheckAll();
    } else if (this.percent == '') {
      this.percent = 0;

      this.timeentryReport = this.resetData;

    }

    if (this.batchQA) {
      this.getBatchNumber(this.stSearchFm.get('wsname').value);
      console.log('call batch number service...', this.batchQANumber);
    }
  }

  resetGrid() {
    this.percent = 0;

    this.timeentryReport = this.resetData;
    for (var i = 0; i < this.timeentryReport.length; i++) {
      this.timeentryReport[i].chkBox = false;
    }
    this.isMasterSel2 = false;

  }

  //Getting the count of time entry list
  getCountval(cnt) {
    var startIndex = 0;
    var endIndex = cnt;
    const finalAry = [];

    this.timeentryReport.forEach(y => {
      y.chkBox = false;
    });

    //Show error if the count grater than 100 percent  
    if (cnt > 100) {
      this.percent = 0;
      return Swal.fire({
        icon: 'warning', title: '', text: "Percent cann't be grater than 100",
        customClass: {
          confirmButton: 'btn btn-danger',

        },
        buttonsStyling: false
      }).then(function () {
        return false;
      });
    }


    //Percentage
    this.iPerval = 0
    if (this.seqType == 'rand' && cnt > 0) {
      var selectGrid = [];

      selectGrid = this.timeentryReport;

      var arr = [];

      this.iPerval = Math.round((selectGrid.length * cnt) / 100)
      while (arr.length < this.iPerval) {//while(arr.length < cnt){
        var r = Math.floor(Math.random() * selectGrid.length);
        if (arr.indexOf(r) === -1) {
          arr.push(r);
        }
      }

      const randAry = [];
      for (var x = 0; x < arr.length; x++) {
        randAry.push(selectGrid[arr[x]])
      }

      //this.mapsData = randAry;
      var resp = this.timeentryReport.filter(x => !randAry.some(y => x.map === y.map));
      this.timeentryReport = [];
      this.timeentryReport = randAry.concat(resp);
      //console.log('filterd obj-->', this.mapsData);    

    }
    //else if(this.seqType == 'seq'){
    //this.timeentryReport.slice(startIndex, endIndex).map((item, i) => {
    this.timeentryReport.slice(startIndex, this.iPerval).map((item, i) => {
      item.chkBox = true;
    });

    this.allRowsSelected = true;
    this.isAllSelected();
    //console.log('Final Ary - >', finalAry)
  }
  selectfilterType(fltyp) {
    //console.log('Select Type --->', fltyp)
    this.seqType = fltyp;
  }
  checkBatchQA(wid: any, serviceId: any, batchId: any) {

    this.Apiservice.getStrMethod('Feedback/GetBatchQAorRegular?workstream=' + wid + '&service=' + serviceId + '&batch=' + batchId).subscribe((data: any) => {
      console.log('check Batch QA or Not..... --->', data);
      this.globalConst.checkOriginAccess(data);
      this.batchQA = data
    });
  }

  getBatchNumber(wid: any) {
    this.batchQANumber = '';
    this.Apiservice.getStrMethod('Feedback/GetBatchQA_Batchnumber?workstream=' + wid).subscribe((data: any) => {
      console.log('Batch QA Number..... --->', data);
      this.globalConst.checkOriginAccess(data);
      this.batchQANumber = data
    });
  }
}
