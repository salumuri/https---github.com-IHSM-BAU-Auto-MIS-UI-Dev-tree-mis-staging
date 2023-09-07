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
  selector: 'app-patr-entry-report',
  templateUrl: './patr-entry-report.component.html',
  styleUrls: ['./patr-entry-report.component.scss']
})


export class PatrEntryReportComponent implements OnInit {
  workstreamData : any = []; walotServices : any = [];

  waSearchFm: FormGroup = new FormGroup({
    wsname: new FormControl(''),
    service: new FormControl(''),
    recdate: new FormControl('')
  });

  constructor(public globalConst: GlobalConstants,private spinner: NgxSpinnerService, public router: Router, private Apiservice: ApiService, private fb: FormBuilder, private http: HttpClient) {


   }

  ngOnInit(): void {
    this.waSearchFm = this.fb.group({
      wsname: ['', Validators.required],
      service: ['', Validators.required],
      recdate: [''],
    });

    this.GetWorkstream();
  }

  //Get Workstream
  GetWorkstream() {
    let id=localStorage.getItem('LoginId');
    this.Apiservice.get('WorkAllotment/GetWorkStream?id=' + id).subscribe((data: any) => {
        //console.log(data);
        this.globalConst.checkOriginAccess(data);
        this.workstreamData = data;
    });
  }

  //Get Service List
  getServiceslist() {
    this.spinner.show();
    const walotwid = this.waSearchFm.get('wsname').value;
    this.Apiservice.get('WorkAllotment/GetAreaList?wid=' + walotwid).subscribe((data: any) => {
      console.log('Services-->', data);
      this.globalConst.checkOriginAccess(data);
      this.walotServices = data;
      this.spinner.hide();
    });
    this.spinner.hide();
  }

  //On Submit
  onSubmit() {

  }
}
