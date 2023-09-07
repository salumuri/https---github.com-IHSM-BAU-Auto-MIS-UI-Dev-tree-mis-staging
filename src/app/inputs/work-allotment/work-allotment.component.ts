import { NgModule, Component, OnInit,ViewEncapsulation, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DatatableData } from '../../data-tables/datatables.data';
import { ColumnMode,DatatableComponent,SelectionType } from '@swimlane/ngx-datatable';
import { WkDatatableData } from '../../data-tables/workstreamdttbl.data';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as XLSX from 'xlsx';
import { ApiService } from '../../Api/api.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { GlobalConstants } from '../../common/global-constants';


@Component({
  selector: 'app-work-allotment',
  templateUrl: './work-allotment.component.html',
  styleUrls: ['./work-allotment.component.scss',],
  encapsulation: ViewEncapsulation.None
})

export class WorkAllotmentComponent implements OnInit {
  isCollapsed = false;
  wcount : any = 0;

  @ViewChild('x') public tooltip: NgbTooltip;

   // public
   public contentHeader: object;
   public entities : any;
   public runs : any;
   public minDate: any;
   gstateId: any = '';
   seltdAssociate : any = [];
   seltdAssociate2 : any = 0;
   selectedRecvDt :  any = "";
   services : any;
   allotstep : any;
    allotbtn : any = false;
    bulkbtn : any = false;
    enaUploadBtn: any = false;
    enaSplitBtn: any = false;
   checkasingle : any = '';
   checkall : any = '';
   gridPos : any = 1;
   workstreamData: any;
   walotRegions : any;
   walotServices : any;
   walotBatches: any;
   modifyGridTbl : any;
   seqType = 'seq';
   bulkwrkStrmName : AnalyserNode;
   blkUploadfile : any = false;
   splitGridShow: any = false;
   uploadedFilename : any = '';
   selectedCount : any = 0;
   recdate: any = '';
   tabHeaders: any = [];
   splitVal:any = 0;
   splitMapsData:any = [];
   finalSplitMapsData: any = [];
   splitCheckedList: any = 0;
   mapsearchtext:any = '';
   enaSea: any = 0;
   wsId: any;
   srId: any;
   // row data
   public mapsData : any = [];
   public resetData  : any = [];
   public customGridData = WkDatatableData;
   public userRole = localStorage.getItem('Role');
   //Excel Upload
   private spread;
   private excelIO;
   public exlsJson : any = [];
   public uploadExlsJson : any = [];
   public finalExcelJson : any = [];
   public userGrid : any = [];
   public userObj : any;
   excelUpload = false;

  public userCustomGrid : any;
  public showMng : false;

   // multi Purpose datatable Row data
  public multiPurposeRows = DatatableData;

  public ColumnMode = ColumnMode;
  public mapSearch = false;
  public mapsearchvar = '';
  public postData = [];

  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild('tableRowDetails') tableRowDetails: any;
  @ViewChild('tableResponsive') tableResponsive: any;
  @ViewChild('csvReader', { static: false }) csvReader: any;

  public expanded: any = {};
  allRowsSelected : any = false;

  public editing = {};

  public chkBoxSelected = [];
  public SelectionType = SelectionType;

  // server side row data
  public serverSideRowData;

  // private
  private tempData = [];
  private multiPurposeTemp = [];
  public isMasterSel :  any = false;
  public isMasterSel2 : any = false;
  public modifyGrid : any = false;
  checkedCategoryList:any = [];
  selectedWrkStrm : any = '';
  seltdService : any = '';
  userSteps : any = [];
  userSteps2 : any [];
  userStepsCopy : any = {};
  alltSteps : any = {};
  receivedDates :  any = [];
  empName  = localStorage.getItem("Name");
  empId = localStorage.getItem("LoginId");
  curDate = new Date().toISOString().slice(0, 10)
  /**
   * Constructor
   *
   * @param {HttpClient} http
   */
   waSearchFm: FormGroup = new FormGroup({
      stepname: new FormControl(''),
      wsname: new FormControl(''),
      region: new FormControl(''),
      service: new FormControl(''),
      state: new FormControl('')
     
  });

  waSearchFmb: FormGroup = new FormGroup({
    bstepname: new FormControl(''),
    bwsname: new FormControl(''),
    bservice: new FormControl(''),
    bstate : new FormControl('')
});

  submitted = false;
  submittedb = false;
  allMasterInfo;

  constructor(public globalConst: GlobalConstants,private spinner: NgxSpinnerService,public router : Router,private Apiservice: ApiService,private fb: FormBuilder,private http: HttpClient) {

    this.tempData = DatatableData;
    this.multiPurposeTemp = DatatableData;
    const current = new Date();
    this.minDate = {
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      day: current.getDate()
    };
    // this.customGridData = this.customGridData;

    // this.userCustomGrid = {
    //   "Record Type" : this.customGridData[0].recordType,
    //   "Folder Name" : this.customGridData[0].folderName,
    //   "Remarks" : this.customGridData[0].remarks,
    //   "Query Number" : this.customGridData[0].queryNumber,
    //   "Currency" : this.customGridData[0].currency,
    //   "TL Name" : this.customGridData[0].tlName,
    //   "Operator Name" : this.customGridData[0].operatorName
    // }
  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit() {
    this.spinner.show();
    var loginfo = localStorage.getItem('CorpId')

    if(loginfo == '' || loginfo == null || loginfo == 'null'){
      this.router.navigate(['/pages/login']);
    }

    this.selectedWrkStrm = localStorage.getItem('selectedWrkStrm');
    //console.log('Sel work strm --->', this.selectedWrkStrm)

    if(this.selectedWrkStrm == '' || this.selectedWrkStrm == null){
      this.swapAlerts('Please select Workstream.!', 'swal2-warning')
    }

    // Initially load first page
    this.waSearchFm = this.fb.group({
      stepname: ['', Validators.required],
      wsname: ['', Validators.required],
      region: [''],
      service: ['', Validators.required],
      state: [''],
    
    }
    );

     // Initially load first page
     this.waSearchFmb = this.fb.group({
      bstepname: ['', Validators.required],
      bwsname: ['', Validators.required],
      bservice: ['', Validators.required],
      bstate : ['', Validators.required]
    }
    );

    if(this.userRole.includes("Manager")){
      this.showMng = false;
      // this.getUserWiseSteps();
      this.GetWorkstream();
      //this.getServiceslist('a');
    }else if(this.userRole == 'User'){
      this.gettingUserGrid();
    }
    this.GettingUserWCustomGrid();
    //this.gettingUsersinfo();
    this.GetAllMasterInfo();
    //this.GetWorkAllotBulkList();
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
    var allMasterinfo = localStorage.getItem('allMasterinfo');
    // if(allMasterinfo != ''){
    //   allMasterinfo = JSON.parse(allMasterinfo);
    // }
    // if(allMasterinfo != undefined && allMasterinfo.length > 0){
    //   this.allMasterInfo = allMasterinfo;
    //   console.log('Get All List LStorage-->',allMasterinfo);
    // }else{
    //   this.Apiservice.get('WorkAllotment/GetDetailedList?wid='+str).subscribe((data: any) => {
    //     console.log('Get All List DB-->',data);
    //     if (data.Item1 == false && data.Item2 == 'You are not authorized to access!')
    //     {
    //     // alert('Hello..! ')
    //       Swal.fire({text: data.Item2,icon: 'warning'}).then(function(){
    //         window.localStorage.clear();
    //         this.router.navigate(['/pages/login']);
    //       });
    //       this.spinner.hide(); 
    //       //return;
    //     }
    //     this.allMasterInfo = data;
    //     localStorage.setItem('allMasterinfo',JSON.stringify(this.allMasterInfo));
    //   });
    // }
    this.Apiservice.get('WorkAllotment/GetDetailedList?wid='+str).subscribe((data: any) => {
      console.log('Get All List DB-->',data);
      if (data.Item1 == false && data.Item2 == 'You are not authorized to access!')
      {
      // alert('Hello..! ')
        Swal.fire({text: data.Item2,icon: 'warning'}).then(function(){
          window.localStorage.clear();
          this.router.navigate(['/pages/login']);
        });
        this.spinner.hide();
        //return;
      }
      this.allMasterInfo = data;
      localStorage.setItem('allMasterinfo',JSON.stringify(this.allMasterInfo));
    });
  }

  //Getting Bulk Work allotment data for excel
  GetWorkAllotBulkList(){
    this.Apiservice.get('WorkAllotment/GetWorkAllotmentList?empId='+this.empId+'&wname&statename&servicename&stepName').subscribe((data: any) => {
      console.log('WKA Bulk List -->',data);
      if (data.Item1 == false && data.Item2 == 'You are not authorized to access!')
      {
      // alert('Hello..! ')
        Swal.fire({text: data.Item2,icon: 'warning'}).then(function(){
          window.localStorage.clear();
          this.router.navigate(['/pages/login']);
        });
        this.spinner.hide();
        //return;
      }
      this.exlsJson = data;
    });
  }

  //Change custome grid options
  changeCustomGrid(evnt,ind){
    console.log('Grid Status-->', evnt.target.checked)
    if(evnt.target.checked == true){
      this.userCustomGrid[ind] = 'Y';
    }else{
      this.userCustomGrid[ind] = 'N';
    }

    console.log('Final Grid ---->', this.userCustomGrid)
  }

  //Getting the count of work allotment list
  getCountval(cnt){
    //console.log('Get Count-->', cnt)
    var startIndex = 0;
    var endIndex = cnt;
    const finalAry = [];
    //alert(cnt)
    if(cnt > 0){
      if(this.modifyGrid){
        this.modifyGridTbl.forEach(x => {
            x.chk = false;
        });
      }else{
        this.mapsData.forEach(y => {
          y.chk = false;
        });
      }
    }
  

    //Show error if the count grater than data grid
    if(this.modifyGrid){
      if(cnt > this.modifyGridTbl.length){
        this.wcount = 0;
        return Swal.fire({
          icon: 'warning',title: '',text: "Given count cann't be grater than "+(this.modifyGridTbl.length+1),
          customClass: {
            confirmButton: 'btn btn-danger',
          },
          buttonsStyling: false
        }).then(function() {
            return false;
        });
      }
    }else{
      if(cnt > this.mapsData.length){
        this.wcount = 0;
        return Swal.fire({
          icon: 'warning',title: '',text: "Given count cann't be grater than "+(this.mapsData.length+1),
          customClass: {
            confirmButton: 'btn btn-danger',

          },
          buttonsStyling: false
        }).then(function() {
            return false;
        });
      }
    }

    //Random
    if(this.seqType == 'rand'){
      var selectGrid = [];

      if(this.modifyGrid){
        selectGrid = this.modifyGridTbl;
      }else{
        selectGrid = this.mapsData;
      }

      var arr = [];
      while(arr.length < cnt){
          var r = Math.floor(Math.random() * selectGrid.length);
          if(arr.indexOf(r) === -1){
            arr.push(r);
          }
      }

      const randAry = [];
      for(var x=0;x < arr.length;x++){
        randAry.push(selectGrid[arr[x]])
      }

      if(this.modifyGrid){
        //this.modifyGridTbl = randAry;
        var resp = this.modifyGridTbl.filter(x => !randAry.some(y => x.map === y.map));
        this.modifyGridTbl = [];
        this.modifyGridTbl = randAry.concat(resp);
      }else{
        //this.mapsData = randAry;
        var resp = this.mapsData.filter(x => !randAry.some(y => x.map === y.map));
        this.mapsData = [];
        this.mapsData = randAry.concat(resp);
        //console.log('filterd obj-->', this.mapsData);
      }

    }
    //else if(this.seqType == 'seq'){

    if(this.modifyGrid){
      this.modifyGridTbl.slice(startIndex, endIndex).map((item, i) => {
        item.chk = true;
        //return finalAry.push(item);
      });
      //this.modifyGridTbl = finalAry;
    }else{
      this.mapsData.slice(startIndex, endIndex).map((item, i) => {
        item.chk = true;
        //return finalAry.push(item);
      });
      //this.mapsData = finalAry;
    }
    //}



    this.allRowsSelected = true;
    this.isAllSelected();
    //console.log('Final Ary - >', finalAry)
  }

  getRandomNumberBetween(min,max){
    return Math.floor(Math.random()*(max-min+1)+min);
  }

   // Upload Splited Maps
   SaveSplitedMaps(){
      console.log(this.finalSplitMapsData)
      this.splitGridShow = false;
      
      //return
      let obj1 = []
      var userId = localStorage.getItem('LoginId');
      this.spinner.show();
      if(this.finalSplitMapsData==undefined || this.finalSplitMapsData.length==0){
        this.spinner.hide();
        this.resetAll();
        Swal.fire({text: "Please Upload the file",icon: 'warning'});}
        else{
          this.finalSplitMapsData.forEach(sp => {
              if(sp.chkStatus == false)
              {
                obj1.push(sp)
              }
          });
          console.log(obj1);
          obj1.forEach(d => {
            delete d.chkStatus;
          })
          console.log(obj1)            
            let obj={
              "splitList": obj1,
              "createdById": Number(userId)             
             }
          
          console.log(obj)
        // return;
          this.Apiservice.postmethod('Maps/BulkSaveSplitMaps', obj).subscribe((data:any)=>{
            console.log('Response --->',data);
            // this.globalConst.checkOriginAccess(data);
       
            if(data == null || data == 'null'){
             this.spinner.hide();
             this.resetAll();
             Swal.fire({text: "Insertion Failed!",icon: 'error'});
           }
           
           if(data.length == 0){
            //  this.pasteerrorData=data.item1;
            //  this.IsShowTbl=false;
            //  this.pasteerror=true;
             this.spinner.hide();
             Swal.fire({text: "Maps Uploaded Successfullly!",icon: 'success'}).then(function() {
               this.resetAll();
               this.splitGridShow = false
             });
             this.fileReset();
           }
           else if(data.length > 0){
               this.spinner.hide();
               this.resetAll();
               var resp = []
            
               var htmlbody = `<h6>Please check the remarks below.!</h6><br>
                   <center>
                   <table  id="table" border=1 class="table m-0 custmTbl" style="text-align:center;font-size:9px;font-weight:bold">
                   <thead class="thead-dark">
                       <tr>
                           <th>Maps</th>
                           <th>Remakrs</th>
                       </tr>
                   </thead>
                   <tbody>`;
                  for(var x=0; x < data.length; x++){
                   htmlbody = htmlbody + `<tr>`
                           +`<td>`+data[x]?.map+`</td>`
                           +`<td>`+data[x]?.remarks+`</td>`
       
                       +`</tr>`
                     }
                   htmlbody = htmlbody + `</tbody>
                   </table>
                   </center>`;
                this.spinner.hide();
               Swal.fire({html : htmlbody,text: "",icon: 'error',width: '500px'});
            }
           
          });
         
        }
    }
      
   

    // In insert map date conversion method

 dateFormatChange(cDate){

  const year = cDate.substring(6,10);
 const month = cDate.substring(3,5);
 const day = cDate.substring(0,2);
 return (year + '-' + month + '-' + day)
 
 }
   // changeDate
   filDate(che){
      return(che.substr(0,10))
   }
  //Getting the emp select info
  insertMaps(emp){
    //console.log("emp-->",emp)
    this.spinner.show();

    var userId = localStorage.getItem('LoginId');
    var frmObj = this.waSearchFm.value;
    var assoctId = this.seltdAssociate;
    //console.log("emp -->",assoctId);
    if((this.waSearchFm.get('stepname').value == undefined || this.waSearchFm.get('stepname').value =='') && !this.modifyGrid){
      this.spinner.hide();
      Swal.fire({
        icon: 'error',title: '',text: 'Please select step to continue..!',
        customClass: {
          confirmButton: 'btn btn-danger'
        },
        buttonsStyling: false
      });
      return false;
    }

    //frmObj.recdate = (frmObj.recdate.year +'-'+ frmObj.recdate.month +'-'+ frmObj.recdate.day + ' 00:00:00.000').toString();
    var mdfyRecDate = '';
    mdfyRecDate = this.selectedRecvDt;
    var mdfyRecDate2 = ''
    if(mdfyRecDate != ''){
      mdfyRecDate2 = mdfyRecDate + ' 00:00:00.000';
    }



    var getMapsList = {
      'wname' : Number(frmObj.wsname),
      'servicename' : frmObj.service,
      'statename' : frmObj.state,
      'date' : this.recdate,
      'step' : this.waSearchFm.get('stepname').value
    }


    console.log('Selected Associate Id-->', getMapsList);
    // return;

    if(this.modifyGrid){
      var finalPost = {
        'modifiedList' : [],
        'createdById': userId.toString()
      }

      this.modifyGridTbl = this.modifyGridTbl.filter(x => x.chk === true);
      console.log('Checked List-->', this.modifyGridTbl);
      if(this.modifyGridTbl.length == 0){
        this.spinner.hide();
        this.swapErrorAlerts('Please select atleast 1 reocrds.!');
        this.spinner.hide();
        return false;
      }
     console.log('Table td --->', this.modifyGridTbl);
     // return;
      this.modifyGridTbl.forEach(x => {
        if(x.chk == true){

          var obj =  {
            "workstream": getMapsList.wname.toString(),
            "service": getMapsList.servicename.toString(),
            "state": x.batch,
            "date": this.formatDate2(x.alloted_date),
            "map": x.map.toString(),
            "map_type": x.map_type.toString(),
            "assoc": assoctId.toString(),
            "stepId": (getMapsList?.step.toString() == '1' ? '2' : getMapsList?.step.toString()),
            "empid": x.alloted_to.toString(),
          }

          finalPost.modifiedList.push(obj);
        }
      });

      console.log('Modify Maps Insert Obj -->', finalPost);
     // return;

      if(assoctId > 0 && finalPost.modifiedList.length > 0){
    
        this.Apiservice.postmethod('ModifyAllotment/BulkModifyMaps',finalPost).subscribe((data: any) => {
          console.log("Modify Maps Insert Result --->", data);
          if (data.Item1 == false && data.Item2 == 'You are not authorized to access!')
          {
          // alert('Hello..! ')
            Swal.fire({text: data.Item2,icon: 'warning'}).then(function(){
              window.localStorage.clear();
              this.router.navigate(['/pages/login']);
            });
            this.spinner.hide();
            //return;
          }

          this.spinner.hide();
          if(data.length == 0){
            this.seltdAssociate = [];
              Swal.fire({
                icon: 'success',title: '',text: 'Updated Successfully..!',
                customClass: {
                  confirmButton: 'btn btn-success'
                },
                buttonsStyling: false
              });
          }else if(data.length > 0){
            var htmlbody = `<h6>These maps are already allotted</h6><br>
            <center>
            <table  id="table" border=1 class="table m-0 custmTbl" style="font-size:9px;font-weight:bold">
            <thead class="thead-dark">
                <tr>
                    <th>Workstream</th>
                    <th>Service</th>
                    <th>Step</th>
                    <th>Record</th>
                    <th>Allot To</th>
                    <th>Allot By</th>
                    <th>Remarks</th>
                </tr>
            </thead>
            <tbody>`;
           for(var x=0; x < data.length; x++){
            console.log('Dt --->', data[x]?.map);
            htmlbody = htmlbody + `<tr>`
                    +`<td>`+data[x]?.workstream+`</td>`
                    +`<td>`+data[x]?.service+`</td>`
                    +`<td>`+data[x]?.stepId+`</td>`
                    +`<td>`+data[x]?.map+`</td>`
                    +`<td>`+data[x]?.assoc+`</td>`
                    +`<td>`+data[x]?.alloted_by+`</td>`
                    +`<td>`+data[x]?.remarks+`</td>`
                +`</tr>`
              }
            htmlbody = htmlbody + `</tbody>
            </table>
            </center>`;


            this.spinner.hide();

            Swal.fire({html : htmlbody,text: "",icon: 'success',width: '1000px'});
          }
          else{
            this.swapErrorAlerts('Unable to Update due to invalid input.!');
          }
          this.onSubmit()
        });
      }
    }else{
      var finalPost2 = {"newsList" : []}
      this.mapsData = this.mapsData.filter(x => x.chk === true);
      // console.log('Checked List-->', this.mapsData);
      // return;

      if(this.mapsData.length == 0){
        this.swapErrorAlerts('Please select atleast 1 reocrds.!');
        this.spinner.hide();
        return false;
      }

      this.mapsData.forEach(x => {
        if(x.chk == true){
            var obj =  {
                "workstream": getMapsList.wname.toString(),
                "service": getMapsList.servicename.toString(),
                "state": x.batch,
                "date": x.inst_date,
                "map": x.map.toString(),
                "map_type": x.map_type.toString(),
                "assoc": assoctId.toString(),
                "empid": userId.toString(),
                "stepId": (getMapsList?.step.toString() == '1' ? this.userSteps[1].step_id : getMapsList?.step.toString()),
                "prmcurrency": "3"
            }


            finalPost2.newsList.push(obj)
        }
      });
      // console.log('Maps Insert Obj -->', finalPost2);
      // return;
      if(assoctId > 0 && finalPost2.newsList.length > 0){
        this.Apiservice.postmethod('WorkAllotment/BulkSaveNewAllot',finalPost2).subscribe((data: any) => {
          console.log("Maps Insert Result --->", data);
          if (data.Item1 == false && data.Item2 == 'You are not authorized to access!')
          {
          // alert('Hello..! ')
            Swal.fire({text: data.Item2,icon: 'warning'}).then(function(){
              window.localStorage.clear();
              this.router.navigate(['/pages/login']);
            });
            this.spinner.hide();
            //return;
          }


          this.wcount = 0;
          if(data.length == 0){
            Swal.fire({
              icon: 'success',title: '',text: 'Updated Successfully..!',
              customClass: {
                confirmButton: 'btn btn-success'
              },
              buttonsStyling: false
            }).then(function() {
              //window.location.reload();
            });

          }else{
            var htmlbody = `<h6>Below maps are unable to Allot.!</h6><br>
            <center>
            <table  id="table" border=1 class="table m-0 custmTbl" style="font-size:9px;font-weight:bold">
            <thead class="thead-dark">
                <tr>
                    <th>Record</th>
                    <th>Allot To</th>
                    <th>Allot By</th>
                    <th>Step</th>
                </tr>
            </thead>
            <tbody>`;
           for(var x=0; x < data.length; x++){
            console.log('Dt --->', data[x]?.map);
            htmlbody = htmlbody + `<tr>`
                    +`<td>`+data[x]?.map+`</td>`
                    +`<td>`+data[x]?.empid+`</td>`
                    +`<td>`+data[x]?.assoc+`</td>`
                    +`<td>`+data[x]?.step+`</td>`
                +`</tr>`
              }
            htmlbody = htmlbody + `</tbody>
            </table>
            </center>`;


            this.spinner.hide();

            Swal.fire({html : htmlbody,text: "",icon: 'error',width: '600px'});
          }

          this.onSubmit();
        });
      }
    }

  }

  swapErrorAlerts(msg){
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

   swapSuccessAlerts(msg,typ){
    return Swal.fire({
       icon: 'success',title: '',text: msg,
       customClass: {
         confirmButton: 'btn btn-success'
       },
       buttonsStyling: false
     }).then(function() {
        if(typ == 'bulk update'){
          this.onSubmit();
        }
     });
   }

  //Received Date
  selectedRecvDate(rd){
    var frmObj = this.waSearchFm.value;
    this.selectedRecvDt = rd;
  }

  //Check selected count row
  checkUncheckAll() {
      //console.log('Grid Type-->', this.modifyGrid)
      if(this.modifyGrid){
        for (var i = 0; i < this.modifyGridTbl.length; i++) {
          this.modifyGridTbl[i].chk = this.isMasterSel2;
        }
      }else{
        for (var i = 0; i < this.mapsData.length; i++) {
          this.mapsData[i].chk = this.isMasterSel;
        }
      }

    this.getCheckedItemList();
  }

  getCheckedItemList(){
    this.spinner.show();
    this.checkedCategoryList = [];
      if(this.modifyGrid){
        for (var i = 0; i < this.modifyGridTbl.length; i++) {
          if(this.modifyGridTbl[i].chk)
            this.checkedCategoryList.push(this.modifyGridTbl[i]);
        }
      }else{
        for (var i = 0; i < this.mapsData.length; i++) {
          if(this.mapsData[i].chk)
            this.checkedCategoryList.push(this.mapsData[i]);
        }
      }
      this.spinner.hide();
    //this.checkedCategoryList = JSON.stringify(this.checkedCategoryList);
    console.log('Checed List -->', this.checkedCategoryList);

    if(this.checkedCategoryList.length > 0){
      this.allotbtn = true;
      this.getActionActive();
    }else{
      this.allotbtn = false;
      this.wcount = 0;
      this.getActionActive();
    }
  }


  isAllSelected() {
    if(this.modifyGrid){
      this.isMasterSel2 = this.modifyGridTbl.every(function(item:any) {
        return item.chk == true;
      })
    }else{
      this.isMasterSel = this.mapsData.every(function(item:any) {
        return item.chk == true;
      })
    }

    this.getCheckedItemList();
  }

  checkEmpty(){
    //console.log('Checking ..!' , this.wcount)
    if(this.wcount == 0 || this.wcount == null){
      //this.mapsData = this.resetData;
      if(this.modifyGrid){
        this.modifyGridTbl = this.resetData;
      }else{
        this.mapsData = this.resetData;
      }

      this.checkUncheckAll();
    }else if(this.wcount == ''){
      this.wcount = 0;
      if(this.modifyGrid){
        this.modifyGridTbl = this.resetData;
      }else{
        this.mapsData = this.resetData;
      }
    }
  }

  //Form Validations

  get f(): { [key: string]: AbstractControl } {
    return this.waSearchFm.controls;
  }

  //Bulk work allot search
  //Form Submition
  onSubmitb() {
    //console.log('Submit working...!')
    this.exlsJson = [];
    this.uploadExlsJson = [];

    this.spinner.show();

    if (this.waSearchFmb.invalid) {
      //alert('Form Submitted succesfully!!!\n Check the values in browser console.');
      this.spinner.hide();
      console.table(this.waSearchFmb.value);
    }else{
      var frmObj = this.waSearchFmb.value;
      //var wid = frmObj.bwsname;var sid = frmObj.bservice;var stp = frmObj.bstepname;
      var wid = frmObj.bwsname;var sid = frmObj.bservice;var stp = frmObj.bstepname;var ssid =frmObj.bstate;
      // wid = 10;
      // sid = 9;
      this.Apiservice.get('WorkAllotment/GetBulkWorkAllotList?wid='+wid+'&sid='+sid+'&ssid='+ssid+'&Stepid='+stp).subscribe((data: any) => {
        console.log('WKA Bulk List Main-->',data);
         if (data.Item1 == false && data.Item2 == 'You are not authorized to access!')
          {
          // alert('Hello..! ')
            Swal.fire({text: data.Item2,icon: 'warning'}).then(function(){
              window.localStorage.clear();
              this.router.navigate(['/pages/login']);
            });
            this.spinner.hide();
            //return;
          }
        this.exlsJson = data;

        this.submittedb = true;
        if(this.exlsJson.length == 0){
          this.bulkbtn = true;
        }
        this.spinner.hide();
      });
    }
  }
  //Get only non splited maps
   //Form Submition
   onSubmits() {
    //console.log('Submit working...!')
    this.splitGridShow = true;
    
    this.enaSea = 1;
    this.checkedCategoryList = [];
    this.basicReset();
    this.spinner.show();
    if (this.waSearchFm.invalid) {
      //alert('Form Submitted succesfully!!!\n Check the values in browser console.');
      this.spinner.hide();
      console.table(this.waSearchFm.value);
    }else{
        this.modifyGridTbl = [];
        this.mapsData = [];
        this.resetData = [];

        var frmObj = this.waSearchFm.value;
        var mdfyRecDate = '';
      
        var fdt = this.recdate.year + '-' + this.recdate.month + '-' + this.recdate.day
    
        var selDate = new Date(fdt);
        var fdt2 = this.formatDate2(selDate);
      
        mdfyRecDate = fdt2;

        var mdfyRecDate2 = '';
        if(mdfyRecDate != '' && mdfyRecDate != 'NaN-aN-aN 00:00:00.000'){
          
          mdfyRecDate2 = mdfyRecDate;
          // alert(mdfyRecDate2)
        }
        if(mdfyRecDate == 'NaN-aN-aN 00:00:00.000'){
          
          mdfyRecDate = '';
          // alert(mdfyRecDate2)
        }

        var getMapsList = {
          'wname' : Number(frmObj.wsname),
          'region' : frmObj.region.toString(),
          'servicename' : frmObj.service.toString(),
          'statename' : frmObj.state.toString(),
          'date' : fdt2,
          'step' : (frmObj.stepname == '' ? '1' : frmObj.stepname.toString())
        }

        //console.log('Submit working 2...!',getMapsList);
        if(this.modifyGrid){
          var userId = localStorage.getItem('LoginId');
          //console.log('Grid-->', 'WorkAllotment/GetModifyAllot?wname='+getMapsList.wname+'&servicename='+getMapsList.servicename+'&statename='+getMapsList.statename+'&w_date='+mdfyRecDate+'&step='+getMapsList.step+'&id='+userId);
          this.Apiservice.get('WorkAllotment/GetModifyAllot?wname='+getMapsList.wname+'&servicename='+getMapsList.servicename+'&statename='+getMapsList.statename+'&w_date='+mdfyRecDate+'&step='+getMapsList.step+'&id='+userId).subscribe((data: any) => {
            console.log("Modify WorkAllotments List--->", data);
            if (data.Item1 == false && data.Item2 == 'You are not authorized to access!')
            {
            // alert('Hello..! ')
              Swal.fire({text: data.Item2,icon: 'warning'}).then(function(){
                window.localStorage.clear();
                this.router.navigate(['/pages/login']);
              });
              this.spinner.hide();
              //return;
            }

            this.modifyGridTbl = data;
            this.resetData = data;
            this.submitted = true;
            this.spinner.hide();
          });
        }else{
        
          //console.log('Grid-->', 'WorkAllotment/GetMapsList?wname='+getMapsList.wname+'&servicename='+getMapsList.servicename+'&statename='+getMapsList.statename+'&date='+mdfyRecDate2);
          this.Apiservice.get('WorkAllotment/GetSplitMapsList?wname='+getMapsList.wname+'&servicename='+getMapsList.servicename+'&statename='+getMapsList.statename+'&date='+mdfyRecDate2+'&step='+getMapsList.step+'&region='+getMapsList.region).subscribe((data: any) => {
            console.log("Maps List--->", data);
             if (data.Item1 == false && data.Item2 == 'You are not authorized to access!')
            {
            // alert('Hello..! ')
              Swal.fire({text: data.Item2,icon: 'warning'}).then(function(){
                window.localStorage.clear();
                this.router.navigate(['/pages/login']);
              });
              this.spinner.hide();
              //return;
            }
            this.splitMapsData = data;
            if(this.splitMapsData.length > 0){
              this.splitVal = 1;
              this.splitMapsData.forEach(s => {
               s.seditbles = false;
               s.chkStatus = true;
               s.splitCount = 0;
             });
           }
           else
               this.splitVal = 0;
          
            this.mapsData = data;
            this.resetData = data;
            this.submitted = true;
            if(this.mapsData.length > 0){
              this.mapsData.forEach(e => {
                e.editable = false;
                e.editables = false;
              });
              console.log(this.mapsData)
              console.log('Selected Step -->', this.waSearchFm.get('stepname').value);
              var slstep =  this.waSearchFm.get('stepname').value;
              var stps = this.userSteps;

              if(slstep == 1){
                var ind = stps.findIndex(y => y.step_id == slstep);
                this.userStepsCopy = [];
                console.log('sel ind -->', ind);
                this.userStepsCopy.push(stps[ind+1]);
              }else{
                var ind = stps.findIndex(y => y.step_id == slstep);
                this.userStepsCopy = [];
                console.log('sel ind -->', ind);
                this.userStepsCopy.push(stps[ind]);
              }
            }


            this.spinner.hide();
          });
        }

        this.allRowsSelected = false;
        this.isMasterSel = false;
        this.isMasterSel2 = false;


        //this.spinner.hide();
    }
  }
  //Form Submition
  onSubmit() {
    //console.log('Submit working...!')
    this.splitGridShow = false;
    this.checkedCategoryList = [];
    this.basicReset();
    this.spinner.show();
    if (this.waSearchFm.invalid) {
      //alert('Form Submitted succesfully!!!\n Check the values in browser console.');
      this.spinner.hide();
      console.table(this.waSearchFm.value);
    }else{
        this.modifyGridTbl = [];
        this.mapsData = [];
        this.resetData = [];

        var frmObj = this.waSearchFm.value;
        var mdfyRecDate = '';
      
        var fdt = this.recdate.year + '-' + this.recdate.month + '-' + this.recdate.day
    
        var selDate = new Date(fdt);
        var fdt2 = this.formatDate2(selDate);
      
        mdfyRecDate = fdt2;

        var mdfyRecDate2 = '';
        if(mdfyRecDate != '' && mdfyRecDate != 'NaN-aN-aN 00:00:00.000'){
          
          mdfyRecDate2 = mdfyRecDate;
          // alert(mdfyRecDate2)
        }
        if(mdfyRecDate == 'NaN-aN-aN 00:00:00.000'){
          
          mdfyRecDate = '';
          // alert(mdfyRecDate2)
        }

        var getMapsList = {
          'wname' : Number(frmObj.wsname),
          'region' : frmObj.region.toString(),
          'servicename' : frmObj.service.toString(),
          'statename' : frmObj.state.toString(),
          'date' : fdt2,
          'step' : (frmObj.stepname == '' ? '1' : frmObj.stepname.toString())
        }

        //console.log('Submit working 2...!',getMapsList);
        if(this.modifyGrid){
          var userId = localStorage.getItem('LoginId');
          //console.log('Grid-->', 'WorkAllotment/GetModifyAllot?wname='+getMapsList.wname+'&servicename='+getMapsList.servicename+'&statename='+getMapsList.statename+'&w_date='+mdfyRecDate+'&step='+getMapsList.step+'&id='+userId);
          this.Apiservice.get('WorkAllotment/GetModifyAllot?wname='+getMapsList.wname+'&servicename='+getMapsList.servicename+'&statename='+getMapsList.statename+'&w_date='+mdfyRecDate+'&step='+getMapsList.step+'&id='+userId).subscribe((data: any) => {
            console.log("Modify WorkAllotments List--->", data);
            if (data.Item1 == false && data.Item2 == 'You are not authorized to access!')
            {
            // alert('Hello..! ')
              Swal.fire({text: data.Item2,icon: 'warning'}).then(function(){
                window.localStorage.clear();
                this.router.navigate(['/pages/login']);
              });
              this.spinner.hide();
              //return;
            }

            this.modifyGridTbl = data;
            this.resetData = data;
            this.submitted = true;
            this.spinner.hide();
          });
        }else{
        
          //console.log('Grid-->', 'WorkAllotment/GetMapsList?wname='+getMapsList.wname+'&servicename='+getMapsList.servicename+'&statename='+getMapsList.statename+'&date='+mdfyRecDate2);
          this.Apiservice.get('WorkAllotment/GetMapsList?wname='+getMapsList.wname+'&servicename='+getMapsList.servicename+'&statename='+getMapsList.statename+'&date='+mdfyRecDate2+'&step='+getMapsList.step+'&region='+getMapsList.region).subscribe((data: any) => {
            console.log("Maps List--->", data);
             if (data.Item1 == false && data.Item2 == 'You are not authorized to access!')
            {
            // alert('Hello..! ')
              Swal.fire({text: data.Item2,icon: 'warning'}).then(function(){
                window.localStorage.clear();
                this.router.navigate(['/pages/login']);
              });
              this.spinner.hide();
              //return;
            }
            this.splitMapsData = data;
            if(this.splitMapsData.length > 0){
              this.splitVal = 1;
              this.splitMapsData.forEach(s => {
               s.seditbles = false;
               s.chkStatus = true;
               s.splitCount = 0;
             });
           }
           else
               this.splitVal = 0;
          
            this.mapsData = data;
            this.resetData = data;
            this.submitted = true;
            if(this.mapsData.length > 0){
              this.mapsData.forEach(e => {
                e.editable = false;
                e.editables = false;
              });
              console.log(this.mapsData)
              console.log('Selected Step -->', this.waSearchFm.get('stepname').value);
              var slstep =  this.waSearchFm.get('stepname').value;
              var stps = this.userSteps;

              if(slstep == 1){
                var ind = stps.findIndex(y => y.step_id == slstep);
                this.userStepsCopy = [];
                console.log('sel ind -->', ind);
                this.userStepsCopy.push(stps[ind+1]);
              }else{
                var ind = stps.findIndex(y => y.step_id == slstep);
                this.userStepsCopy = [];
                console.log('sel ind -->', ind);
                this.userStepsCopy.push(stps[ind]);
              }
            }


            this.spinner.hide();
          });
        }

        this.allRowsSelected = false;
        this.isMasterSel = false;
        this.isMasterSel2 = false;


        //this.spinner.hide();
    }
  }
  enableSplitCount(dat){
    console.log(dat)
    this.enaSplitBtn = true;
    this.splitMapsData.forEach(element => {
      if(element.chkStatus == false){
        this.splitCheckedList++;

      }
      
    });
    if(dat.chk== true)
       dat.seditbles = true;
       else
       dat.seditbles =false;
 }
 getSplitMaps(){
  this.enaUploadBtn = true;
  let obj =[];
  let obj3 = [];
  console.log(this.splitMapsData)
   this.splitMapsData.forEach(element => {
        if(element.splitCount != 0)
        {
           const temp = element.map;
           const spCount = element.splitCount;
           const orgUnits = element.entities;
         for(var i=1; i <= element.splitCount; i++)
          {
            let obj1 = {}
            let obj2 = {}
              obj1 = {
              "w_name": element.w_name,
              "region_name": element.region_name,
              "service_name": element.service_name,
              "batch_name": element.batch_name,
              "map" : temp + '_' + i,
              "map_type": element.map_type,
              "inst_date": element.inst_date,
              "folder_name": element.folder_name,
              "task_manager": element.task_manager,
              "entities": (i == element.splitCount)? Math.ceil((element.entities)/(element.splitCount)): Math.floor((element.entities)/(element.splitCount)),
              "runs": element.runs,
              "complexity": element.complexity,
              "splitCount": '',
              "chkStatus": false
            }
            obj2 = {
              "mapRefID":i,
              "workstream": element.w_name,
              "region": element.region_name,
              "service": element.service_name,
              "batch": element.batch_name,
              "org_map": (i == 1)?temp:'',
              "map" : temp + '_' + i,
              "map_type": element.map_type,
              "inst_date": element.inst_date,
              "folder_name": element.folder_name,
              "task_manager": element.task_manager,
              "org_units": (i == 1)?orgUnits:'',
              "units": (i == element.splitCount)? Math.ceil((element.entities)/(element.splitCount)): Math.floor((element.entities)/(element.splitCount)),
              "runs": element.runs,
              "complexity": element.complexity,
              "splitCount": (i == 1)?spCount:'',
              "chkStatus" :false,
              "split_status":1
             
             }
          obj.push(obj1);
          obj3.push(obj2)
          
         }
         }
        else
        {
          obj.push(element);
          obj3.push(element);
        }
  });
  this.splitMapsData = obj;
  this.finalSplitMapsData = obj3;
  console.log(this.splitMapsData)
}
  // recdate
  formatDate2(date) {
    var date2 = date;
     date = new Date(date2);
    var year = date.getFullYear().toString();
 
    var month = (date.getMonth() + 101).toString().substring(1);
    var day = (date.getDate() + 100).toString().substring(1);
  
    return year + "-" + month + "-" + day + ' 00:00:00.000';
  }

  //Maps Search
  mapsearchGrid(){
    this.mapSearch = !this.mapSearch;
  }

  //Search By maps
  searchByMaps(){
    if(this.mapsearchvar != ''){
      this.Apiservice.get('WorkAllotment/GetMapsListbyMap?map='+this.mapsearchvar).subscribe((data: any) => {
        console.log("Maps List--->", data);
        if (data.Item1 == false && data.Item2 == 'You are not authorized to access!')
        {
        // alert('Hello..! ')
          Swal.fire({text: data.Item2,icon: 'warning'}).then(function(){
            window.localStorage.clear();
            this.router.navigate(['/pages/login']);
          });
          this.spinner.hide();
          //return;
        }
        this.mapsData = data;
        this.resetData = data;
        this.submitted = true;
        this.spinner.hide();
      });
    }else{
      this.swapAlerts('Please enter map.!','');
    }
  }

  basicReset(){
    this.allotbtn = false;
    this.seltdAssociate = [];
    this.seltdAssociate2 = 0;
  }

  //Grid postion
  getTabPos(gpos){
    this.gridPos = gpos;
    this.resetAll();
    this.resetbAll();
    this.userSteps = [];
    this.userSteps2 = [];
    this.userStepsCopy = [];
    this.alltSteps = [];
    this.uploadExlsJson = [];
    this.finalSplitMapsData = [];
    this.splitMapsData = [];
    this.splitCheckedList = []
    this.splitGridShow = false;
    // this.modifyGrid = true;
    this.mapsData= [];
    
  }


  //Work Allotment Bulk Upload
  onFileChangeBlkUp(ev){
    this.tabHeaders = [];
    console.log('File Upload...!', ev)
    this.spinner.show();
    this.excelUpload = true;
    this.exlsJson = [];
      let workBook = null;
      let jsonData = null;
      const reader = new FileReader();
      const file = ev.target.files[0];
      if(file){
        this.blkUploadfile = true;
        this.uploadedFilename = file.name
      }
      console.log('File Data-->', file)
      reader.onload = (event) => {
        const data = reader.result;
        workBook = XLSX.read(data, { type: 'binary', cellDates: true });
        console.log(workBook)
        jsonData = workBook.SheetNames.reduce((initial, name) => {
          const sheet = workBook.Sheets[name];
          console.log(sheet)
          initial[name] = XLSX.utils.sheet_to_json(sheet, { defval: '' , raw: false});
          return initial;
        }, {});
        console.log(jsonData)
        const dataString = JSON.parse(JSON.stringify(jsonData));
        //console.log('Sample Excel--->', dataString)
        var fileKey = Object.keys(dataString)[0];
       
        this.uploadExlsJson = dataString[fileKey];
        console.log('Excel Data--->', this.uploadExlsJson)
        this.tabHeaders.push(Object.keys(this.uploadExlsJson[0]))
        
        //return;
        var userId = localStorage.getItem('LoginId');

        const mnObj = {"mapssList" : [],
                      "empid": Number(userId)
                    };
      console.log(this.uploadExlsJson)
       //return
        this.uploadExlsJson.forEach(x => {

          //Checking Validation for Workstream
          if(x?.['Workstream'] != undefined){
            //var resp = Object.values(this.waobj).includes(this.records[s]?.['Work stream']);
            var wrkstrm = x?.['Workstream'].toString();
            const wrkresp = this.allMasterInfo.filter(function (y) { return y['w_name'] == x.Workstream});
           // console.log('Work Stream -->', wrkresp);
            if(wrkresp.length == 0){
              this.spinner.hide();
              this.swapAlerts('Please check Work stream (' + x?.['Workstream'] + ') in the uploaded file.!','');
              ev.target.value = '';
              this.fileReset();
              return false
            }
          }

          //Checking Validation for Service
          if(x?.['Service'] != undefined){
            var servc = x?.['Service'].toString();
            const resp = this.allMasterInfo.filter(function (y) { return y['service_name'] == servc});
            //console.log("service Resp -->", this.walotServices);
            if(resp.length == 0){
              this.spinner.hide();
              this.swapAlerts('Please check Service (' + servc + ') in the uploaded file.!','');
              ev.target.value = '';
              this.fileReset();
            }
          }

          //Checking Validation for State
          if(x?.['State'] != undefined){
            var btch = x?.['State'].toString();
            //const resp = this.allMasterInfo.filter(function (x) { return x.batch_name == btch});
            var services = x?.['Service'].toString();
            var resp = this.allMasterInfo.filter(function (x) { return (x.batch_name == btch && x.service_name == services)});

            if(resp.length == 0){
              this.spinner.hide();
              this.swapAlerts('Please check State (' + btch + ') in the uploaded file.!','');
              ev.target.value = '';
              this.fileReset();
              return false;
            }
          }
          // alert(x.Received+1)
          console.log(x)
          //return;
          var singlw = {
              "WorkStream": x.Workstream,
              "Service": x.Service,
              "Received_Date": x.Received,
              "Sub_Service": x['Sub Service'],
              "record": x['Record'], 
              "record_type": x['Record_type'],
              "Sourcing": (x.Sourcing ? x.Sourcing : ''),
              "Production": (x.Production ? x.Production : ''),
              "QC": (x.QC ? x.QC : ''),
              "QA": (x.QA ? x.QA : ''),
              "Rework_to_Production": (x.Rework_to_Production ? x.Rework_to_Production : ''),
              "Rework_to_QC": (x.Rework_to_QC ? x.Rework_to_QC : ''),
              "DC1":  (x['Data Capture (1-12)'] ? x['Data Capture (1-12)'] : ''),
              "DC2": (x['Data Capture (13-14)'] ? x['Data Capture (13-14)'] : ''),
              "QC1": (x['QC (1-12)'] ? x['QC (1-12)'] : ''),
              "QC2": (x['QC (13-14)'] ? x['QC (13-14)'] : ''),
              // "QA1": (x.QA1 ? x.QA1 : ''),
              // "QA2": (x.QA2 ? x.QA2 : ''),
              // "Prod_LHE": (x.Prod_LHE ? x.Prod_LHE : ''),
              // "Prod_Digi": (x.Prod_Digi ? x.Prod_Digi : ''),
              // "Prod_Grid": (x.Prod_Grid ? x.Prod_Grid : ''),
              // "QC_LHE": (x.QC_LHE ? x.QC_LHE : ''),
              // "QC_Digi": (x.QC_Digi ? x.QC_Digi : '')
              "Shipment": (x.Shipment ? x.Shipment : '')
          }

          mnObj.mapssList.push(singlw);

        });

        this.finalExcelJson = mnObj;
        console.log('Final Obj-->', mnObj);
        //document.getElementById('output').innerHTML = dataString.slice(0, 300).concat("...");
        //this.setDownload(dataString);
       //return
        this.spinner.hide();

      }
      reader.readAsBinaryString(file);
    }

    fileReset() {
      this.uploadExlsJson = [];
      return false;
    }

    postBulkWorkAllotment(){
      this.spinner.show();
      console.log('Final Obj 2-->', this.finalExcelJson);
      
      // this.finalExcelJson.mapssList.forEach(rt => {
      //   if(rt.record)
      //        rt.record = (rt.record).trim();
      //      });
      //      console.log(this.finalExcelJson)
     //return;
      if(this.finalExcelJson.mapssList.length > 0){
        this.Apiservice.postmethod('WorkAllotment/BulkSaveMapss',this.finalExcelJson).subscribe((data: any) => {
         console.log("Bulk Upload --->", data);
         if (data.Item1 == false && data.Item2 == 'You are not authorized to access!')
         {
         // alert('Hello..! ')
           Swal.fire({text: data.Item2,icon: 'warning'}).then(function(){
             window.localStorage.clear();
             this.router.navigate(['/pages/login']);
           });
           this.spinner.hide();
           //return;
         }
          if(data.length > 0){
            // var resp = []
            // data.forEach(e => {
            //     resp.push(e.record);
            // });
            // var resp2 = resp.join('\r\n');
            // var contentjson = '<h4>Below duplicate maps are not Insesrted.!</h4><span style="font-size:11px">'+resp2+'</span>';
            // Swal.fire({text: "",icon: 'error',html:contentjson});

          //   this.postData = data.filter(function (o1) {
          //     return !this.finalExcelJson.mapssList.some(function (o2) {
          //         return o1.record === o2.record; // return the ones with equal id
          //    });
          // });

            // this.postData = data.filter((x,ind) => {
            //     return (x.remarks != "Already Exists")
            // })
            console.log('Resp -->', this.postData)

            if(data.length == 0){
              this.spinner.hide();
              this.onSubmit();
              Swal.fire({text: "Maps Submited Successfullly!",icon: 'success'}).then(function() {
                //this.fileReset();
                location.reload();
              });

            }else{
              var htmlbody = `<br>
              <center>
              <table  id="table" border=1 class="table m-0 custmTbl" style="font-size:9px;font-weight:bold">
              <thead class="thead-dark">
                  <tr>
                      <th>Already exists</th>
                      <th>Success</th>
                      <th>Map doesnot exists</th>
                      <th>Same as Production</th>
                      <th>Same as QC</th>
                  </tr>
              </thead>`;
              htmlbody = htmlbody + `<tr>`
              +`<td>`+data[0].CountBulkAllot[0]?.AlreadyCount+`</td>`
              +`<td>`+data[0].CountBulkAllot[0]?.SuccessCount+`</td>`
              +`<td>`+data[0].CountBulkAllot[0]?.MapCount+`</td>`
            +`<td>`+data[0].CountBulkAllot[0]?.ProdCount+`</td>`
            +`<td>`+data[0].CountBulkAllot[0]?.QCCount+`</td>`
          +`</tr>`
      
      htmlbody = htmlbody + `</tbody>
</table><br>
              <table  id="table" border=1 class="table m-0 custmTbl" style="font-size:9px;font-weight:bold">
              <thead class="thead-dark">
                  <tr>
                      <th>Workstream</th>
                      <th>Service</th>
                      <th>Sub Service</th>
                      <th>Record</th>
                      <th>Recv Date</th>
                      <th>Alloted Step</th>
                      <th>Alloted To</th>
                      <th>Alloted By</th>
                      <th>Remarks</th>
                  </tr>
              </thead>
              <tbody>`;
             for(var x=0; x < data[0].BulkOutput.length; x++){
              console.log('Dt --->', data);
              //| date: 'YYYY/MM/dd
              htmlbody = htmlbody + `<tr>`
                      +`<td>`+data[0].BulkOutput[x]?.WorkStream+`</td>`
                      +`<td>`+data[0].BulkOutput[x]?.Service+`</td>`
                      +`<td>`+data[0].BulkOutput[x]?.Sub_Service+`</td>`
                      +`<td>`+data[0].BulkOutput[x]?.record+`</td>`
                      +`<td>`+this.getFilteredDate(data[0].BulkOutput[x]?.Received_Date)+`</td>`
                      +`<td>`+data[0].BulkOutput[x]?.alloted_step+`</td>`
                      +`<td>`+data[0].BulkOutput[x]?.alloted_to+`</td>`
                      +`<td>`+data[0].BulkOutput[x]?.alloted_by+`</td>`
                      +`<td>`+this.getRemarks(data[0].BulkOutput[x]?.remarks)+`</td>`
                  +`</tr>`
              }
              htmlbody = htmlbody + `</tbody>
              </table>
              </center>`;
                this.spinner.hide();
                Swal.fire({html : htmlbody,text: "",icon: 'success',width: '1200px'}).then(function(){
                  location.reload();
                });
            }
          }else if(data.length == 0){
            Swal.fire({text: "Updated Successfully.!",icon: 'success'}).then(function(){
              location.reload();
            });
            this.resetbAll();
            //this.onSubmitb();
          }
          this.spinner.hide();
        });
      }
    }


    getRemarks(str){

      if(str == 'Already Exists'){
        return 'Already Exists'
      }else if(str == 'Same as Prod'){
        return 'Same user for Production'
      }else if(str == 'Rework'){
        return 'Cannot allot to rework'
      }else{
        return str
      }

    }

    //Format Date
    getFilteredDate(dt){
        var dts = new Date(dt)
        var year = dts.getFullYear().toString();
        var month = (dts.getMonth() + 101).toString().substring(1);
        var day = (dts.getDate() + 100).toString().substring(1);
        return year + "-" + month + "-" + day ;
    }


    // setDownload(data) {
    //   this.willDownload = true;
    //   setTimeout(() => {
    //     const el = document.querySelector("#download");
    //     el.setAttribute("href", `data:text/json;charset=utf-8,${encodeURIComponent(data)}`);
    //     el.setAttribute("download", 'xlsxtojson.json');
    //   }, 1000)
    // }
    modifyGridTab(typ){
      //this.waSearchFm.reset();
      this.waSearchFm.controls['wsname'].setValue('');
      this.waSearchFm.controls['region'].setValue('');
      this.waSearchFm.controls['service'].setValue('');
      this.waSearchFm.controls['state'].setValue('');
      // this.waSearchFm.controls['recdate'].setValue('');
      this.recdate = '';
      this.waSearchFm.controls['stepname'].setValue('');
      this.userSteps = [];
      this.userSteps2 = [];
      this.userStepsCopy = [];
      this.wcount = 0;
      this.seltdAssociate = [];
      this.seltdAssociate2 = 0;
      this.mapsData = [];
      this.resetData = [];
      this.modifyGridTbl = [];

      if(typ == 'true'){
        this.modifyGrid = true;
      }else{
        this.modifyGrid = false;
      }

     // this.isAllSelected();
    }

    //Selected Associtate
    selectAssoate(){
      //console.log('Selected User-->', this.seltdAssociate)
      //this.seltdAssociate2 = this.seltdAssociate;
    }

    getAllotStep(stp){
      this.seltdAssociate2 = this.seltdAssociate;
      //this.getActionBtn();
      // console.log('Selected step--->', stp);
      // console.log('Selected step--->', this.allotstep);
    }

    //Getting workstreams
    GetWorkstream() {
      // alert(localStorage.getItem('LoginId'));
      let id=localStorage.getItem('LoginId');
      this.Apiservice.get('WorkAllotment/GetWorkStream?id=' + id).subscribe((data: any) => {
        console.log(data);
        this.globalConst.checkOriginAccess(data);

        this.workstreamData = data;
      });
      //this.workstreamData = JSON.parse(localStorage.getItem('WorkStreams'));
      //this.gettingUsersinfo();
    }

    //GetUserWiseCustomGrid
    GettingUserWCustomGrid(){
      const user = localStorage.getItem('CorpId')
      this.Apiservice.get('WorkAllotment/GetUserWiseCustomGrid?userId=' + user).subscribe((data: any) => {
        console.log('User Grid-->',data);
        this.globalConst.checkOriginAccess(data);

        this.userCustomGrid = data[0];
        if(data.length > 0){
          Object.keys(this.userCustomGrid).forEach(key => {
            if(this.userCustomGrid[key]){
              var val = this.userCustomGrid[key].toString();
              this.userCustomGrid[key] = val.trim();
              //console.log("Changed grid-->", this.userCustomGrid);
            }
          });
        }

        if(data.length == 0){
          this.userCustomGrid = {
            "id": 0,
            "userId": "TV62254",
            "currency": "Y",
            "folderName": "N",
            "operatorName": "Y",
            "queryNumber": "Y",
            "recordType": "Y",
            "remarks": "N",
            "tlName": "N",
            "runs" : "N"
          }
        }
       });

    }

    //Custome Search for Associtate
    customSearchFn(term: string, item: any) {
      console.log('Req -->', term);
      term = term.toLocaleLowerCase();
      return item.emp_name.toLocaleLowerCase().indexOf(term) > -1 || item.emp_id.toLocaleLowerCase().indexOf(term) > -1;
    }

    //Getting Regions
    GetRegions(wrkstrm) {
      this.Apiservice.get('WorkAllotment/GetRegionList?wid=' + wrkstrm).subscribe((data: any) => {
        console.log('Regions-->',data);
        this.globalConst.checkOriginAccess(data);

        this.walotRegions = data;
      });
    }

    //Getting steps
    getUserWiseSteps(){
      const user = localStorage.getItem('CorpId')
      const walotwid = this.selectedWrkStrm;
      console.log('WorkAllotment/GetUserwiseStepAccess?id='+user+'&wid=' + walotwid) 
      this.Apiservice.get('WorkAllotment/GetUserwiseStepAccess?id='+user+'&wid=' + walotwid).subscribe((data: any) => {
        console.log('steps-->',data);
        this.globalConst.checkOriginAccess(data);

        this.userSteps = data;
        this.userStepsCopy = data;
      });

    }

    //Get services list
    getServiceslist(typ){
      var walotwid = '';
      if(typ == 'a'){
        walotwid = this.waSearchFm.get('wsname').value;
        this.wsId = this.waSearchFm.get('wsname').value;
      }else{
        walotwid = this.waSearchFmb.get('bwsname').value;
      }

      this.resetAll();
      this.GetRegions(walotwid);
      this.gettingUsersinfo();
      this.Apiservice.get('WorkAllotment/GetAreaList?wid=' + walotwid).subscribe((data: any) => {
        console.log('Services-->',data);
        this.globalConst.checkOriginAccess(data);

        this.walotServices = data;
      });
    }

    //Reset All
    resetAll(){
        this.splitMapsData = [];
        this.finalSplitMapsData = [];
        this.waSearchFm.patchValue({region: ''});
        this.waSearchFm.patchValue({service: ''});
        this.waSearchFm.patchValue({state: ''});
        // this.waSearchFm.patchValue({recdate: ''});
        this.recdate =  '';
        this.waSearchFm.patchValue({stepname: ''});


        this.userSteps = [];
        this.userSteps2 = [];
        this.userStepsCopy = [];
        this.alltSteps = [];
        this.wcount = 0;
        this.seltdAssociate = [];
        this.exlsJson = [];

        // this.exlsJson = [];
        // this.userSteps = [];
        // this.walotBatches = [];
        // this.receivedDates = [];
        // this.mapsData = [];
        // this.submitted = false;
        // this.seltdAssociate = [];
        // this.uploadExlsJson = [];
        // this.alltSteps= [];
        // this.waSearchFm.controls['region'].setValue('');
        // this.waSearchFm.controls['service'].setValue('');
        // this.waSearchFm.controls['state'].setValue('');
        // this.waSearchFm.controls['stepname'].setValue('');
        // this.waSearchFm.controls['recdate'].setValue('');
    }

    //Reset B All
    resetbAll(){
      this.mapsData = [];
      this.waSearchFmb.patchValue({bwsname: ''});
      this.waSearchFmb.patchValue({bservice: ''});
      this.waSearchFmb.patchValue({bstepname: ''});
      // this.waSearchFmb.patchValue({recdate: ''});
      this.recdate = '';
      this.waSearchFmb.patchValue({stepname: ''});
      this.waSearchFmb.patchValue({bstate : ''});
      this.userSteps = [];
      this.userSteps2 = [];
      this.userStepsCopy = [];
      this.alltSteps = [];
      this.uploadExlsJson = [];
  }

    //function to call Getbaches service and get batches based on selected service
    getBatches(typ){
      var walotwid = '';
      var walotsid = '';
      this.resetService();

      if(typ == 'a'){
        walotwid = this.waSearchFm.get('wsname').value;
        walotsid = this.waSearchFm.get('service').value;
        this.srId = this.waSearchFm.get('service').value;
      }else{
        walotwid = this.waSearchFmb.get('bwsname').value;
        walotsid = this.waSearchFmb.get('bservice').value;
      }
      console.log('Service id -->', walotsid)
      if(walotsid != '' && walotsid != null){
        this.Apiservice.get('WorkAllotment/GetBatchList?wid=' + walotwid + '&sid=' + walotsid).subscribe((data: any) => {
          //console.log('Batches-->',data);
          this.globalConst.checkOriginAccess(data);

          this.walotBatches = data;
        });


        // this.getSteps(walotwid,walotsid,'');
        // this.getSteps2(walotwid,walotsid);
        this.userSteps = [];
        this.userSteps2 = [];

        this.gettingUsersinfo();
        //this.getReceivedDates();
      }

    }

    resetService(){
      this.exlsJson = [];
      this.userSteps = [];
      this.userSteps2 = [];
      this.userStepsCopy = [];
      this.waSearchFm.controls['state'].setValue('');
      this.waSearchFm.controls['stepname'].setValue('');
      this.walotBatches = [];
      this.receivedDates = [];
      this.mapsData = [];
      this.submitted = false;
      this.seltdAssociate = [];
    }

    stepChange(){
      this.mapsData = [];
      this.wcount = 0;
      this.seltdAssociate = [];
      this.submitted = false;
    }

    //Sweet Alert
    swapAlerts(msg,icon){
      return Swal.fire({
         icon: 'warning',title: '',text: msg,
         customClass: {
           confirmButton: 'btn btn-danger',

         },
         buttonsStyling: false
       }).then(function() {
          //this.router.navigate(['/dashboard/dashboard1']);
          //window.location.href = '/dashboard/dashboard1';
          return false;
       });
     }

     //Get Steps
     getSteps(wid,sid,ssid=''){
      this.spinner.show();
      this.Apiservice.get('WorkAllotment/GetUserwiseAccess?wid='+wid+'&sid='+sid+'&ssid='+ssid).subscribe((data: any) => {
        console.log('Steps 2-->',data);
        this.globalConst.checkOriginAccess(data);

        this.userSteps = data;
        //this.userStepsCopy = data;
        //real_copy = {};
        Object.assign(this.userStepsCopy, data);
        console.log('Custom steps for select box-->', this.userStepsCopy)
        //this.alltSteps =  Object.assign({},data);

        if(data.length > 0){
          var yts = {
            step_id : 1,
            step_name : "Yet to Start"
          }
          this.userSteps.unshift(yts);
        }
        //console.log('Steps 3-->',data);
        this.spinner.hide();
      });
     }


     getSteps2(wid,sid){
      this.spinner.show();
      this.userSteps2 = [];
      this.waSearchFm.controls.stepname.setValue('');
      //this.waSearchFmb.controls.bstepname.setValue('');
      const stateId = (this.waSearchFm.get('state').value == '' ? '' : this.waSearchFm.get('state').value);
      this.Apiservice.get('WorkAllotment/GetTimeEntryUserwiseAccess?wid='+wid+'&sid='+sid+'&ssid='+stateId).subscribe((data: any) => {
        console.log('Steps 2 New-->',data);
        this.globalConst.checkOriginAccess(data);

        this.userSteps2 = data;
        this.spinner.hide();
      });
     }




     //Get Steps
     getStepss(wid,sid){
      this.Apiservice.get('WorkAllotment/GetUserwiseAccess?wid='+wid+'&sid='+sid).subscribe((data: any) => {
        console.log('Steps 2-->',data);
        this.globalConst.checkOriginAccess(data);

        this.userSteps = data;
      });
     }

     //GetKeys Column values
     getKey(item,ky){
        //console.log('Ky 1--->', item);
        var rep = ky.toLowerCase().trim();
        let entries = Object.entries(item)
        let data = entries.map(([key, val]) => {
          var lpkey = key.toString().trim();
          if(lpkey.toLowerCase() == rep){
            if(val != null){
              var rtn = (val).toString();
              return rtn;
            }
          }
        });
        var rslt = data.filter(i => i);
        return rslt[0];
     }


     getStepsByService(typ){
     var walotwid = this.waSearchFmb.get('bwsname').value;
     var walotsid = this.waSearchFmb.get('bservice').value;
     var walotstate = this.waSearchFmb.get('bstate').value;
      // const walotstep = this.waSearchFm.get('stepname').value;
      //this.getSteps(walotwid,walotsid,walotstate);
      //if(walotwid != '4' &&  walotsid != '38'){
        this.getSteps(walotwid,walotsid,walotstate);
        this.getSteps2(walotwid,walotsid);
      //}
     }

     //Get Received dates
     getReceivedDates(){
      const walotwid = this.waSearchFm.get('wsname').value;
      const walotsid = this.waSearchFm.get('service').value;
      // const walotstep = this.waSearchFm.get('stepname').value;
      const walotstate = this.waSearchFm.get('state').value;
     
      console.log(walotsid)
      console.log(walotwid)
      this.gstateId = this.waSearchFm.get('state').value;
      console.log( this.gstateId)

      //this.getSteps(walotwid,walotsid,walotstate);
      //if(walotwid != '4' &&  walotsid != '38'){
        this.getSteps(walotwid,walotsid,walotstate);
        this.getSteps2(walotwid,walotsid);
      //}

      if(walotstate != ''){
        var userId = localStorage.getItem('LoginId');
        if(this.modifyGrid){
          //console.log('Sample--->', 'WorkAllotment/GetModifyReceivedDate?wname='+walotwid+'&servicename='+walotsid+'&state='+walotstate+'&loginid='+userId)
          this.Apiservice.get('WorkAllotment/GetModifyReceivedDate?wname='+walotwid+'&servicename='+walotsid+'&state='+walotstate+'&loginid='+userId).subscribe((data: any) => {
            console.log('Received Dates-->',data);
            this.globalConst.checkOriginAccess(data);

            if(data.length > 0)
              this.receivedDates = data;
          });
        }else{
         // console.log('Sample--->', 'WorkAllotment/GetReceivedDate?wname='+walotwid+'&servicename='+walotsid+'&batchname='+walotstate)
          this.Apiservice.get('WorkAllotment/GetReceivedDate?wname='+walotwid+'&servicename='+walotsid+'&batchname='+walotstate).subscribe((data: any) => {
            console.log('Received Dates-->',data);
            this.globalConst.checkOriginAccess(data);

            if(data.length > 0)
              this.receivedDates = data;
          });
        }
        this.getSteps(walotwid,walotsid,walotstate);
      }else{
        this.Apiservice.get('WorkAllotment/GetReceivedDate?wname='+walotwid+'&servicename='+walotsid+'&batchname=0').subscribe((data: any) => {
          console.log('Received Dates-->',data);
          this.globalConst.checkOriginAccess(data);

          if(data.length > 0)
            this.receivedDates = data;
        });
      }
      this.gettingUsersinfo();
     }

     //Get Steps
     gettingUserGrid(){
      this.spinner.show();
      var userId = localStorage.getItem('LoginId');
      console.log('User Info -->', 'WorkAllotment/GetUserMapsData?id='+userId)
      this.Apiservice.get('WorkAllotment/GetUserMapsData?id='+userId).subscribe((data: any) => {
        console.log('User Maps List-->',data);
        this.globalConst.checkOriginAccess(data);

        this.spinner.hide();
        this.userGrid = data;
      });
     }

     //Get Users
     gettingUsersinfo(){
      var walotwid = this.waSearchFm.get('wsname').value;
      walotwid = (walotwid == '' ? 0 : walotwid)
      var walotsid = this.waSearchFm.get('service').value;
      //console.log('Service 2--->',walotsid)
      walotsid = (walotsid == '' ? 0 : walotsid)
      var walotstate = this.waSearchFm.get('state').value;
      walotstate = (walotstate == '' ? 0 : walotstate)

      this.Apiservice.get('WorkAllotment/GetAssociateNames?wid='+walotwid+'&sid='+walotsid+'&ssid='+walotstate).subscribe((data: any) => {
        //console.log('User Info-->',data);
        this.globalConst.checkOriginAccess(data);

        this.userObj = data;
      });
     }

     //Select filter Type
     selectfilterType(fltyp){
        //console.log('Select Type --->', fltyp)
        this.seqType = fltyp;
     }

     //Reset Count input
     resetGrid(){
      this.wcount = 0;
      if(this.modifyGrid){
        this.modifyGridTbl = this.resetData;
      }else{
        this.mapsData = this.resetData;
      }

        if(this.modifyGrid){
          for (var i = 0; i < this.modifyGridTbl.length; i++) {
            this.modifyGridTbl[i].chk = false;
          }
          this.isMasterSel2 = false;
        }else{
          for (var i = 0; i < this.mapsData.length; i++) {
            this.mapsData[i].chk = false;
          }
          this.isMasterSel = false;
        }
     }

     //Custom Label filter
     labFilter(lab){
        var labs = lab;
        labs = labs.replace(/[A-Z]/g, ' $&').trim();
        labs = labs.charAt(0).toUpperCase() + labs.slice(1)
        return labs;
     }

     //Get
     getChecked(val){
      if(val){
        var str = val.trim();
        if(str == 'Y')
          return true;
        else
          return false;
      }
     }

     //Update User Custom Grid
     updateUserCustomGrid(){
        this.spinner.show();
        var finalObj = [this.userCustomGrid]
        finalObj[0].prmdone = "";
        finalObj[0].id = Number(finalObj[0].id);
        //console.log('Updated Grid: ',finalObj)

        this.Apiservice.postmethod('WorkAllotment/UpdateCustomGrid',finalObj).subscribe((data: any) => {
          console.log('Resp Custm Grid-->', data)
          this.globalConst.checkOriginAccess(data);

          if(data.Item1 == true){
            this.GettingUserWCustomGrid();
            this.spinner.hide();
            this.swapSuccessAlerts('Updated Successfully.!','');
          }
        });
     }

     getFilterData(evn : KeyboardEvent){
        console.log((event.target as HTMLInputElement).value)
     }

  //Excel Export
  exportexcel(): void
  {
    let element = document.getElementById('excel-table');
    
    const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    console.log(ws);
    // return;
    // for(var i = 2; i <= this.exlsJson.length + 1; i++){
    //   var rc = 'D' + i;
    //   ws[rc].v = ws[rc].v + ' ';
    // }
    console.log(ws)
    //return
    // console.log(ws['D29'].v)
    // ws['D132'].v = '03103103230000' + ' ';
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    console.log(ws)
    XLSX.writeFile(wb, 'BulkWorkAllotment-EntrySampleExcel.xlsx');
  }

  //Page Auth
  getAuth(ulog){
    var userDesg = localStorage.getItem('Role');

    if(userDesg.includes(ulog)){
      return true;
    }else{
      return false;
    }
  }

  getActionBtn(){
    //console.log('Cbk -->',this.seltdAssociate2)
    if(!this.allotbtn && this.seltdAssociate2 == 0){
      return true
    }else{
      return false;
    }
  }

  getActionActive(){
    //console.log(this.allotstep)
    if(!this.allotbtn || (this.seltdAssociate && this.seltdAssociate.length == 0)){
      return true
    }else{
      return false;
    }
  }


  refreshpg(): void {
    window.location.reload();
  }
  updateEntities(ind,ele){
    console.log('Update Org...!', this.mapsData[ind].entities);
    console.log('Update...!', this.mapsData[ind].entities);
    this.mapsData[ind].editable = false;
    if(this.mapsData[ind].mapsData <= 0){
      Swal.fire({text: "Zero's or Negative values are Not Allowed.!",icon: 'error'});
      this.mapsData[ind].entities  = this.entities;
      return false;
    }else if(this.mapsData[ind].entities  == this.entities){
      return false;
    }else if(this.mapsData[ind].entities == "" || this.mapsData[ind].entities == null){
      this.mapsData[ind].entities  = this.entities;
      return false;
    }else{
      this.spinner.show();

      const workstream = this.mapsData[ind].workstream;
      const service = this.mapsData[ind].service;
      const state = this.mapsData[ind].batch;
      const map = this.mapsData[ind].map;
      const entities = this.mapsData[ind].entities;
      var userId = localStorage.getItem('LoginId');
      this.Apiservice.getMethod('Masters/UpdateMapEntities?userId='+userId+'&workstream='+workstream+'&service='+service+'&state='+state+'&entities='+entities+'&map='+map).subscribe((data:any)=>{
        console.log('Time entry Resp-->', data);
        this.globalConst.checkOriginAccess(data);

        if(data == '1'){
          this.onSubmit();
          this.spinner.hide();
          Swal.fire({text: "Submited Successfullly!",icon: 'success'}).then(function() {
            //this.fileReset();
          });
          this.spinner.hide();
          this.onSubmit();
        }else{
            this.spinner.hide();
            Swal.fire({text: "Insertion Failed!",icon: 'error'});
        }
    });
    }

  }
    changeToEntites(inx,ele){
      // alert(inx)
      console.log('I am double clicked...!', this.mapsData)
       this.mapsData[inx].editable = true;
       this.entities = this.mapsData[inx].entities;
    }

    updateRuns(ind,ele){
      console.log('Update Org...!', this.mapsData[ind].runs);
      console.log('Update...!', this.mapsData[ind].runs);
      this.mapsData[ind].editables = false;
      if(this.mapsData[ind].mapsData <= 0){
        Swal.fire({text: "Zero's or Negative values are Not Allowed.!",icon: 'error'});
        this.mapsData[ind].runs  = this.runs;
        return false;
      }else if(this.mapsData[ind].runs  == this.runs){
        return false;
      }else if(this.mapsData[ind].runs == "" || this.mapsData[ind].runs == null){
        this.mapsData[ind].runs  = this.runs;
        return false;
      }else{
        this.spinner.show();

        const workstream = this.mapsData[ind].workstream;
        const service = this.mapsData[ind].service;
        const state = this.mapsData[ind].batch;
        const map = this.mapsData[ind].map;
        const runs = this.mapsData[ind].runs;
        var userId = localStorage.getItem('LoginId');
        this.Apiservice.getMethod('Masters/UpdateMapRuns?userId='+userId+'&workstream='+workstream+'&service='+service+'&state='+state+'&runs='+runs+'&map='+map).subscribe((data:any)=>{
          console.log('Time entry Resp-->', data);
          this.globalConst.checkOriginAccess(data);

          if(data == '1'){
            this.onSubmit();
            this.spinner.hide();
            Swal.fire({text: "Submited Successfullly!",icon: 'success'}).then(function() {
              //this.fileReset();
            });
            this.spinner.hide();
            this.onSubmit();
          }else{
              this.spinner.hide();
              Swal.fire({text: "Insertion Failed!",icon: 'error'});
          }
      });
      }

    }
    changeToRuns(inx,ele){
        // alert(inx)
        console.log('I am double clicked...!', this.mapsData)
         this.mapsData[inx].editables = true;
         this.entities = this.mapsData[inx].entities;
      }
}
