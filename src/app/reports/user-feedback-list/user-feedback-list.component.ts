import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from 'app/Api/api.service';
import { FeedbackErrorListComponent } from 'app/modals/feedback-error-list/feedback-error-list.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgModule, ViewEncapsulation, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DatatableData } from '../../data-tables/datatables.data';
import { WkDatatableData } from '../../data-tables/workstreamdttbl.data';
import { HttpClient } from '@angular/common/http';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { GlobalConstants } from '../../common/global-constants';


import {
  ColumnMode,
  DatatableComponent,
  SelectionType
} from '@swimlane/ngx-datatable';
import { map, publish } from 'rxjs/operators';


@Component({
  selector: 'app-user-feedback-list',
  templateUrl: './user-feedback-list.component.html',
  styleUrls: ['../../data-tables.component.scss', '../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UserFeedbackListComponent implements OnInit {
  public contentHeader: object;

  // row data
  public rows = [];

  public columns = [
    { name: 'Employee', prop: 'feedbackTo_CorpID' },
    { name: 'Workstream', prop: 'w_name' },
    { name: 'Service', prop: 'service_name' },
    { name: 'Sub Service', prop: 'batch_name' },
    { name: 'Record', prop: 'map_name' },
    { name: 'QC Per', prop: 'qual_per' },
    { name: 'Acceptance', prop: 'acceptance' },
    { name: 'Feedback Type', prop: 'feedback_type' },
    { name: 'Date', prop: 'date' }
  ];
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
      return (d.w_name.toLowerCase().indexOf(val) !== -1 || d.service_name.toLowerCase().indexOf(val) !== -1 || d.batch_name.toLowerCase().indexOf(val) !== -1 || d.map_name.toLowerCase().indexOf(val) !== -1) || !val;
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



  feedbackErrorlist : any = [];
  empId = localStorage.getItem("LoginId");
  empName  = localStorage.getItem("Name");


  constructor(public globalConst: GlobalConstants,private modalService: NgbModal,private spinner: NgxSpinnerService,public router : Router,private Apiservice: ApiService, private http: HttpClient) { }

  ngOnInit(): void {
    this.spinner.show();
    var loginfo = localStorage.getItem('CorpId')

    if(loginfo == '' || loginfo == null || loginfo == 'null'){
      this.router.navigate(['/pages/login']);
    }

    this.getFeedbackList();
    this.spinner.hide();
  }


   //Getting List of Feedabck for Maps
   getFeedbackList(){
    this.spinner.show();
    this.Apiservice.get('Feedback/GetFeedbackUserDetailsList?login_ID='+this.empId).subscribe((data: any) => {
      console.log('Feedback List -->',data);
      this.globalConst.checkOriginAccess(data);

      this.feedbackErrorlist = data;
      this.rows = data;
      this.tempData = data;
      this.multiPurposeTemp = data;
      this.serverSideRowData = data;
      this.spinner.hide();
    });
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
  //Feedback Errors List Details
  openFeedbackErrorsModal(rowdt,ind){
    const modalRef = this.modalService.open(FeedbackErrorListComponent,
      {
        scrollable: true,windowClass: 'myCustomModalClass',size : 'lg'
      },);
    var revDtOb = {
      rowind  : ind,
      rowdt   : rowdt,
      userTyp : 'Admin'
    }
    modalRef.componentInstance.fromParent = revDtOb;
    modalRef.result.then((result) => {
      console.log('Model Result --->', result)

      if(result == 'Ok'){
        this.spinner.show();
        this.Apiservice.get('Feedback/UpdateFeedbackChk?qc_ID='+rowdt.qcID+'&chk_status=1&prmDone').subscribe(data => {
          console.log('Breckup list -->',data);
          this.globalConst.checkOriginAccess(data);

          this.getFeedbackList();
          this.spinner.hide();
        });
      }
    });
   }
}
