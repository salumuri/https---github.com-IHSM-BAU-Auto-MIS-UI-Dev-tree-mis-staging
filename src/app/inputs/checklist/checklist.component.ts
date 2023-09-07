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
import { GlobalConstants } from '../../common/global-constants';


@Component({
  selector: 'app-checklist',
  templateUrl: './checklist.component.html',
  styleUrls: ['./checklist.component.scss']
})
export class ChecklistComponent implements OnInit {

  workstreamData: any; walotServices: any; walotBatches: any; selectedWrkStrm: any = '';
  walotRegions: any = ''; chkdata: any = []; n: number = 1; revdata: any = []; isShown: boolean = false; isUpalodShown: boolean = false;
  isDesShown: boolean = false;

  //Excel Upload
  private spread;
  private excelIO;
  public exlsJson: any = [];
  public finalExcelJson: any;
  public userGrid: any = [];
  public userObj: any;
  public btnStatus = 'grid';
  public dropdownEvnt = false;
  public checkListColumns : any = [];
  public approvlsCheckList : any = [];
  public approvlsCheckListGeneral : any = [];
  public allMasterInfo : any = [];
  public userRole = localStorage.getItem('Role');
  public submitSearch = false;
  public userId = localStorage.getItem('LoginId');
  misSteps = 'assets/excelfiles/MISSteps.xls';
  smpCheck = 'assets/excelfiles/CheckList.xlsx';
  checkimg = 'assets/img/icons/excel1.png'


  @ViewChild('csvReader', { static: false }) csvReader: any;

  waSearchFm: FormGroup = new FormGroup({
    stepname: new FormControl(''),
    wsname: new FormControl(''),
    region: new FormControl(''),
    service: new FormControl(''),
    state: new FormControl(''),
    recdate: new FormControl(''),
  });
  submitted = false;
  constructor(public globalConst: GlobalConstants,private spinner: NgxSpinnerService, public router: Router, private Apiservice: ApiService, private fb: FormBuilder, private http: HttpClient) {
    //this.checkListColumns = ["Workstream","Service","State","Record","RecordType","ReceivedDate","Time","Status","Remarks","Chk"];
    //alert(this.userId)
    this.checkListColumns = ["EmpNum","RevNum","RevDate","Workstream","Service","Sub Service","Description","Status","StepNum","StepName","OrderofTask"]
  }

  ngOnInit(): void {
    this.spinner.show();
    var loginfo = localStorage.getItem('CorpId');
    var tskMgr = localStorage.getItem('taskManagerId');

    if(loginfo == '' || loginfo == null || loginfo == 'null'){
      this.router.navigate(['/pages/login']);
    }

    this.selectedWrkStrm = localStorage.getItem('selectedWrkStrm');
    //console.log('Sel work strm --->', this.selectedWrkStrm)

    if(this.selectedWrkStrm == '' || this.selectedWrkStrm == null){
      this.swapAlerts('Please select Workstream.!','')
    }

    this.GetWorkstream();
    this.waSearchFm = this.fb.group({
      stepname: [''],
      wsname: ['', Validators.required],
      region: [''],
      service: ['', Validators.required],
      state: ['', Validators.required],
      recdate: [''],
    });

    this.getApprovelsCheckList();


    // if(this.selectedWrkStrm != ''){
    //   this.getServiceslist();
    // }

    this.GetAllMasterInfo();
    this.spinner.hide();
  }


  //Getting all Master info
  GetAllMasterInfo(){
    var wlst = JSON.parse(localStorage.getItem('WorkStreams'));
    var str = '';
    wlst.forEach(element => {
      str = str + element.wid+','
    });
    str = str.replace(/,\s*$/, "");
    //console.log('Final Wrkalot', str);
    // var allMasterinfo = '';
    // if(allMasterinfo != ''){
    //   allMasterinfo = JSON.parse(allMasterinfo);
    // }
    // if(allMasterinfo != undefined && allMasterinfo.length > 0){
    //   this.allMasterInfo = allMasterinfo;
    //   console.log('Get All List LStorage-->',allMasterinfo);
    // }else{
      this.Apiservice.get('WorkAllotment/GetDetailedList?wid='+str).subscribe((data: any) => {
        console.log('Get All List DB-->',data);
        this.globalConst.checkOriginAccess(data);

        this.allMasterInfo = data;
        //localStorage.setItem('allMasterinfo',JSON.stringify(this.allMasterInfo));
      });
    //}

  }

  //Approval checklist
  getApprovelsCheckList(){
    this.approvlsCheckList = [];
    this.spinner.show();
    var userId = localStorage.getItem('LoginId');

    this.Apiservice.get('Checklist/GetUnapprovedChecklist?empId=' + userId.toString() + '&userType='+this.userRole).subscribe((data: any) => {
      console.log("Ap Check List-->",data);
      this.globalConst.checkOriginAccess(data);

      this.approvlsCheckList = data;
      this.spinner.hide();
    });
  }


  //Approval checklist
  getApprovelsCheckListGeneral(fm){
    console.log('Form Dt->',fm)
    this.approvlsCheckListGeneral = [];
    this.spinner.show();
    var userId = localStorage.getItem('LoginId');
    //alert(userId)
    if(this.approvlsCheckList.length == 0){
      this.Apiservice.get('Checklist/GetApprovalList?workstream='+fm.wsname+'&service='+fm.service+'&state='+fm.state+'&loginID=' + userId.toString()).subscribe((data: any) => {
        console.log("Ap Check List General-->",data);
        this.globalConst.checkOriginAccess(data);

        this.approvlsCheckListGeneral = data;
        this.spinner.hide();
      });
    }

  }

  //Get User Type
  getRole(typ){
    if(typ.includes("Manager")){
      return 'Manager'
    }else{
      return 'User'
    }
  }


  GetWorkstream() {
    //this.workstreamData = JSON.parse(localStorage.getItem('WorkStreams'));;

    let id=localStorage.getItem('LoginId');
    this.Apiservice.get('WorkAllotment/GetWorkStream?id=' + id).subscribe((data: any) => {
        console.log(data);
        this.globalConst.checkOriginAccess(data);
        this.workstreamData = data;
    });
  }

  //Getting regions
  GetRegions(wrkstrm) {
    this.spinner.show();
    this.Apiservice.get('WorkAllotment/GetRegionList?wid=' + wrkstrm).subscribe((data: any) => {
      //console.log('Regions-->',data);
      this.globalConst.checkOriginAccess(data);

      this.walotRegions = data;
      this.spinner.hide();
    });
    this.spinner.hide();
  }

  getServiceslist() {
    this.spinner.show();
    this.waSearchFm.controls['service'].setValue('');
    this.waSearchFm.controls['state'].setValue('');
    const walotwid = this.waSearchFm.get('wsname').value;
    this.GetRegions(walotwid);
    this.Apiservice.get('WorkAllotment/GetAreaList?wid=' + walotwid).subscribe((data: any) => {
      //console.log('Services-->', data);
      this.globalConst.checkOriginAccess(data);

      this.walotServices = data;
      this.spinner.hide();
    });
    this.spinner.hide();
  }

  getBatches() {
    this.spinner.show();
    this.waSearchFm.controls['state'].setValue('');
    const walotwid = this.waSearchFm.get('wsname').value;
    const walotsid = this.waSearchFm.get('service').value;
    this.Apiservice.get('WorkAllotment/GetBatchList?wid=' + walotwid + '&sid=' + walotsid).subscribe((data: any) => {
     // console.log('Batches-->', data);
     this.globalConst.checkOriginAccess(data);

      this.walotBatches = data;
      this.spinner.hide();
    });
    this.spinner.hide();
  }
  get f(): { [key: string]: AbstractControl } {
    return this.waSearchFm.controls;
  }

  onFileChangechk(ev) {
    //console.log('File Upload...!', ev)
    this.spinner.show();
    let workBook = null;
    let jsonData = null;
    const reader = new FileReader();
    const file = ev.target.files[0];
    const fileext = ev.target.files[0]?.name.split(".").pop();
      if(fileext != 'xlsx' && fileext != 'xls'){
        this.spinner.hide();
        this.swapAlerts('Invalid File Uploaded..!','');

      }else{
        reader.onload = (event) => {
          const data = reader.result;
          workBook = XLSX.read(data, { type: 'binary', cellDates: true });
          jsonData = workBook.SheetNames.reduce((initial, name) => {
            const sheet = workBook.Sheets[name];
            initial[name] = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false});
            return initial;
          }, {});
          const dataString = JSON.parse(JSON.stringify(jsonData));
          //console.log('Sample Excel--->', dataString)
          var fileKey = Object.keys(dataString)[0];
          this.exlsJson = dataString[fileKey];
          var hedersDt = Object.keys(this.exlsJson[0]); //Headers
          console.log('Excel Data--->', this.exlsJson)
          let result = this.checkListColumns.sort().filter(o1 => hedersDt.sort().some(o2 => o1 === o2));

          var userId = localStorage.getItem('LoginId');
          if(this.checkListColumns.sort().length != hedersDt.sort().length){
            this.spinner.hide();
            this.fileReset();
            this.swapAlerts('Columns count Missmatch..!','');
          }else if(this.checkListColumns.sort().length != result.length){
            this.spinner.hide();
            this.fileReset();
            this.swapAlerts('Invalid Columns Names..!','');
          }else{
              const mnObj = []
              this.exlsJson.forEach(x => {
                // var wind = this.workstreamData.map(function(e) { return e.w_name; }).indexOf(x['Workstream']);
                // var sind = this.walotServices.map(function(e) {return e.service_name; }).indexOf(x['Service']);
                // var bind = this.walotBatches.map(function(e) {return e.batch_name; }).indexOf(x['State']);
                if(x.EmpNum == '' || x['RevNum'] == '' || x['RevDate'] =='' || x?.['Workstream'] == '' || x?.['Service'] == '' || x?.['Sub Service'] == '' || x['Description'] == '' || x['Status'] == '' || x['StepNum'] == '' || x['StepName'] == '' || x['OrderofTask'] == ''){

                  this.fileReset();
                  Swal.fire({text: "Columns values should not empty in the uploaded sheet!",icon: 'warning'}).then(function() {
                    //this.fileReset();
                    this.exlsJson = [];
                  });
                  return;
                }

                  //Checking Validation for Workstream
                  if(x?.['Workstream'] != undefined){
                    //var resp = Object.values(this.waobj).includes(this.records[s]?.['Work stream']);
                    var wrkstrm = x?.['Workstream'].toString();
                    var wrkresp = this.allMasterInfo.filter(function (y) { return y['w_name'] == x.Workstream});
                   // console.log('Work Stream -->', wrkresp);

                    if(wrkresp.length == 0 || wrkstrm == ''){
                      this.spinner.hide();
                      this.swapAlerts('Please check Work stream (' + x?.['Workstream'] + ') in the uploaded file.!','');
                      ev.target.value = '';
                      this.fileReset();
                      return false
                    }
                  }

                  //Checking Validation for Service
                  if(x?.['Service'].toString() != undefined){
                    var servc = x?.['Service'].toString();
                    var wrkstrm = x?.['Workstream'].toString();
                    var service = this.allMasterInfo.filter(function (y) { return (y['service_name'] == servc)});
                    //console.log("service Resp -->", service);
                    if(service.length == 0 || servc == ''){
                      this.spinner.hide();
                      this.swapAlerts('Please check Service (' + servc + ') in the uploaded file.!','');
                      ev.target.value = '';
                      this.fileReset();
                    }
                  }

                  //Checking Validation for State
                  if(x?.['Sub Service'].toString() != undefined){
                    var btch = x?.['Sub Service'].toString();
                    var services = x?.['Service'].toString();
                    var sservice = this.allMasterInfo.filter(function (x) { return (x.batch_name == btch && x.service_name == services)});

                    // console.log("sub service Resp 1-->", btch);
                    // console.log("sub service Resp 2-->", sservice);

                    if(sservice.length == 0 || btch == ''){
                      this.spinner.hide();
                      this.swapAlerts('Please check Sub Service (' + btch + ') in the uploaded file.!','');
                      ev.target.value = '';
                      this.fileReset();
                      return false;
                    }
                  }



                var subObj = {
                  "empid"       : userId,
                  "version"     : x['RevNum'].toString(),
                  "versionDate" : x['RevDate'],
                  "workstream"  : wrkresp[0].wid,
                  "service"     : service[0].sid,
                  "state"       : sservice[0].bid,
                  "desp"        : x['Description'],
                  "check_type"  : x['Status'],
                  "stepId"      : x['StepNum'].toString(),
                  "StepName"    : x['StepName'],
                  "orderofTask" : x['OrderofTask'].toString()
                }

                mnObj.push(subObj);

              });

              console.log('Excel Data 2--->', this.exlsJson)
              //console.log('Final Obj-->', mnObj);
              this.finalExcelJson = mnObj;
              //console.log('Final Obj 2-->', this.finalExcelJson);
              //document.getElementById('output').innerHTML = dataString.slice(0, 300).concat("...");
              //this.setDownload(dataString);
              this.spinner.hide();
          }
          this.spinner.hide();
        }
    }
    reader.readAsBinaryString(file);
  }


  saveBulkData(){
    this.spinner.show();
    console.log(this.finalExcelJson)
    var userId = localStorage.getItem('LoginId');
    if(!this.finalExcelJson || this.finalExcelJson.length==0){
      this.spinner.hide();
      this.fileReset();
      Swal.fire({text: "Please Upload the file",icon: 'warning'});}
    else{
        let obj={
          "checklistdataList": this.finalExcelJson,
          "userid": Number(userId)
        }
        console.log('Final Obj--->', obj);
        //return
        this.Apiservice.postmethod('Checklist/BulkSaveChecklistData', obj).subscribe((data:any)=>{
          console.log('Response --->',data);
          this.globalConst.checkOriginAccess(data);

          if(data && data == null || data && data.length == 0){
            this.spinner.hide();
            this.getApprovelsCheckList();
            Swal.fire({text: "Check List Updated Successfullly!",icon: 'success'}).then(function() {
              //this.fileReset();

            });

            this.fileReset();
          }else{
              this.spinner.hide();
              this.fileReset();
              var htmlbody = `<h6>Update failed.!</h6><br>
              <center>
              <table  id="table" border=1 class="table m-0 custmTbl" style="font-size:9px;font-weight:bold">
              <thead class="thead-dark">
                  <tr>
                      <th>Workstream</th>
                      <th>Service</th>
                      <th>Sub Service</th>
                      <th>Version</th>
                      <th>Description</th>
                      <th>Step</th>
                      <th>Remarks</th>
                  </tr>
              </thead>
              <tbody>`;
             for(var x=0; x < data.length; x++){
              console.log('Dt --->', data[x]?.map);
              htmlbody = htmlbody + `<tr>`
                      +`<td>`+data[x]?.workstream+`</td>`
                      +`<td>`+data[x]?.service+`</td>`
                      +`<td>`+data[x]?.batch+`</td>`
                      +`<td>`+data[x]?.version+`</td>`
                      +`<td>`+data[x]?.description+`</td>`
                      +`<td>`+data[x]?.step+`</td>`
                      +`<td>`+data[x]?.remarks+`</td>`
                  +`</tr>`
                }
              htmlbody = htmlbody + `</tbody>
              </table>
              </center>`;
                this.spinner.hide();
                Swal.fire({html : htmlbody,text: "Please find remarks below !",icon: 'warning',width: '1000px'});
              //Swal.fire({text: "Insertion Failed due to duplicate checklist!",icon: 'error'});
          }

        });
        this.spinner.hide();
  }
}

  swapAlerts(msg,icon){
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

   fileReset() {
    this.csvReader.nativeElement.value = "";
    this.exlsJson = [];
  }

  onSubmit() {
    //console.log("MIS");
    this.spinner.show();
    var frmObj = this.waSearchFm.value;
    var getMapsList = {
      'wsname': Number(frmObj.wsname),
      'region': frmObj.region,
      'service': frmObj.service,
      'state': frmObj.state
    }



    //console.log(getMapsList);
    var userId = localStorage.getItem('LoginId');
    this.Apiservice.get('Checklist/GetCheckList?workstream='+getMapsList.wsname+'&services='+getMapsList.service+'&state='+getMapsList.state+'&empId='+userId+'&stepId=0').subscribe((data: any) => {
        console.log('Sample --->', data)
        this.globalConst.checkOriginAccess(data);

        if(data.length > 0){
          if(data[0].checklistSteps){
            this.chkdata = data[0].checklistSteps;
          }
          if(data[0].approvedCheckList){
            this.revdata = data[0].approvedCheckList;
          }
          this.submitSearch = true;
        }
        this.spinner.hide();
    });

    //Getting CheckList
    this.getApprovelsCheckListGeneral(getMapsList);
  }

  approveThis(rec,typ){
    this.spinner.show();
    console.log('Active Rec-->', rec);
    var userId = localStorage.getItem('LoginId');
    var apiObj = [
      {
      "checkId" : rec.id,
      "userId"  : userId,
      "tstatus" : typ.toString(),
      "prmdone" : ""
      }
     ]
     console.log('Check list type -->', apiObj)
     //return
     this.Apiservice.postmethod('Checklist/SaveApproceChecklist', apiObj).subscribe((data:any)=>{
        console.log('Status Appve Resp -->', data)
        this.globalConst.checkOriginAccess(data);

        if(data.Item1 == true && data.Item2 == "Saved Sucessfully"){

          Swal.fire({text: "Updated Successfullly!",icon: 'success'}).then(function() {
          });
          this.getApprovelsCheckList();
        }else{
          Swal.fire({text: "Updated Failed!",icon: 'error'});
        }
        this.spinner.hide();
     });
     this.spinner.hide();
  }






  pageChangeEvents(event: number) {
    this.n = event;
  }
  toggleShow() {
    this.isShown = !this.isShown;
    this.exlsJson = [];
  }
  toggleUplaodShow() {
    this.isUpalodShown = !this.isUpalodShown;
  }
  toggleDesShow() {
    this.isDesShown = !this.isDesShown;
  }

  chkBtn(btn){
    this.exlsJson = [];
    this.btnStatus = btn;
    if(btn == 'version'){
      this.isUpalodShown = true;
    }else{
      this.isUpalodShown = false;
    }
  }


}
