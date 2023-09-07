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

@Component({
  selector: 'app-maps-entites',
  templateUrl: './maps-entites.component.html',
  styleUrls: ['../../data-tables.component.scss', '../../../assets/sass/libs/datatables.scss'],
})
export class MapsEntitesComponent implements OnInit {
  workstreamData: any;
  walotServices: any;
  walotBatches: any;
   // row data
   public rows = [];
   public rows2: any;
   public columns = [
    { name: 'Workstream', prop: 'w_name' },
    { name: 'Service', prop: 'service_name' },
    { name: 'Sub Service', prop: 'batch_name' },
    { name: 'Map', prop: 'map' },
    { name: 'Entities', prop: 'entities' },
    { name: 'Current Step', prop: 'step_name' }
  ];
  waSearchFm: FormGroup = new FormGroup({
    wsname: new FormControl(''),
    service: new FormControl(''),
    state: new FormControl('')
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
      return (d.w_name.toLowerCase().indexOf(val) !== -1 || d.service_name.toLowerCase().indexOf(val) !== -1
        || d.batch_name.toLowerCase().indexOf(val) !== -1 || d.map.toLowerCase().indexOf(val) !== -1 || d.entities.toLowerCase().indexOf(val) !== -1 || d.step_name.toLowerCase().indexOf(val) !== -1) || !val;
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
    this.GetWorkstream();
    this.getWorkstreams();
    this.waSearchFm = this.fb.group({
      wsname: ['', Validators.required],
      service: ['', Validators.required],
      state: ['']
    }
    );
  }
    //Reset All
    resetAll() {
      this.waSearchFm.patchValue({ wsname: '' });
      this.waSearchFm.patchValue({ service: '' });
      this.waSearchFm.patchValue({ state: '' });
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
  frmSubmit(){
    this.spinner.show();
    var walotwid = '';
    var walotsid = '';
    var walotstate = '';
    walotwid = this.waSearchFm.get('wsname').value;
    walotsid = this.waSearchFm.get('service').value;
    walotstate = this.waSearchFm.get('state').value;
    this.Apiservice.get('Masters/GetMapsEntitiesList?wname=' + walotwid+ '&servicename=' + walotsid+ '&statename=' + walotstate).subscribe((data: any) => {
      console.log('Employee Details --->', data);
      this.globalConst.checkOriginAccess(data);

      this.rows = data;
      this.tempData = data;
      this.multiPurposeTemp = data;
      this.serverSideRowData = data;
      this.spinner.hide();
    });
  }

}
