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
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { GlobalConstants } from '../../common/global-constants';
import { publish } from 'rxjs/operators';

@Component({
  selector: 'app-workstream-user-access',
  templateUrl: './workstream-user-access.component.html',
  styleUrls: ['../../data-tables.component.scss', '../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})

export class WorkstreamUserAccessComponent implements OnInit {
  isCollapsed = true;
  UserListData: any;
  timeSpent: any;
  DetailedWorkstream: any;
  isShown: boolean = false;
  public contentHeader: object;
  public limitRef = 15;
  filterGrid: any = false;
  addGrid: any = false;
  workstreamData: any;
  walotServices: any;
  walotBatches: any;
  wsname: any = "";
  service: any = "";
  state: any = "";
  associate: any = "";
  associateData: any;
  seltdAssociate: any = [];
  // row data
  public rows = [];
  public rows2: any;

  public columns = [
    { name: 'CorpID', prop: 'emp_id' },
    { name: 'EmpName', prop: 'emp_name' },
    { name: 'Workstream', prop: 'w_name' },
    { name: 'Service', prop: 'service_name' },
    { name: 'Sub Service', prop: 'batch_name' },
    { name: 'Status', prop: 'user_status' }
  ];

  waSearchFm: FormGroup = new FormGroup({
    wsname: new FormControl(''),
    service: new FormControl(''),
    state: new FormControl(''),
    assocName : new FormControl('')
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
        || d.w_name.toLowerCase().indexOf(val) !== -1 || d.service_name.toLowerCase().indexOf(val) !== -1 || d.batch_name.toLowerCase().indexOf(val) !== -1) || !val;
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
  public searchme: any = '';
  public orgEmpData: any = {};

  constructor(public globalConst: GlobalConstants,private spinner: NgxSpinnerService, public router: Router, private Apiservice: ApiService, private fb: FormBuilder, private http: HttpClient) { }

  inlineEditingUpdate(event, cell, rowIndex) {
    this.editing[rowIndex + '-' + cell] = false;
    this.rows[rowIndex][cell] = event.target.value;
    this.rows = [...this.rows];
  }
  ngOnInit(): void {

    this.getFilter();
    this.GetWorkstream();
    this.getWorkstreams();
    this.getAssociatelist();
    var loginfo = localStorage.getItem('CorpId')

    if (loginfo == '' || loginfo == null || loginfo == 'null') {
      this.router.navigate(['/pages/login']);
    }

    this.selectedWrkStrm = localStorage.getItem('selectedWrkStrm');

    if (this.selectedWrkStrm == '' || this.selectedWrkStrm == null) {
      this.swapAlerts('Please select Workstream.!')
    }
    this.getEmployeeDetails();
    //this.serverSideSetPage({ offset: 0 });
    // this.spinner.show();
    // this.UsersGrid();
    this.waSearchFm = this.fb.group({
      wsname: ['', Validators.required],
      service: ['', Validators.required],
      state: ['', Validators.required],
      assocName : [[], Validators.required]
    }
    );
  }
  getFilter() {
    this.filterGrid = true;
    this.addGrid = false;
  }
  getAdd() {
    this.filterGrid = false;
    this.addGrid = true;
  }
  //Reset All
  resetAll() {
    this.waSearchFm.patchValue({ wsname: '' });
    this.waSearchFm.patchValue({ service: '' });
    this.waSearchFm.patchValue({ state: '' });
    this.waSearchFm.patchValue({ assocName: []});
  }
  resetService() {
    this.waSearchFm.controls['state'].setValue('');
    this.walotBatches = [];
  }

  //Getting workstreams
  GetWorkstream() {
    this.workstreamData = JSON.parse(localStorage.getItem('WorkStreams'));
  }
  //Get services list
  getServiceslist(typ) {
    var walotwid = '';
    if (typ == 'a') {
      walotwid = this.waSearchFm.get('wsname').value;
    }
    // this.resetAll();
    this.Apiservice.get('WorkAllotment/GetAreaList?wid=' + walotwid).subscribe((data: any) => {
      console.log('Services-->', data);
      this.globalConst.checkOriginAccess(data);
      this.walotServices = data;
    });
  }
  //Get associates list
  getAssociatelist() {
    var userId = localStorage.getItem('LoginId');
    this.Apiservice.get('Masters/GetAssociateList?loginId=' + userId).subscribe((data: any) => {
      console.log('Associates-->', data);
      this.globalConst.checkOriginAccess(data);
      this.associateData = data;
    });
  }
  //Workstream
  getWorkstreams() {
    this.Apiservice.get('WorkAllotment/GetAllWorkstream').subscribe((data: any) => {
      console.log('Workstreams-->', data);
      this.globalConst.checkOriginAccess(data);
      this.workstreamData = data;
    });
  }
  getBatches(typ) {
    var walotwid = '';
    var walotsid = '';
    this.resetService();

    if (typ == 'a') {
      walotwid = this.waSearchFm.get('wsname').value;
      walotsid = this.waSearchFm.get('service').value;
    }
    console.log('Service id -->', walotsid)
    if (walotsid != '' && walotsid != null) {
      this.Apiservice.get('WorkAllotment/GetBatchList?wid=' + walotwid + '&sid=' + walotsid).subscribe((data: any) => {
        this.globalConst.checkOriginAccess(data);
        this.walotBatches = data;
      });
    }
  }

  getEmployeeDetails() {
    this.spinner.show();
    var userId = localStorage.getItem('LoginId');
    this.Apiservice.get('Masters/GetUsersList?loginId=' + userId).subscribe((data: any) => {
      console.log('Employee Details --->', data);
      this.globalConst.checkOriginAccess(data);
      this.rows = data;
      this.tempData = data;
      this.multiPurposeTemp = data;
      this.serverSideRowData = data;
      this.spinner.hide();
    });
  }

  udpateWorkstreamUsersStatus(id,workstream, service, bid, user_status) {
    Swal.fire({
      title: "Do you want to update this record.?",
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
        var str = '';
        if (user_status == 'False') {
          var str = '1'
        }
        else {
          var str = '0'
        }
        this.Apiservice.get('Masters/UpdateWorkstreamUsersStatus?userId=' + id + '&workstream=' + workstream + '&service=' + service + '&state=' + bid + '&statusStr=' + str).subscribe((data: any) => {
          console.log("Update status --->", data);
          this.globalConst.checkOriginAccess(data);
          if (data == 1) {
            this.getEmployeeDetails();
            Swal.fire('Saved!', '', 'success');
          }
        });

      } else if (result.isDenied) {

        Swal.fire('Changes are not saved', '', 'info');
      }
    })
  }


  frmSubmit() {
    console.table(this.waSearchFm.value);
    var frmObj = this.waSearchFm.value;
    var wid = frmObj.wsname; var sid = frmObj.service; var state = frmObj.state
    console.log(wid);
    console.log(sid.length);
    console.log(frmObj.assocName);
    //return
    var assoctId = this.associate;
    console.log(assoctId)
    console.log(state)
   // return
    if (wid != "" && sid != '' && state != '') {
      var userId = localStorage.getItem('LoginId');
      this.spinner.show();
      this.Apiservice.get('Masters/InsertUsers?workstream=' + wid + '&service=' + sid + '&state=' + state + '&id=' + frmObj.assocName + '&loginId=' + userId).subscribe((data: any) => {
        console.log("Bulk Upload --->", data);
        this.globalConst.checkOriginAccess(data);
        this.spinner.hide();
        if (data.length > 0) {
          if (data[0].outPutName == 'Success') {
            Swal.fire({ text: "Submited Successfully!", icon: 'success' }).then(function () { });
            this.getFilter();
            this.resetAll();
          } else if (data[0].outPutName == 'Already Exists') {
            Swal.fire({ text: this.service + " Service Already Exists!", icon: 'error' }).then(function () { });
          }
        } else {
          Swal.fire({ text: "Something went wrong please try again!", icon: 'warning' }).then(function () { });
          this.resetAll();
        }
        this.getEmployeeDetails();
        this.spinner.hide();
      });
    } else {
      Swal.fire({ text: "Invalid input values!", icon: 'warning' }).then(function () { });
      this.resetAll();
    }
    this.getEmployeeDetails();
    this.spinner.hide();
  }

  getFilterData(dt) {
    const dtObj = [];
    dtObj.push(this.orgEmpData);
    dtObj.forEach(element => {
      return element.emp_id.toLower() == dt.toLower();
    });

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
  UsersGrid() {
    var userId = localStorage.getItem('LoginId');
    this.Apiservice.get('Masters/GetUsersList?loginId=' + userId).subscribe((data: any) => {
      console.log('UsersList-->', data);
      this.globalConst.checkOriginAccess(data);
      this.UserListData = data
      this.timeSpent = data[0].id
      console.log(this.timeSpent)
    });

  }
  toggleShow() {
    this.isShown = !this.isShown;
  }

  //Custome Search for Associtate
  customSearchFn(term: string, item: any) {
    console.log('Req -->', term);
    term = term.toLocaleLowerCase();
    return item.emp_name.toLocaleLowerCase().indexOf(term) > -1 || item.emp_id.toLocaleLowerCase().indexOf(term) > -1;
  }
}
