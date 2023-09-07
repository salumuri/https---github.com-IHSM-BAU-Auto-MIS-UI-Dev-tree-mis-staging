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

@Component({
  selector: 'app-time-spent-details',
  templateUrl: './time-spent-details.component.html',
  styleUrls: ['./time-spent-details.component.scss']
})
export class TimeSpentDetailsComponent implements OnInit {

  waSearchFm: FormGroup = new FormGroup({
    wsname: new FormControl(''),
    service: new FormControl(''),
    state: new FormControl(''),
    fromdt: new FormControl(''),
    todt: new FormControl(''),
    reportType : new FormControl(''),
    step :  new FormControl('')
  });

  public recordType = [
    {
      rtype : 'WS/Step Wise'
    },
    {
      rtype : 'WS/Assoc Wise'
    },
    {
      rtype : 'Day/WS Wise'
    },
    {
       rtype : 'Day/Assoc Wise'
    }
  ]




  workstreamData: any; walotServices: any; walotBatches: any; selectedWrkStrm: any = '';
  walotRegions: any = '';submitted = false; userSteps : any; timeSpentDetails : any = [];
  timeSpentDetailsMore : any = []; recType : any = '';

  constructor(private modalService: NgbModal,private spinner: NgxSpinnerService, public router: Router, private Apiservice: ApiService, private fb: FormBuilder, private http: HttpClient) {

  }

  ngOnInit(): void {

    this.waSearchFm = this.fb.group({
      wsname: ['', Validators.required],
      service: ['', Validators.required],
      state: ['', Validators.required],
      fromdt: [''],
      todt: [''],
      reportType : [''],
      step: ['', Validators.required]
    });

    this.GetWorkstream();
  }



  GetWorkstream() {
    //this.workstreamData = JSON.parse(localStorage.getItem('WorkStreams'));;

    let id=localStorage.getItem('LoginId');
    this.Apiservice.get('WorkAllotment/GetWorkStream?id=' + id).subscribe((data: any) => {
        console.log(data);
        this.workstreamData = data;
    });
  }

  //Getting regions
  GetRegions(wrkstrm) {
    this.spinner.show();
    this.Apiservice.get('WorkAllotment/GetRegionList?wid=' + wrkstrm).subscribe((data: any) => {
      //console.log('Regions-->',data);
      this.walotRegions = data;
      this.spinner.hide();
    });
    this.spinner.hide();
  }

  //Getting Service list
  getServiceslist() {
    this.spinner.show();
    this.waSearchFm.controls['service'].setValue('');
    this.waSearchFm.controls['state'].setValue('');
    const walotwid = this.waSearchFm.get('wsname').value;
    this.GetRegions(walotwid);
    this.Apiservice.get('WorkAllotment/GetAreaList?wid=' + walotwid).subscribe((data: any) => {
      //console.log('Services-->', data);
      this.walotServices = data;
      this.spinner.hide();
    });
    this.spinner.hide();
  }

  //Getting Batches
  getBatches() {
    this.spinner.show();
    const walotwid = this.waSearchFm.get('wsname').value;
    const walotsid = this.waSearchFm.get('service').value;
    this.Apiservice.get('WorkAllotment/GetBatchList?wid=' + walotwid + '&sid=' + walotsid).subscribe((data: any) => {
      console.log('Batches-->', data);
      this.spinner.hide();
      this.walotBatches = data;
      //this.getMaps();
      this.getSteps();
    });
  }

   //Get Steps
   getSteps(){
    this.spinner.show();
    this.userSteps = [];
    const walotwid = this.waSearchFm.get('wsname').value;
    const walotsid = this.waSearchFm.get('service').value;
    this.Apiservice.get('WorkAllotment/GetUserwiseAccess?wid='+walotwid+'&sid='+walotsid).subscribe((data: any) => {
      console.log('Steps 2-->',data);
      this.userSteps = data;
      this.spinner.hide();
    });
   }

  get f(): { [key: string]: AbstractControl } {
    return this.waSearchFm.controls;
  }


  //Type change
  typeChange(typ){
    console.log("Type Test -->", typ);

 }

 //On Submit
 onSubmit() {
    //console.log("MIS");
    this.spinner.show();
    var frmObj = this.waSearchFm.value;
    this.recType = frmObj.reportType;
    console.log('Search Qry -->', frmObj);

    var getMapsList = {
      'wsname'  : Number(frmObj.wsname),
      'service' : frmObj.service,
      'state'   : frmObj.state,
      'fromdt'  : frmObj.fromdt,
      'todt'    : frmObj.todt,
      'step'    : frmObj.step,
      'reportType' : frmObj.reportType
    }

    this.Apiservice.get('Reports/GetTimeSpentDetails?ws='+getMapsList.wsname+'&service='+getMapsList.service+'&batch='+getMapsList.state+'&step='+getMapsList.step+'&fromDt='+getMapsList.fromdt+'&todate='+getMapsList.todt+'&reportType='+getMapsList.reportType).subscribe((data: any) => {
      console.log('Get Response -->',data);
      this.timeSpentDetails = data;
      this.spinner.hide();
    });
  }


  //Get More info of Time spent Details
  getMoreInfo(customContent,rec){
    var frmObj = this.waSearchFm.value;

    this.Apiservice.get('Reports/GetTimeSpentDetailsMore?ws='+Number(frmObj.wsname)+'&service='+frmObj.service+'&batch='+frmObj.state+'&step='+frmObj.step+'&fromDt='+frmObj.fromdt+'&todate='+frmObj.todt+'&status='+rec.status).subscribe((data: any) => {
      console.log('Get More Response -->',data);
      this.timeSpentDetailsMore = data;

      this.modalService.open(customContent, { windowClass: 'dark-modal' });

      this.spinner.hide();
    });
  }

  //Excel Export
  exportexcel(tblid,title): void
  {
    let element = document.getElementById(tblid);
    const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    var filName =  title+'.xlsx';
    XLSX.writeFile(wb, filName);
  }

}
