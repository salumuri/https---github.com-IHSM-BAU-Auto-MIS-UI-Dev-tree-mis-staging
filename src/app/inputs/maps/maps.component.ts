import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DatePipe } from '@angular/common';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { ApiService } from '../../Api/api.service';
import { ExcelService } from '../../Api/ExcelService';
import { CsvService } from '../../Api/CsvService';
import * as XLSX from 'xlsx';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { GlobalConstants } from '../../common/global-constants';

@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MapsComponent implements OnInit {

  popupModel: any;
  selectedCity: any;
  waobj = [];
  walotServices = [];
  walotBatches = [];
  selectedWrkStrm = "";
  allMasterInfo = [];
  cities = [
    { id: 1, name: 'Vilnius' },
    { id: 2, name: 'Kaunas' },
    { id: 3, name: 'Pavilnys', disabled: true },
    { id: 4, name: 'Pabradė' },
    { id: 5, name: 'Klaipėda' }
  ];
  mapExcel = 'assets/excelfiles/MapsUpload.xlsx'
  public exlsJson : any = [];

  constructor(public globalConst: GlobalConstants,public router : Router,private spinner: NgxSpinnerService,private Apiservice: ApiService, private CsvService: CsvService, private datepipe: DatePipe, private excelService: ExcelService) {
    console.log('I am in Maps Component...!')
  }
  date: Date = new Date();
  workstreamData: any; project: any = ""; mAndYear: any = ""; monthAndYear: any = [];
  @ViewChild('csvReader', { static: false }) csvReader: any;
  records: any = []; IsShowTbl: boolean = false; uploadfile: boolean = true; errordata = []; curreentdata : any = [];
  p: number = 1; pasteerrorData:[]; pasteerror:boolean=false;
  headings: any = ["Work stream","Region","Service","Sub Service","Record","Record Type","Received Date","Folder Name","TL Name","No of Units","Runs","Complexity"]


  ngOnInit(): void {
    this.GetWorkstream();

    this.spinner.show();
    var loginfo = localStorage.getItem('CorpId')

    if(loginfo == '' || loginfo == null || loginfo == 'null'){
      this.router.navigate(['/pages/login']);
    }

    this.selectedWrkStrm = localStorage.getItem('selectedWrkStrm');
    console.log('Sel work strm --->', this.selectedWrkStrm)
    //console.log('Length Object--->', localStorage.getItem('WorkStreams'))
    var workStrms = localStorage.getItem('WorkStreams');
    if(this.selectedWrkStrm == '' || this.selectedWrkStrm == null){
      this.swapAlerts('Please select Workstream.!')
    }else if(workStrms != undefined){
      this.waobj = JSON.parse(localStorage.getItem('WorkStreams'));
      console.log("work stream Obj -->", this.waobj);
    }



    let M_Y = this.datepipe.transform(this.date, 'MMMM-y');
    this.monthAndYear.push({ 'mAndY': M_Y }, { 'mAndY': 'NonPriority-jobs' });
    this.mAndYear = this.monthAndYear[0].mAndY;

    if(this.selectedWrkStrm != ''){
      //this.GetWorkstream();
      this.getServiceslist();
      this.getBatches();
    }
    this.GetAllMasterInfo();
    this.spinner.hide();
  }


  //Get services list
  getServiceslist(){
     //const walotwid = localStorage.getItem('selectedWrkStrm');
     this.Apiservice.get('WorkAllotment/GetAreaList?wid=' + this.selectedWrkStrm).subscribe((data: any) => {
      console.log('Services-->',data);
      if (data = 'You are not authorized to access!')
          {

            return;


          }
      this.walotServices = data;
    });

  }

  //function to call Getbaches service and get batches based on selected service
  getBatches(){
    this.Apiservice.get('WorkAllotment/GetAllBatchList?wid=' + this.selectedWrkStrm).subscribe((data: any) => {
      //console.log(' All Batches-->',data);
      if (data = 'You are not authorized to access!')
      {

        return;
      }
      this.walotBatches = data;
    });
  }

  processChange() {
    this.records = [];
    this.IsShowTbl = false;
    this.fileReset();
    if (this.project != "") { this.uploadfile = false; } else { this.uploadfile = true; }
  }
  fileReset() {
    this.csvReader.nativeElement.value = "";
    this.records = [];
    this.curreentdata=[];
    this.errordata=[];
    this.records=[];
  }
  GetWorkstream() {
    var id = JSON.parse(localStorage.getItem('LoginId'));
    this.Apiservice.get('WorkAllotment/GetWorkStream?id=' + id).subscribe((data: any) => {
      // console.log('Workstreams List-->',data);
      this.globalConst.checkOriginAccess(data);
      this.workstreamData = data;
    });
  }
  isValidCSVFile(file: any) {
    return file.name.endsWith(".csv") || file.name.endsWith(".xlsx");
  }
  getHeaderArray(csvRecordsArr: any) {
    let headers = (csvRecordsArr[0]).split(',');
    let headerArray = [];
    for (let j = 0; j < headers.length; j++) {
      headerArray.push(headers[j]);
    }
    return headerArray;
  }
  pageChangeEvents(event: number) {
    this.p = event;
  }

   //Getting all Master info
   GetAllMasterInfo(){
    var id = JSON.parse(localStorage.getItem('LoginId'));
    this.Apiservice.get('WorkAllotment/GetWorkStream?id=' + id).subscribe((data: any) => {
      // console.log('Workstreams List-->',data);
      this.globalConst.checkOriginAccess(data);

      this.workstreamData = data;
      var workList = this.workstreamData
      console.log( 'Workstreams List-->',workList);
    var wlst = JSON.parse(localStorage.getItem('WorkStreams'));
    var str = '';
    workList.forEach(element => {
      str = str + element.wid+','
    });
    str = str.replace(/,\s*$/, "");
    // console.log( this.workstreamData);
    console.log('Final Wrkalot', str);
    this.Apiservice.get('WorkAllotment/GetDetailedList?wid='+str).subscribe((data: any) => {
      console.log('Get All List -->',data);
      this.globalConst.checkOriginAccess(data);
      this.allMasterInfo = data;
    });
  });
  }

  //Work Allotment Bulk Upload
  onFileChangeBlkUp(ev){
      console.log('File Upload...!', ev)
      this.spinner.show();
      this.errordata=[];
      this.curreentdata=[];
      this.records=[];
      let text = [];
      let workBook = null;
      let jsonData = null;
      let jsonHeaderData = null;
      const reader = new FileReader();
      if(ev.target.files[0]){
        const file = ev.target.files[0];
        const fileext = ev.target.files[0]?.name.split(".").pop();
        if(fileext != 'xlsx'){
          this.spinner.hide();
          this.swapAlerts('Invalid File Uploaded..!');
          this.spinner.hide();
          return
        }else{
            console.log('File Upload-->',ev.target.files[0].name.split(".").pop());
            reader.onload = (event) => {
              const data = reader.result;
              //Reading and convreting XLSX data to Json
              workBook = XLSX.read(data, { type: 'binary', cellDates: true });
              jsonData = workBook.SheetNames.reduce((initial, name) => {
                const sheet = workBook.Sheets[name];
                initial[name] = XLSX.utils.sheet_to_json(sheet, {defval: '', header: 0, raw: false,dateNF:'dd-mm-yyyy'});
                return initial;
              }, {});

              const dataString = JSON.parse(JSON.stringify(jsonData));
              var fileKey = Object.keys(dataString)[0];
              this.records = dataString[fileKey];
              this.IsShowTbl=true;
              var hedersDt = Object.keys(this.records[0]); //Headers

              let result = this.headings.sort().filter(o1 => hedersDt.sort().some(o2 => o1 === o2));

              // console.log('Header count of list -->', this.headings.sort().length);
              // console.log('Header count of list File -->', hedersDt.sort().length);
              if(this.headings.sort().length != hedersDt.sort().length){
                this.spinner.hide();
                this.resetAll();
                this.swapAlerts('Columns count Missmatch..!');
              }else if(this.headings.sort().length != result.length){
                this.spinner.hide();
                this.resetAll();
                this.swapAlerts('Invalid Columns Names..!');
              }else{
                console.log("File Result-->", this.records)

                for(let s=0; s<=this.records.length;s++){
                  console.log("Every SIngle Row -->", this.records[0])


                  if(this.records[s]?.['No of Units'] == '' || this.records[s]?.['TL Name'] == '' || this.records[s]?.['Received Date'] == '' || this.records[s]?.['Record Type'] == '' || this.records[s]?.['Record'] == '' || this.records[s]?.['Received Date'] == '' || this.records[s]?.['Work stream'] == '' || this.records[s]?.['Service'] == '' || this.records[s]?.['Sub Service'] ==''){

                    this.fileReset();
                    Swal.fire({text: "Columns values should not empty in the uploaded sheet!",icon: 'warning'}).then(function() {
                      //this.fileReset();
                    });
                    this.spinner.hide();
                    return;
                  }else if(this.records[s]?.['Record Type'] != undefined && this.records[s]?.['Work stream'] != '' && this.records[s]?.['Work stream'] != undefined && (this.records[s]?.['Work stream'] == 'NA Land' && this.records[s]?.['Service'] == 'NA-Land Data Accumulation')){

                      if(this.records[s]?.['Record Type'] != undefined && this.records[s]?.['Record Type'].toLowerCase() != 'maintenance' && this.records[s]?.['Record Type'].toLowerCase() != 'collection'){
                        this.fileReset();
                        Swal.fire({text: "Please check the value for Record Type Column in the uploaded sheet!",icon: 'warning'}).then(function() {
                          //this.fileReset();
                        });
                        this.spinner.hide();
                        return;
                      }
                  }

                   //Checking Validation for Workstream
                  if(this.records && this.records[s]?.['Work stream'] != undefined){
                    //var resp = Object.values(this.waobj).includes(this.records[s]?.['Work stream']);
                    var wrkstrm = this.records[s]?.['Work stream'].toString();
                    const wrkresp = this.allMasterInfo.filter(function (y) { return y['w_name'] == wrkstrm});
                    console.log('Work Stream -->', wrkresp);
                    if(wrkresp.length == 0){
                      this.spinner.hide();
                      this.swapAlerts('Please check Work stream (' + this.records[s]?.['Work stream'] + ') in the uploaded file.!');
                      this.fileReset();
                      return false
                    }
                  }


                //Checking Validation for Service
                if(this.records[s]?.['Service'] != undefined){
                  var servc = this.records[s]?.['Service'].toString();
                  const resp = this.allMasterInfo.filter(function (y) { return y['service_name'] == servc});
                  console.log("service Resp -->", this.walotServices);
                  if(resp.length == 0){
                    this.spinner.hide();
                    this.swapAlerts('Please check Service (' + servc + ') in the uploaded file.!');
                    this.fileReset();
                    return false;
                  }
                }

                 //Checking Validation for State
                if(this.records[s]?.['Sub Service'] != undefined){
                  var btch = this.records[s]?.['Sub Service'].toString();
                  //const resp = this.allMasterInfo.filter(function (x) { return x.batch_name == btch});
                  var services = this.records[s]?.['Service'].toString();
                  var resp = this.allMasterInfo.filter(function (x) { return (x.batch_name == btch && x.service_name == services)});

                  if(resp.length == 0){
                    this.spinner.hide();
                    this.swapAlerts('Please check State (' + btch + ') in the uploaded file.!');
                    this.fileReset();
                    return false;
                  }
                }

                if(this.records[s]?.['Received Date'] == ''){
                    this.spinner.hide();
                    this.swapAlerts('Received Date should not be empty.!');
                    this.csvReader.nativeElement.value = "";
                    this.fileReset();
                    return false;
                }


                  if(this.records.length > 0 && Date.parse(this.records[s]?.['Received Date'])){
                    // var mDate = this.datepipe.transform(this.records[s]?.['Received Date'], 'yyyy-MM-dd');
                    // var m2Date = new Date(mDate);
                    // m2Date.setDate(m2Date.getDate() + 1);
                    // var finalDate = this.datepipe.transform(m2Date, 'yyyy-MM-dd');

                    var finalObj = {
                      'workstream'  : this.records[s]?.['Work stream'],
                      'region'      : (this.records[s]?.['Region'] == '' ? '0' : this.records[s]?.['Region']),
                      'service'     : this.records[s]?.['Service'],
                      'batch'       : this.records[s]?.['Sub Service'],
                      // 'map'         : this.records[s]?.['Record'].replace(/[^A-Za-z0-9/_.-]/g, ''),
                      'map'         : this.records[s]?.['Record'],
                      'map_type'    : this.records[s]?.['Record Type'],
                      'inst_date'   : this.records[s]?.['Received Date'],
                      'folder_name' : this.records[s]?.['Folder Name'],
                      'task_manager': this.records[s]?.['TL Name'],
                      'units' : this.records[s]?.['No of Units'],
                      'runs'  : (this.records[s]?.['Runs'] == '' ? 0 : this.records[s]?.['Runs']),
                      'complexity' : this.records[s]?.['Complexity']
                    }

                    this.curreentdata.push(finalObj);
                    //console.log("File Result 2-->", this.records);
                    console.log('curreentdata',this.curreentdata);

                  }else{this.errordata.push(this.records[s]);}


                  // console.log('errordata',this.errordata);
                }
                this.spinner.hide();
              }

            }
            reader.readAsBinaryString(file);
        }
      }else{
        this.spinner.hide();
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

    exportAsXLSX(): void {
      if(this.pasteerrorData.length>0){
        this.excelService.exportAsExcelFile(this.pasteerrorData, 'DuplicateMaps');
        // Swal.fire({ text: 'Surveys Results Download Successfully', icon: 'success' });
        this.pasteerror=false;
        }
        else
        Swal.fire({ text: 'Not Found', icon: 'error' });
    }

    clearAll(){
      this.IsShowTbl=false;
      this.pasteerror=false;
      this. fileReset();
    }

  saveBulkData(){
    console.log(this.curreentdata)
    var userId = localStorage.getItem('LoginId');
    this.spinner.show();
    if(this.curreentdata==undefined || this.curreentdata.length==0){
      this.spinner.hide();
      this.resetAll();
      Swal.fire({text: "Please Upload the file",icon: 'warning'});}
    else{
     if(this.mAndYear==""){
      this.spinner.hide();
      this.resetAll();
      Swal.fire({text: "Please Select the Month-Year",icon: 'warning'});
     }
     else{
      let obj={
        "mapsList": this.curreentdata,
        "createdById": Number(userId)
        // "PlannedMonth":this.mAndYear
      }


  //console.log('Maps resp -->', obj);
  //return
   this.Apiservice.postmethod('Maps/BulkSaveMaps', obj).subscribe((data:any)=>{
     console.log('Response --->',data);
     this.globalConst.checkOriginAccess(data);

     if(data == null || data == 'null'){
      this.spinner.hide();
      this.resetAll();
      Swal.fire({text: "Insertion Failed!",icon: 'error'});
    }


    if(data.length == 0){
      this.pasteerrorData=data.item1;
      this.IsShowTbl=false;
      this.pasteerror=true;
      this.spinner.hide();
      Swal.fire({text: "Maps Uploaded Successfullly!",icon: 'success'}).then(function() {
        this.resetAll();
      });
      this.fileReset();
    }
    else if(data.length > 0){
        this.spinner.hide();
        this.resetAll();

        var resp = []

        // data.forEach(e => {
        //     resp.push(e.map);
        // });
        // var resp2 = resp.join('<br>');

        // console.log('Duplicate Array--->', resp2);

        // // var contentjson = '<h4>Below duplicate maps are not Inserted.!</h4><span style="font-size:11px">'+resp2+'</span>';

        // // Swal.fire({text: "",icon: 'error',html:contentjson});
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
    }


    resetAll(){
      this.IsShowTbl=false;
      ///this.result = [];
      this.curreentdata = [];
      this.fileReset();
    }


}
export class CsvData {
  public workstream: any;
  public region: any;
  public service: any;
  public batch: any;
  public map: any;
  public map_type: any;
  public phase: any;
  public inst_date: any;
  public folder_name: any;
  public scale: any;
  public entities: any;
  public total_kms: any;
  public shift: any;
  public status: any;
  public currency: any;
  public noUsed: any;
  public estimated_time: any;
  public plotRec: any;
  public propesed_shipmentDate: any;
  public shipment_date: any;
  public shipment_operator: any;
  public shipment_chkList: any;
  public remarks: any;
  public current_step: any;
  public alloted_to: any;
  public alloted_date: any;
  public alloted_step: any;
  public rework: any;
  public priority: any;
  public int_qty: any;
  public ext_qty: any;
  public ext_rft: any;
  public ext_fb_date: any;
  public recevd_from: any;
  public recevd_by: any;
  public gl: any;
  public task_manager: any;
  public error_code: any;
  public mode_of_input: any;
  public project_name: any;
  public feedback_remarks: any;
  public rft_remarks: any;
  public ims: any;
  public hold_remarks: any;
  public hold: any;
  public uop_id: any;
  public uploaded_itrack: any;
  public uploaded_itrack_date: any;
  public iel_remarks: any;
  public ext_fb_by: any;
  public hiddenscreen: any;
  public error_type: any;
  public hidden_error: any;
  public iel_comments: any;
  public iel_name: any;
  public planned_month: any;
  public prod_code: any;
  public rework_date: any;
  public rework_time: any;
  public flag: any;
}

