import { Component, ViewEncapsulation, OnDestroy,OnInit } from '@angular/core';
import { AbstractControl,FormControl, FormGroup, FormBuilder,Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../Api/api.service';
import { DragulaService } from 'ng2-dragula';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { GlobalConstants } from '../../common/global-constants';

let personId = 0;

class Person {
  id: number;
  constructor(public name: string) {
    this.id = personId++;
  }
}

@Component({
  selector: 'app-master-report',
  templateUrl: './master-report.component.html',
  styleUrls: ['./master-report.component.scss']
})
export class MasterReportComponent implements OnInit {

  MANY_ITEMS = 'MANY_ITEMS';
  public many = ['The', 'possibilities', 'are', 'endless!'];
  public many2 = ['Explore', 'them'];
  public minDate : any;
  templatename : any = '';

  left = [
    new Person('Steven'),
    new Person('Paula'),
    new Person('Persephone'),
    new Person('Jacob'),
  ];
  right = [
    new Person('Delia'),
    new Person('Jackson'),
  ];

  BAG = "DRAGULA_EVENTS";
  subs = new Subscription();
  subsNgFor = new Subscription();



  selectedFields: any[] = [
    {'COLUMN_NAME' : 'Workstream'},
    {'COLUMN_NAME' : 'Service'},
    {'COLUMN_NAME' : 'SubService'},
  ];
  // brands: any[] = [
  //   { name: 'ALFA ROMEO' },
  //   { name: 'AUDI' },
  //   { name: 'BMW' },
  //   { name: 'BMW MOTORRAD' },
  //   { name: 'BUICK' },
  //   { name: 'CHEVROLET' },
  //   { name: 'CITROEN' },
  //   { name: 'DAEWOO' },
  //   { name: 'DAIHATSU' },
  //   { name: 'DODGE' },
  //   { name: 'FERRARI' },
  //   { name: 'FIAT' },
  //   { name: 'FORD' },
  //   { name: 'GMC' },
  //   { name: 'HAVAL' }
  // ];

  requiredFields: any[] = [];

  noColumns : any[] = ['id','wstream','workstream','service','batch','sub_service','state','Subservice','w_stream'];

  datatypetables = [
    {name : 'Work Allot', tbl : 'tbl_work_allotment'},
    {name : 'Time Entry', tbl : 'tbl_daily_log'},
    {name : 'Maps Info', tbl : 'tbl_maps'},
    {name : 'Delivery Report', tbl : 'tbl_daily_log'}
  ]
  workstreamData: any; walotServices: any; walotBatches: any; selectedWrkStrm: any = '';
  walotRegions: any = ''; chkdata: any = []; n: number = 1; revdata: any = []; isShown: boolean = false; isUpalodShown: boolean = false;
  isDesShown: boolean = false;

  workstreamName : any;
  serviceName : any;
  stateName : any;

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
    fromdt: new FormControl(''),
    todt: new FormControl(''),
    dateType : new FormControl('')
  });

  submitted = false;

  columns = [
    {'column' : 'Workstream','type' : 'All'},
    {'column' : 'Service','type' : 'All'},
    {'column' : 'Sub Service','type' : 'All'},
    {'column' : 'Map','type' : 'daily_log'},
    {'column' : 'Map Type','type' : 'daily_log'},
    {'column' : 'Step','type' : 'daily_log'},
    {'column' : 'Time Spent','type' : 'daily_log'},
    {'column' : 'Entities','type' : 'daily_log'}
  ]

  priorityColumns = [];
  fixHeaders : any = false;

  constructor(public globalConst: GlobalConstants,private dragulaService: DragulaService,private spinner: NgxSpinnerService, public router: Router, private Apiservice: ApiService, private fb: FormBuilder, private http: HttpClient) {

    const current = new Date();

    this.minDate = {
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      day: current.getDate()
    };

    this.subsNgFor.add(dragulaService.dropModel(this.MANY_ITEMS)
    .subscribe(({ el, target, source, sourceModel, targetModel, item }) => {
      console.log('dropModel:');
      console.log(el);
      console.log(source);
      console.log(target);
      console.log(sourceModel);
      console.log(targetModel);
      console.log(item);
    })
  );
  this.subsNgFor.add(dragulaService.removeModel(this.MANY_ITEMS)
    .subscribe(({ el, source, item, sourceModel }) => {
      console.log('removeModel:');
      console.log(el);
      console.log(source);
      console.log(sourceModel);
      console.log(item);
    })
  );

    //spill

    dragulaService.createGroup("SPILL", {
      removeOnSpill: true
    });

    //revert

    dragulaService.createGroup("REVERT", {
      revertOnSpill: true
    });

    //copy

    dragulaService.createGroup('COPYABLE', {
      copy: (el, source) => {
        return source.id === 'left';
      },
      accepts: (el, target, source, sibling) => {
        // To avoid dragging from right to left container
        return target.id !== 'left';
      }
    });

    //copy model

    dragulaService.createGroup('PERSON', {
      copy: (el, source) => {
        return source.id === 'left';
      },
      copyItem: (person: Person) => {
        return new Person(person.name);
      },
      accepts: (el, target, source, sibling) => {
        // To avoid dragging from right to left container
        return target.id !== 'left';
      }
    });

    //handle

    dragulaService.createGroup("HANDLES", {
      moves: (el, container, handle) => {
        return handle.className === 'handle draggable-move';
      }
    });

    //Nested

    this.dragulaService.createGroup("COLUMNS", {
      direction: 'horizontal',
      moves: (el, source, handle) => handle.className === "group-handle"
    });



    this.dragulaService.createGroup('drag-brand', {
      removeOnSpill: true,
      moves: function(el: any, container: any, handle: any): any {
        if (el.classList.contains('cbrands-container')) {
          return false;
        }

        return true;
      }
    });
   }




  trackByCBrands(index: any, item: any) {
    console.log('Track A -->', item);
    return item.id;

  }

  trackByBrands(index: any, item: any) {
    console.log('Track B -->', item);
    return item.id;
  }

  removeBrand(item: any, idx: any) {
    this.requiredFields.push(item);
    this.selectedFields.splice(idx, 1);
  }

  getDragData() {
    console.log('selectedFields', this.selectedFields);
    console.log('brands', this.requiredFields);
    console.log(this.waSearchFm.get('wsname').value);
    var wst = this.waSearchFm.get('wsname').value;
    this.workstreamName = this.workstreamData.find((x: any) => x.wid == wst);
    console.log('selected Sub Service ->', this.workstreamName);
    var serv = this.waSearchFm.get('service').value;
    this.serviceName = this.walotServices.find((x: any) => x.sid == serv);
    console.log('selected Service ->', this.serviceName);
    var stat = this.waSearchFm.get('state').value;
    this.stateName = this.walotBatches.find((x: any) => x.bid == stat);
    console.log('selected Sub Service ->', this.stateName);

    this.fixHeaders = true;
  }

  ngOnDestroy() {
    this.dragulaService.destroy('drag-brand');
  }






  ngOnInit(): void {

    this.waSearchFm = this.fb.group({
      wsname: ['', Validators.required],
      region: [''],
      service: ['', Validators.required],
      state: ['', Validators.required],
      fromdt: [''],
      todt: [''],
      dateType : ['', Validators.required]
    });


    this.GetWorkstream();
  }


   //Workstream
   GetWorkstream() {
    this.spinner.show();
    let id=localStorage.getItem('LoginId');
    this.walotServices = [];
    this.walotBatches = [];

    this.Apiservice.get('WorkAllotment/GetWorkStream?id=' + id).subscribe((data: any) => {
      this.globalConst.checkOriginAccess(data);

        this.spinner.hide();
        console.log(data);
        this.workstreamData = data;

    });
  }

  //Region
  GetRegions(wrkstrm) {
    this.Apiservice.get('WorkAllotment/GetRegionList?wid=' + wrkstrm).subscribe((data: any) => {
      console.log('Regions-->', data);
      this.globalConst.checkOriginAccess(data);

      this.walotRegions = data;
      this.walotServices = [];
      this.walotBatches = [];
    });
  }

  //Service
  getServiceslist() {
    this.spinner.show();
    const walotwid = this.waSearchFm.get('wsname').value;
    this.GetRegions(walotwid);
    this.walotBatches = [];
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


  onSubmit(){
    //console.log('Result of selected -->', this.priorityColumns);
    if(!this.waSearchFm.valid) {
      Swal.fire({text: "Please select mandatory inputs.!",icon: 'warning'}).then(function(){
        return false;
      });
      return false;
    }else{
      this.spinner.show();
      const dataType = this.waSearchFm.get('dateType').value;
      //https://localhost:44313/api/DynamicReports/GetDailyLogColumns?type=tbl_maps
      this.Apiservice.get('DynamicReports/GetDailyLogColumns?type=' + dataType).subscribe((data: any) => {
        console.log('Data type Resp -->', data);
        this.globalConst.checkOriginAccess(data);

        this.requiredFields = data;

        this.requiredFields.filter(function (d,ind) {


            if (d['COLUMN_NAME'].indexOf('wsname') > -1 || d['COLUMN_NAME'].indexOf('SubService') > -1 || d['COLUMN_NAME'].indexOf('Sub_service') > -1 || d['COLUMN_NAME'].indexOf('wstream') > -1 || d['COLUMN_NAME'].indexOf('w_name') > -1 || d['COLUMN_NAME'].indexOf('id') > -1 || d['COLUMN_NAME'].indexOf('workstream') > -1 || d['COLUMN_NAME'].indexOf('service') > -1 || d['COLUMN_NAME'].indexOf('batch') > -1) {
              data.splice(ind, 1); // Remove array element
            }

        });
        console.log('Final Out put -->', this.requiredFields);
        this.spinner.hide();

      });
    }
  }


  //Save Template
  saveTemplate(){

    Swal.fire({
      title: "Are you sure you want to save this template.!",
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
      //console.log('Result Popup ->', result)
      var corp = localStorage.getItem('CorpId');
      var logid = localStorage.getItem('LoginId');
      var cdt = new Date();
      if (result.isConfirmed) {
          var jsonObj = {
            templateName: this.templatename,
            workstream  : this.waSearchFm.get('wsname').value,
            service     : this.waSearchFm.get('service').value,
            subService  : this.waSearchFm.get('state').value,
            datatype    : this.waSearchFm.get('dateType').value,
            columnsdt   : this.selectedFields,
            createddt   : this.getDate(),
            updateddt   : '',
            userId      : logid,
            corpId      : corp
          }

          console.log('Json Obj -->', jsonObj);

      }
    });
  }


  getDate(){
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    return  yyyy + '-' + mm + '-' + dd;
  }
  resetTemplate(){
    this.fixHeaders = false;
  }

}
