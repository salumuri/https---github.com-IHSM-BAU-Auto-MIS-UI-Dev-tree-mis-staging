import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../Api/api.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import * as XLSX from 'xlsx';
import { DatatableData } from './data/datatables.data';
import { GlobalConstants } from '../../common/global-constants';

import {
  ColumnMode,
  DatatableComponent,
  SelectionType
} from '@swimlane/ngx-datatable';
import { map, publish } from 'rxjs/operators';



@Component({
  selector: 'app-employee-details',
  templateUrl: './employee-details.component.html',
  styleUrls: ['../../data-tables.component.scss', '../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})


export class EmployeeDetailsComponent implements OnInit {

  public contentHeader: object;

  // row data
  public rows = [];

  public columns = [
    { name: 'CorpID', prop: 'emp_id' },
    { name: 'EmpName', prop: 'emp_name' },
    { name: 'Designation', prop: 'designation'},
    { name: 'Email', prop: 'email' },
    { name: 'Workstream', prop: 'workstream'},
    { name: 'Service', prop: 'service'},
    { name: 'TaskManager', prop: 'task_manager'}
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
      return (d.emp_id.toLowerCase().indexOf(val) !== -1 || d.emp_name.toLowerCase().indexOf(val) !== -1 || d.workstream_name.toLowerCase().indexOf(val) !== -1 || d.service_name.toLowerCase().indexOf(val) !== -1) || !val;
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


  constructor(public globalConst: GlobalConstants,private spinner: NgxSpinnerService, public router: Router, private Apiservice: ApiService, private fb: FormBuilder, private http: HttpClient) {
    this.getEmployeeDetails();
  }

  inlineEditingUpdate(event, cell, rowIndex) {
    this.editing[rowIndex + '-' + cell] = false;
    this.rows[rowIndex][cell] = event.target.value;
    this.rows = [...this.rows];
  }

  ngOnInit(): void {
    this.spinner.show();
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


  }

  getEmployeeDetails(){
    this.spinner.show();
    var userId = localStorage.getItem('LoginId');
    this.Apiservice.get('Reports/GetEmployeeListNew').subscribe((data: any) => {
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

   //Excel Export
  exportexcel(): void
  {
    /* pass here the table id */
    let element = document.getElementById('excel-table');
    //console.log(element)
    const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, 'EmployeeDetails.xlsx');
  }


  exportExcel(): void
  {
    /* pass here the data source */

    const ws: XLSX.WorkSheet =XLSX.utils.json_to_sheet(this.rows);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, 'FileName.xlsx');

  }
}
