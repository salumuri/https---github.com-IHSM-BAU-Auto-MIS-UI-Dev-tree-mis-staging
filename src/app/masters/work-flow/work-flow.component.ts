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
import { WorkflowViewMoreComponent } from '../../modals/workflow-view-more/workflow-view-more.component';
import { WorkflowSingleMapComponent } from '../../modals/workflow-single-map/workflow-single-map.component';

@Component({
  selector: 'app-work-flow',
  templateUrl: './work-flow.component.html',
  styleUrls: ['./work-flow.component.scss','../../data-tables.component.scss', '../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})

export class WorkFlowComponent implements OnInit {
  public selectedWrkStrm: any = '';
  workstreamData: any;
  walotServices : any;
  walotBatches: any;
  public mapSearch = false;
  mapsCount : any = [];
  dataResponse : any = [];
  searchForm : any = false;
  wstream : any = '';
  mapsearchvar : any = '';
  public recordType = [
    {
      rtype : 'Single'
    },
    {
      rtype : 'Bulk'
   },
   {
      rtype : 'File Status'
    }
  ]

  waSearchFm: FormGroup = new FormGroup({
    wsname: new FormControl(''),
    service: new FormControl(''),
    state: new FormControl(''),
    mtype: new FormControl(''),
    stype : new FormControl('')
  });


  constructor(private modalService: NgbModal,public globalConst: GlobalConstants,private spinner: NgxSpinnerService,public router : Router,private Apiservice: ApiService,private fb: FormBuilder,private http: HttpClient) { }

  ngOnInit(): void {
    this.GetWorkstream();
    var loginfo = localStorage.getItem('CorpId')

    if(loginfo == '' || loginfo == null || loginfo == 'null'){
      this.router.navigate(['/pages/login']);
    }

    this.selectedWrkStrm = localStorage.getItem('selectedWrkStrm');
    //console.log('Sel work strm --->', this.selectedWrkStrm)

    if(this.selectedWrkStrm == '' || this.selectedWrkStrm == null){
      this.swapAlerts('Please select Workstream.!')
    }
    this.waSearchFm = this.fb.group({
      wsname    : ['', Validators.required],
      service   : ['', Validators.required],
      state     : ['', Validators.required],
      mtype : ['', Validators.required],
      stype : ['', Validators.required]
    }
    );


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
      }



      this.resetAll();
      this.Apiservice.get('WorkAllotment/GetAreaList?wid=' + walotwid).subscribe((data: any) => {
        this.globalConst.checkOriginAccess(data);

        this.walotServices = data;
      });
    }
    getBatches(typ){
      var walotwid = '';
      var walotsid = '';
      this.resetService();

      if(typ == 'a'){
        walotwid = this.waSearchFm.get('wsname').value;
        walotsid = this.waSearchFm.get('service').value;
      }

      console.log('Service id -->', walotsid)
      if(walotsid != '' && walotsid != null){
        this.Apiservice.get('WorkAllotment/GetBatchList?wid=' + walotwid + '&sid=' + walotsid).subscribe((data: any) => {
          this.globalConst.checkOriginAccess(data);

          this.walotBatches = data;
        });
      }

    }

    //Maps Search
  mapsearchGrid(){
    this.mapSearch = !this.mapSearch;
  }

  //Searc submit
  onSubmit(){
    this.spinner.show();
    if (this.waSearchFm.invalid) {
      Swal.fire({text: "Please select to all mandatory fields!",icon: 'error'});
      this.spinner.hide();
      return;
    }else{
      var formObj = this.waSearchFm.value;

      this.Apiservice.get('Masters/GetCountOfWorkFlow?wid='+formObj.wsname+'&sid='+formObj.service+'&ssid='+formObj.state).subscribe((data: any) => {
        console.log('Map Count Resp --->', data);
        this.globalConst.checkOriginAccess(data);
        this.mapsCount = data;
        this.searchForm = true;
        this.spinner.hide();
      });

    }


  }

  //More Infor from map count
  getMoreInfo(rowdt,ind){
    console.log('Row data-->', rowdt)
    this.spinner.hide();
    var formObj = this.waSearchFm.value;

    this.Apiservice.get('Masters/GetCountOfWorkFlow_More?wid='+formObj.wsname+'&sid='+formObj.service+'&ssid='+formObj.state+'&step='+rowdt.steps).subscribe((data: any) => {
      console.log('Maps Resp --->', data);
      this.dataResponse = data;
      this.spinner.hide();
    });
  }

  GetModetype()
  {
    var mode
    if(this.mapsearchvar == ''){
mode= 'map'
    }
    else
    {
      mode='bulk'

    }
  }
  
  //Search by Map
  searchByMap(){
    this.spinner.show();
    if(this.wstream != '' && this.mapsearchvar != ''){
      this.Apiservice.get('Masters/GetCountOfWorkFlow_search_by_map?wid='+this.wstream+'&map='+this.mapsearchvar).subscribe((data: any) => {
        console.log('Single Maps Resp --->', data);
        this.dataResponse = data;
        this.spinner.hide();
      });
    }else{
      Swal.fire({text: "Please select to all mandatory fields!",icon: 'error'});
      this.spinner.hide();
      return;
    }
  }


    //Feedback Errors List Details
    openMapSearchMoreInfo(rowdt,ind){
      // this.getSteps(rowdt.workstream,rowdt.service);
      const modalRef = this.modalService.open(WorkflowSingleMapComponent,
      {
        scrollable: true,windowClass: 'myCustomModalClass',size : 'lg'
      },);
  
      var formObj = this.waSearchFm.value;
  
      var obj = {
        'rowdt' : rowdt,
        'searchfm' : formObj,
      }
  
        modalRef.componentInstance.fromParent = obj;
        modalRef.result.then((result) => {
        console.log('Model Result --->', result)
  
      });
    }
  

  //Feedback Errors List Details
  openMapMoreInfo(rowdt,ind){
    // this.getSteps(rowdt.workstream,rowdt.service);
    const modalRef = this.modalService.open(WorkflowViewMoreComponent,
    {
      scrollable: true,windowClass: 'myCustomModalClass',size : 'lg'
    },);

    var formObj = this.waSearchFm.value;

    var obj = {
      'rowdt' : rowdt,
      'searchfm' : formObj,
    }

      modalRef.componentInstance.fromParent = obj;
      modalRef.result.then((result) => {
      console.log('Model Result --->', result)

    });
  }



  //Type change
  typeChange(typ){
    console.log("Type Test -->", typ);

    //this.searchForm = false;


    // if(typ == 'Received'){
    //   this.received = true;
    // }else if(typ == 'Delivered'){
    //   this.delivered = true;
    //   this.step_delivered = false;
    // }else if(typ == 'Pending'){
    //   this.pending = true;
    // }
 }
}
