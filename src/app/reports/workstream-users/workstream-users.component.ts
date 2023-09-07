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
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { GlobalConstants } from '../../common/global-constants';
import { publish } from 'rxjs/operators';

@Component({
  selector: 'app-workstream-users',
  templateUrl: './workstream-users.component.html',
  styleUrls: ['./data-tables.component.scss', '../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None

})
export class WorkstreamUsersComponent implements OnInit {
  UserListData : any;
  timeSpent: any;
  DetailedWorkstream: any;
  isShown: boolean = false;
  public contentHeader: object;
  public limitRef = 15;
  filterGrid : any = false;
  addGrid : any = false;
  workstreamData: any;
  walotServices : any;
  walotBatches: any;
  wsname: any = "";
  service: any = "";
  state: any = "";
  associate: any = "";
  associateData: any;

  // row data
  public rows = [];
  public rows2 : any;

  public columns = [
    { name: 'CorpID', prop: 'emp_id' },
    { name: 'EmpName', prop: 'emp_name' },
    { name: 'Designation', prop: 'designation'},
    { name: 'Workstream', prop: 'w_name' },
    { name: 'Service', prop: 'service_name'},
    { name: 'Batch', prop: 'batch_name'},
    { name: 'Status', prop: 'user_status'}
  ];
  waSearchFm: FormGroup = new FormGroup({
    wsname: new FormControl(''),
    service: new FormControl(''),
    state: new FormControl(''),
    associate: new FormControl('')
  });
waSearchFmb: FormGroup = new FormGroup({
  bstate: new FormControl(''),
  bwsname: new FormControl(''),
  bservice: new FormControl(''),
  bassociate : new FormControl('')
});

  // multi Purpose datatable Row data
  public multiPurposeRows = [];

  public ColumnMode = ColumnMode;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild('tableRowDetails') tableRowDetails: any;
  @ViewChild('tableResponsive') tableResponsive: any;


  public expanded: any = {};

  public editing = {};

  public chkBoxSelected = [];
  public SelectionType = SelectionType;

  // server side row data
  public serverSideRowData;
   // private
   private tempData = [];
   private multiPurposeTemp = [];

   /**
    * inlineEditingUpdate
    *
    * @param event
    * @param cell
    * @param rowIndex
    */


   /**
    * filterUpdate
    *
    * @param code
    */
    filterUpdate(event) {
     const val = event.target.value.toLowerCase();

     // filter our data
     const temp = this.tempData.filter(function (d) {
       return (d.emp_id.toLowerCase().indexOf(val) !== -1 || d.emp_name.toLowerCase().indexOf(val) !== -1
       || d.w_name.toLowerCase().indexOf(val) !== -1 || d.service_name.toLowerCase().indexOf(val) !== -1 || d.batch_name.toLowerCase().indexOf(val) !== -1)
       || !val;
     });

    // update the rows
    this.rows = temp;
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

  /**
   * rowDetailsToggleExpand
   *
   * @param row
   */
   rowDetailsToggleExpand(row) {
    this.tableRowDetails.rowDetail.toggleExpandRow(row);
  }

  /**
   * toggleExpandRowResponsive
   *
   * @param row
   */
  toggleExpandRowResponsive(row) {
    this.tableResponsive.rowDetail.toggleExpandRow(row);
  }

  /**
   * customChkboxOnSelect
   *
   * @param { selected }
   */
   customChkboxOnSelect({ selected }) {
    this.chkBoxSelected.splice(0, this.chkBoxSelected.length);
    this.chkBoxSelected.push(...selected);
  }

  /**
   * serverSideSetPage
   *
   * @param event
   */
  serverSideSetPage(event) {
    this.http
      .get('assets/data/datatable-data.json')
      .pipe(map((data) => data as Array<any>))
      .subscribe((data) => {
        this.serverSideRowData = data;
      });
  }
    /**
   * MultiPurposeFilterUpdate
   *
   * @param event
   */
     MultiPurposeFilterUpdate(event) {
      const val = event.target.value.toLowerCase();

      // filter our data
      const temp = this.multiPurposeTemp.filter(function (d) {
        return d.full_name.toLowerCase().indexOf(val) !== -1 || !val;
      });

      // update the rows
      this.multiPurposeRows = temp;
      // Whenever the filter changes, always go back to the first page
      this.table.offset = 0;
    }
 /**
   * Constructor
   *
   * @param {HttpClient} http

  /* Old Table */
  public reportData: any = [];
  public userRole = localStorage.getItem('Role');
  public selectedWrkStrm: any = '';
  public searchme : any = '';
  public orgEmpData : any = {};

  constructor(public globalConst: GlobalConstants,private spinner: NgxSpinnerService,public router : Router,private Apiservice: ApiService,private fb: FormBuilder,private http: HttpClient) {
    // this.getEmployeeDetails();
   }
   inlineEditingUpdate(event, cell, rowIndex) {
    this.editing[rowIndex + '-' + cell] = false;
    this.rows[rowIndex][cell] = event.target.value;
    this.rows = [...this.rows];
  }
  ngOnInit(): void {
    this.spinner.show();
    this.getFilter();
    this.GetWorkstream();
    this.getAssociatelist();
    var loginfo = localStorage.getItem('CorpId')

    if(loginfo == '' || loginfo == null || loginfo == 'null'){
      this.router.navigate(['/pages/login']);
    }

    this.selectedWrkStrm = localStorage.getItem('selectedWrkStrm');
    //console.log('Sel work strm --->', this.selectedWrkStrm)

    if(this.selectedWrkStrm == '' || this.selectedWrkStrm == null){
      this.swapAlerts('Please select Workstream.!')
    }
    this.getEmployeeDetails();
    this.spinner.hide();
    //this.serverSideSetPage({ offset: 0 });
    // this.spinner.show();
    // this.UsersGrid();
    this.waSearchFm = this.fb.group({
      wsname    : ['', Validators.required],
      service   : ['', Validators.required],
      state     : ['', Validators.required],
      associate : ['', Validators.required]
    }
    );
  }

    //Custome Search for Associtate
    customSearchFn(term: string, item: any) {
      console.log('Req -->', term);
      term = term.toLocaleLowerCase();
      return item.emp_name.toLocaleLowerCase().indexOf(term) > -1 || item.emp_id.toLocaleLowerCase().indexOf(term) > -1;
    }
  getFilter(){
    this.filterGrid = true;
    this.addGrid = false;
  }
  getAdd(){
    this.filterGrid = false;
    this.addGrid = true;
  }
//Reset All
resetAll(){
  this.waSearchFm.patchValue({service: ''});
  this.waSearchFm.patchValue({state: ''});
}
resetService(){
  this.waSearchFm.controls['state'].setValue('');
  this.walotBatches = [];
}

   //Getting workstreams
   GetWorkstream() {
    // alert(localStorage.getItem('LoginId'));
    // let id=localStorage.getItem('CorpId');
    // this.Apiservice.get('WorkAllotment/GetWorkStream?id=' + id).subscribe((data: any) => {
    //   console.log(data);
    //   this.workstreamData = data;
    // });
    this.workstreamData = JSON.parse(localStorage.getItem('WorkStreams'));
    //this.gettingUsersinfo();
  }
   //Get services list
   getServiceslist(typ){
    var walotwid = '';
    if(typ == 'a'){
      walotwid = this.waSearchFm.get('wsname').value;
    }else{
      walotwid = this.waSearchFmb.get('bwsname').value;
    }

    this.resetAll();
    this.Apiservice.get('WorkAllotment/GetAreaList?wid=' + walotwid).subscribe((data: any) => {
      console.log('Services-->',data);
      this.globalConst.checkOriginAccess(data);

      this.walotServices = data;
    });
  }
    //Get Associate list
    getAssociatelist(){
      var userId = localStorage.getItem('LoginId');
      this.Apiservice.get('Masters/GetAssociateList?loginId=' + userId).subscribe((data: any) => {
        console.log('Associates-->',data);
        this.globalConst.checkOriginAccess(data);

        this.associateData = data;
      });
    }
  getBatches(typ){
    var walotwid = '';
    var walotsid = '';
    this.resetService();

    if(typ == 'a'){
      walotwid = this.waSearchFm.get('wsname').value;
      walotsid = this.waSearchFm.get('service').value;
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
    }

  }
  getEmployeeDetails(){
    // alert('HI')
    this.spinner.show();
    var userId = localStorage.getItem('LoginId');
    this.Apiservice.get('Masters/GetUsersList?loginId=' + userId).subscribe((data: any) => {
        console.log('Employee Details --->', data);
        this.globalConst.checkOriginAccess(data);

        // this.reportData = data;
        // Object.assign(this.orgEmpData, data);
        this.rows = data;
        this.tempData = data;
        this.multiPurposeTemp = data;
        this.serverSideRowData = data;
        this.spinner.hide();
    });
  }

  udpateWorkstreamUsersStatus(workstream,service,bid,sts){
    //alert('Wid -->'+ wid+ '  status-->'+ sts)
    console.log(sts)
    this.spinner.show();
    var userId = localStorage.getItem('LoginId');
      if(sts == 'False'){
        // console.log(sts)
        var status = '1';
      }else if(sts == 'True'){
        // console.log(sts)
        var status = '0';
      }
        this.Apiservice.get('Masters/UpdateWorkstreamUsersStatus?userId='+userId+'&workstream='+workstream+'&service='+service+'&state='+bid+'&statusStr='+status).subscribe((data: any) => {
          console.log("Update status --->", data);
          this.globalConst.checkOriginAccess(data);

          if(data == 1){
            Swal.fire({text: "Updated Successfullly!",icon: 'success'}).then(function(){
              });
          }else{
            Swal.fire({text: "Something went wrong please try again!",icon: 'warning'}).then(function() {
            });
          }
          this.spinner.hide();
          this.getEmployeeDetails();
        });

  }

  frmSubmit(){
    console.table(this.waSearchFm.value);
    var frmObj = this.waSearchFm.value;
    //var wid = frmObj.bwsname;var sid = frmObj.bservice;var stp = frmObj.bstepname;
    var wid = frmObj.wsname;var sid = frmObj.service;var state = frmObj.state;var associate = frmObj.associate;
    console.log(wid)
    console.log(sid)
    console.log(state)
    console.log(associate)
     if(wid != "" && sid.length == undefined && state.length == undefined){
      var userId = localStorage.getItem('LoginId');

       this.spinner.show();
       this.Apiservice.get('Masters/InsertUsers?workstream='+wid+'&service='+sid+'&state='+state+'&id='+associate+'&loginId='+userId).subscribe((data: any) => {
         console.log("Bulk Upload --->", data);
         this.globalConst.checkOriginAccess(data);

         this.spinner.hide();
         if(data.length > 0){
             if(data[0].outPutName == 'Success'){
               Swal.fire({text: "Submited Successfully!",icon: 'success'}).then(function() {});
               this.getFilter();
             }else if(data[0].outPutName == 'Already Exists'){
               Swal.fire({text: this.service+ " Service Already Exists!",icon: 'error'}).then(function() {});
             }
         }else{
           Swal.fire({text: "Something went wrong please try again!",icon: 'warning'}).then(function() {});
         }
       });
     }else{
       Swal.fire({text: "Invalid input values!",icon: 'warning'}).then(function() {});
     }
   }

  getFilterData(dt){
    const dtObj = [];
    dtObj.push(this.orgEmpData);
    dtObj.forEach(element => {
      return element.emp_id.toLower() == dt.toLower();
    });

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
  UsersGrid(){
    var userId = localStorage.getItem('LoginId');
    this.Apiservice.get('Masters/GetUsersList?loginId=' + userId).subscribe((data: any) => {
      console.log('UsersList-->',data);
      this.globalConst.checkOriginAccess(data);

           this.UserListData=data
           this.timeSpent = data[0].id
           console.log(this.timeSpent)
        });

    }
    // WorkstreamDetails(){

    //   this.Apiservice.get('Masters/GetWorkstreamDetailList?userId=' + this.timeSpent).subscribe((data: any) => {
    //     console.log('DetailedWorkstream-->',data);
    //          this.DetailedWorkstream=data
    //          console.log(this.timeSpent)
    //       });

    //   }
    toggleShow() {
      this.isShown = !this.isShown;
    }
}
