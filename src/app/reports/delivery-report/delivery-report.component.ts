import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { ApiService } from '../../Api/api.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { GlobalConstants } from '../../common/global-constants';

@Component({
  selector: 'app-delivery-report',
  templateUrl: './delivery-report.component.html',
  styleUrls: ['./delivery-report.component.scss']
})
export class DeliveryReportComponent implements OnInit {

  workstreamData: any; walotServices: any; walotBatches: any; selectedWrkStrm: any = '';
  walotRegions: any = ''; chkdata: any = []; n: number = 1; revdata: any = []; isShown: boolean = false; isUpalodShown: boolean = false;
  isDesShown: boolean = false;

  //Excel Upload
  public reportData: any = [];
  public btnStatus = 'grid';
  public userRole = localStorage.getItem('Role');
  public receiveddt : any;
  public shipmentdt : any;
  public frmSubmit : any = false;

  waSearchFm: FormGroup = new FormGroup({
    wsname: new FormControl(''),
    region: new FormControl(''),
    service: new FormControl(''),
    state: new FormControl(''),
    receiveddt: new FormControl(''),
    shipmentdt: new FormControl('')
  });

  submitted = false;
  constructor(public globalConst: GlobalConstants,private spinner: NgxSpinnerService, public router: Router, private Apiservice: ApiService, private fb: FormBuilder, private http: HttpClient) {
    //this.checkListColumns = ["Workstream","Service","State","Record","RecordType","ReceivedDate","Time","Status","Remarks","Chk"];
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

    this.GetWorkstream();
    this.waSearchFm = this.fb.group({
      wsname: [''],
      region: [''],
      service: [''],
      state: [''],
      receiveddt: ['', Validators.required],
      shipmentdt: ['', Validators.required]
    }
    );
    this.spinner.hide();
    // if(this.selectedWrkStrm != ''){
    //   this.getServiceslist();
    // }
  }

  //Workstream
  GetWorkstream() {
   // this.workstreamData = JSON.parse(localStorage.getItem('WorkStreams'));;
    let id=localStorage.getItem('LoginId');
    this.Apiservice.get('WorkAllotment/GetWorkStream?id=' + id).subscribe((data: any) => {
        console.log(data);
        this.globalConst.checkOriginAccess(data);

        this.workstreamData = data;
    });
  }

  //Region
  GetRegions(wrkstrm) {
    this.Apiservice.get('WorkAllotment/GetRegionList?wid=' + wrkstrm).subscribe((data: any) => {
      console.log('Regions-->', data);
      this.globalConst.checkOriginAccess(data);

      this.walotRegions = data;
    });
  }

  //Service
  getServiceslist() {
    this.spinner.show();
    const walotwid = this.waSearchFm.get('wsname').value;
    this.GetRegions(walotwid);
    this.Apiservice.get('WorkAllotment/GetAreaList?wid=' + walotwid).subscribe((data: any) => {
      console.log('Services-->', data);
      this.globalConst.checkOriginAccess(data);

      this.spinner.hide();
      this.walotServices = data;
    });
  }

  //Batchs
  getBatches() {
    this.spinner.show();
    const walotwid = this.waSearchFm.get('wsname').value;
    const walotsid = this.waSearchFm.get('service').value;
    this.Apiservice.get('WorkAllotment/GetBatchList?wid=' + walotwid + '&sid=' + walotsid).subscribe((data: any) => {
      console.log('Batches-->', data);
      this.globalConst.checkOriginAccess(data);

      this.spinner.hide();
      this.walotBatches = data;
    });
  }


  onSubmit() {
    console.log("MIS");
    this.spinner.show();
    if (this.waSearchFm.invalid) {
      this.spinner.hide();
      Swal.fire({text: "Please fill mandatory fields.!",icon: 'warning'});
      return
    }

    var frmObj = this.waSearchFm.value;
    console.log('Form Object-->', frmObj);
    let frmDate : any = '';
    let  toDate : any = '';
    if(frmObj.receiveddt != ''){
      var fdt = frmObj.receiveddt.year +'-'+ frmObj.receiveddt.month +'-'+ frmObj.receiveddt.day
      frmDate = new Date(fdt);
      //frmDate = frmObj.receiveddt;
    }
    if(frmObj.shipmentdt != ''){
      var tdt = frmObj.shipmentdt.year +'-'+ frmObj.shipmentdt.month +'-'+ frmObj.shipmentdt.day
      toDate =  new Date(tdt);
      //toDate = frmObj.shipmentdt
    }

    // console.log('Org From -->', frmObj.receiveddt)
    // console.log('Org To -->', frmObj.shipmentdt)

    // console.log('From -->', frmDate)
    // console.log('To -->', toDate)

    var getMapsList = {
      'wsname': frmObj.wsname,
      'region': frmObj.region,
      'service': frmObj.service,
      'state': frmObj.state,
      'recDate': (frmDate != '' ? this.formatDate2(frmDate) : ''),
      'shipmentdt' : (toDate != '' ? this.formatDate2(toDate) : '')
    }

    console.log('Form Data-->', getMapsList);
    var userId = localStorage.getItem('LoginId');
    this.Apiservice.get('Reports/GetDeliveryList?ws='+getMapsList.wsname+'&region='+getMapsList.region+'&service='+getMapsList.service+'&batch='+getMapsList.state+'&fromDt='+getMapsList.recDate+'&todate='+getMapsList.shipmentdt).subscribe((data: any) => {
        console.log('Delivery Report --->', data);
        this.globalConst.checkOriginAccess(data);

        this.reportData = data;
        this.frmSubmit = true;
        this.spinner.hide();
    });
  }



  formatDate2(date) {
    var year = date.getFullYear().toString();
    var month = (date.getMonth() + 101).toString().substring(1);
    var day = (date.getDate() + 100).toString().substring(1);
    return year + "-" + month + "-" + day;
}

   //Format Date
   formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth()),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
  }

  toggleDesShow() {
    this.isDesShown = !this.isDesShown;
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
      let element = document.getElementById('excel-table');
      const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

      /* save to file */
      XLSX.writeFile(wb, 'DeliveryReport.xlsx');
    }

}
