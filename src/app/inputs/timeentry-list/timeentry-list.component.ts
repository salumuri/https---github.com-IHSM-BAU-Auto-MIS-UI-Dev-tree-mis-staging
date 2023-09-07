import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from 'app/Api/api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgModule, ViewEncapsulation, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DatatableData } from '../../data-tables/datatables.data';
import { WkDatatableData } from '../../data-tables/workstreamdttbl.data';
import { HttpClient } from '@angular/common/http';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { MapDetailsComponent } from "../../modals/map-details/map-details.component";
import { GlobalConstants } from '../../common/global-constants';



import {
  ColumnMode,
  DatatableComponent,
  SelectionType
} from '@swimlane/ngx-datatable';
import { map, publish } from 'rxjs/operators';
@Component({
  selector: 'app-timeentry-list',
  templateUrl: './timeentry-list.component.html',
  styleUrls: ['../../data-tables.component.scss', '../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TimeentryListComponent implements OnInit {
  timeDate : any;
  public contentHeader: object;

  // row data
  public rows = [];

  public columns = [
    { name: 'Employee', prop: 'emp_name' },
    { name: 'Workstream', prop: 'w_name' },
    { name: 'Service', prop: 'service_name' },
    { name: 'Sub Service', prop: 'batch_name' },
    { name: 'Month', prop: 'month' },
    { name: 'Shift', prop: 'shift' },
    { name: 'TaskManager', prop: 'taskManager' },
    { name: 'GL', prop: 'Glid' },
    { name: 'Record', prop: 'map' },
    { name: 'RecordType', prop: 'map_type' },
    { name: 'Step', prop: 'step_name' },
    { name: 'Undercost', prop: 'undercost' },
    { name: 'Status', prop: 'status' },
    { name: 'TimeSpent', prop: 'time_spent' },
    { name: 'Entities', prop: 'entities' },
    { name: 'Runs', prop: 'runs' },
    { name: 'Folder Name', prop: 'folder_name' },
    { name: 'Remarks', prop: 'remarks' }
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
  return (d.w_name.toLowerCase().indexOf(val) !== -1 || d.service_name.toLowerCase().indexOf(val) !== -1 ||
  d.batch_name.toLowerCase().indexOf(val) !== -1 || d.month.toLowerCase().indexOf(val) !== -1 || d.status.toLowerCase().indexOf(val) !== -1) || !val;
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

  constructor(public globalConst: GlobalConstants,private fb: FormBuilder,private http: HttpClient,private modalService: NgbModal,private spinner: NgxSpinnerService,public router : Router,private Apiservice: ApiService) { }

  ngOnInit(): void {
    this.spinner.show();
    var loginfo = localStorage.getItem('CorpId')

    if(loginfo == '' || loginfo == null || loginfo == 'null'){
      this.router.navigate(['/pages/login']);
    }

    this.GetFullList();
    this.spinner.hide();
  }


 GetFullList() {
  this.spinner.show();
  let id=localStorage.getItem('LoginId');
  this.Apiservice.get('TimeEntry/GetFullTimeList?loginID=' + id).subscribe((data: any) => {
      console.log('Get Full Data-->',data);
      this.globalConst.checkOriginAccess(data);

      this.timeDate = data;
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

  //Excel Export
  exportexcel(): void {
    /* pass here the table id */
    // let element = document.getElementById('excel-table');
    //console.log(element)
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.tempData);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
     /* save to file */
    XLSX.writeFile(wb, 'BulkTimeEntrySampleExcel.xlsx');
  }

//Map Details
openMapsModal(x,ind){
  // this.getSteps(rowdt.workstream,rowdt.service);
  const modalRef = this.modalService.open(MapDetailsComponent,
  {
    scrollable: true,windowClass: 'myCustomModalClass',size : 'lg'
  },);
}


 //Excel Export
//  exportexcel(): void
//  {
//    let element = document.getElementById('excel-table');
//    const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);
//    const wb: XLSX.WorkBook = XLSX.utils.book_new();
//    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

//    /* save to file */
//    XLSX.writeFile(wb, 'TimeEntryReport.xlsx');
//  }
 }
