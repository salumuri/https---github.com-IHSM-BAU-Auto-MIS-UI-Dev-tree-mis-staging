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
import { GlobalConstants } from '../../common/global-constants';


@Component({
  selector: 'app-workstreams-services',
  templateUrl: './workstreams-services.component.html',
  styleUrls: ['../../data-tables.component.scss', '../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class WorkstreamsServicesComponent implements OnInit {

  isCollapsed = false;
  gridPos : any = 1;

  SelectionType = SelectionType;

  public userRole = localStorage.getItem('Role');
  public showMng : false;

  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild('tableRowDetails') tableRowDetails: any;
  @ViewChild('tableResponsive') tableResponsive: any;
  @ViewChild('csvReader', { static: false }) csvReader: any;


  empName  = localStorage.getItem("Name");
  empId = localStorage.getItem("LoginId");
  curDate = new Date().toISOString().slice(0, 10)
  /**
   * Constructor
   *
   * @param {HttpClient} http
   */

  submitted = false;
  submittedb = false;
  allMasterInfo;
  workstreams : any = [];
  services : any = [];
  servicesList : any = [];
  subServiceList : any = [];
  subService : any = [];
  subserviceName : any = "";
  workstream : any = "";
  service : any = "";
  userId : any;
  updateGrid : any = false;
  selectedRec : any = 0;
  updateServiceGrid : any = false;
  updatesubServiceGrid : any = false;
  seltdWorkstream = [];
  seltdService = [];
  seltWokstreamName = '';
  seltServiceName = '';

  // row data
  public rows : any;
  public rows2 : any;
  public ColumnMode = ColumnMode;
  public limitRef = 15;

  // column header
  public columns = [
    { name: "Workstream", prop: "w_name" },
    { name: "Service", prop: "service_name" },
    { name: "Status", prop: "service_status" },
    { name: "wdstatus", prop: "wm_delete_status" },
    { name: "Sid", prop: "sid" },
    { name: "ServiceStatus", prop: "sm_delete_status" },
    { name: "SubService", prop: "batch_name"},
    { name: "SubSserviceId", prop: "bid"},
    { name: "Substatus", prop: "batch_status"},
    { name: "SubServiceStatus", prop: "bm_delete_status"},
  ];

  // private
  private tempData = [];
  private tempData2 = [];

  // Public Methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * filterUpdate
   *
   * @param event
   */

  constructor(public globalConst: GlobalConstants,private spinner: NgxSpinnerService,public router : Router,private Apiservice: ApiService,private fb: FormBuilder,private http: HttpClient) {


  }

  /*** On init  */
  ngOnInit() {
    this.spinner.show();
    var loginfo = localStorage.getItem('CorpId')
    this.userId =  localStorage.getItem('LoginId');

    if(loginfo == '' || loginfo == null || loginfo == 'null'){
      this.router.navigate(['/pages/login']);
    }

    this.GetAllMasterInfo();
    //this.GetWorkAllotBulkList();
    this.spinner.hide();
  }

  //Getting all Master info
  GetAllMasterInfo(){
    this.spinner.show();
    this.Apiservice.get('WorkAllotment/GetWorkstreamMaster').subscribe((data: any) => {
      //console.log('Get All List DB 1-->',data);
      this.globalConst.checkOriginAccess(data);

      this.spinner.hide();
      this.allMasterInfo = data;
      //var clean = data.filter((arr, index, self) => index === self.findIndex((t) => (t.wid === arr.wid && t.wm_delete_status === "False")))
      this.workstreams = data;
      this.filterWorkstream();
    });

    this.Apiservice.get('WorkAllotment/GetServiceMaster').subscribe((data: any) => {
        //console.log('Get All List DB Service 1-->');
        this.globalConst.checkOriginAccess(data);

        this.spinner.hide();
        //var Serviceclean = data.filter((arr, index, self) => index === self.findIndex((t) => (t.sid === arr.sid && t.sm_delete_status === "False")))
        this.services = data;
        this.servicesList = data;
        this.rows = this.services;
        this.tempData = this.services;
    });

    this.Apiservice.get('WorkAllotment/GetSubServiceMaster').subscribe((data: any) => {
      console.log('Get All List DB Service-->',data);
      this.globalConst.checkOriginAccess(data);

      this.spinner.hide();
      //var Serviceclean2 = data.filter((arr, index, self) => index === self.findIndex((t) => (t.bid === arr.bid && arr.bm_delete_status === "False")))
      this.subService = data;
      this.subServiceList = data;
      this.rows2 = this.subService;
      this.tempData2 = this.subService;
    });



    console.log('Sub Services --->', this.subServiceList);

    this.spinner.hide();

  }


  filterUpdate(event) {
    const val = event.target.value.toLowerCase();

    // filter our data
    const temp = this.tempData.filter(function (d) {
      return (d.service_name.toLowerCase().indexOf(val) !== -1 || !val) || (d.w_name.toLowerCase().indexOf(val) !== -1 || !val || (d.sm_delete_status.toLowerCase().indexOf(val) !== -1 || !val));
    });

    // update the rows
    this.rows = temp;
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }


  filterUpdate2(event) {
    const val = event.target.value.toLowerCase();

    // filter our data
    const temp = this.tempData2.filter(function (d) {
      return (d.batch_name.toLowerCase().indexOf(val) !== -1 || !val) || (d.service_name.toLowerCase().indexOf(val) !== -1 || !val) || (d.w_name.toLowerCase().indexOf(val) !== -1 || !val || (d.bm_delete_status.toLowerCase().indexOf(val) !== -1 || !val));
    });

    // update the rows
    this.rows2 = temp;
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

  getServiceStatusProp(st){
    if(st == 'True'){
      return 'Active'
    }else{
      return 'In Active'
    }

  }

  //Form Submition
  frmSubmit(){
    console.log('Form value-->', this.workstream)

    if(this.workstream != ""){
      this.spinner.show();

      this.Apiservice.get('Masters/InsertWorkstream?workstream='+this.workstream).subscribe((data: any) => {
        console.log("Bulk Upload --->", data);
        this.globalConst.checkOriginAccess(data);

        this.spinner.hide();
        if(data.length > 0){
            if(data[0].workstreamName == 'Success'){
              Swal.fire({text: "Submited Successfullly!",icon: 'success'}).then(function() {
                //this.fileReset();
              });
              this.GetAllMasterInfo();
            }else if(data[0].workstreamName == 'Already Exists'){
              Swal.fire({text: this.workstream+ "Workstream Already Exists!",icon: 'error'}).then(function() {
                //this.fileReset();
              });
            }
        }else{
          Swal.fire({text: "Failed to insert.!",icon: 'warning'}).then(function() {
            //this.fileReset();
          });
        }
      });
    }else{
      Swal.fire({text: "Please enter workstream!",icon: 'warning'}).then(function() {
        return
      });
    }
  }

  //Update Submit form
  updateSubmit(){
    // console.log("select rec -->", this.selectedRec)
    // console.log("select grid -->", this.updateGrid)
    // console.log("select name -->", this.workstream)
    // return;

    if(this.selectedRec > 0 && this.updateGrid == true && this.workstream != ''){
      this.Apiservice.get('Masters/UpdateWorkstreamName?rid='+this.selectedRec+'&workstream='+this.workstream+'&userid='+this.userId).subscribe((data: any) => {
        console.log("Update Workstream --->", data);
        this.globalConst.checkOriginAccess(data);

        this.GetAllMasterInfo();
        if(data == 1){
          Swal.fire({text: "Updated Successfullly!",icon: 'success'}).then(function() {
            //this.fileReset();
          });
        }else if(data == 0){
          Swal.fire({text: "Workstream Already Exists!",icon: 'warning'}).then(function() {
            //this.fileReset();
          });
        }
        this.spinner.hide();
      });
    }else{
      Swal.fire({text: "Something went wrong please try again!",icon: 'error'}).then(function() {
        //this.fileReset();
      });
    }
  }

  //Update workstream Name
  updateWorkstreamName(wid,wname){

    if(wid != '' && wname != ""){
        this.updateGrid = true;
        this.workstream = wname;
        this.seltWokstreamName = wname;
        this.selectedRec = wid;
    }
  }

  //Update service Name
  updateServiceName(wid,wname,sid,sname){
    if(sid != '' && sname != ""){
      this.updateServiceGrid = true;
      this.service = sname;
      this.selectedRec = sid;
      this.seltdWorkstream = wid;
      this.seltWokstreamName = wname;
    }
  }

  //Update service Name
  updateSubServiceName(rcid,wid,sid,ssname){
    console.log('Workstream ID -->', wid);
    console.log('Workstream Arry -->', this.workstreams);
    if(wid != "" && sid != '' && ssname != ""){
      //alert(wid)
      this.updatesubServiceGrid = true;
      // this.seltdWorkstream = wid;
      // this.seltdService = sid;
      this.seltWokstreamName = wid;
      this.seltServiceName = sid;
      this.subserviceName = ssname;
      this.selectedRec = rcid;
    }
  }

  //Cancle Update Gid
  updatefrmReset(typ){
    if(typ == 'wm'){
      this.updateGrid = false;
      this.workstream = "";
    }else if(typ == 'sm'){
      this.updateServiceGrid = false;
      this.service = "";
      this.seltdWorkstream = [];
      this.seltWokstreamName = '';
    }else if(typ == 'ssm'){
      this.updatesubServiceGrid = false;
      this.service = "";
      this.subService = "";
      this.subserviceName = "";
      this.seltdWorkstream = [];
      this.seltdService = [];
      this.seltWokstreamName = '';
      this.seltServiceName = '';
    }
  }

  //Update workstream status
  udpateStatus(wid,sts){
    //alert('Wid -->'+ wid+ '  status-->'+ sts)
    this.spinner.show();
      if(wid > 0 && sts !=""){

        if(sts == 'True'){
          var status = '0';
        }else if(sts == 'False'){
          var status = '1';
        }
        //alert('Part 1');

        Swal.fire({
          title: "",
          text : "Do you want to Update Status for this record.?",
          icon: 'warning',
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

            this.Apiservice.get('Masters/UpdateWorkstreamStatus?rid='+wid+'&statusStr='+status+'&userid='+this.userId).subscribe((data: any) => {
              //alert('Part 2');
              this.globalConst.checkOriginAccess(data);

              this.spinner.hide();
              console.log("Update status --->", data);
              if(data == 1){
                Swal.fire({text: "Updated Successfullly!",icon: 'success'}).then(function() {
                  //this.fileReset();
                });
              }else{
                Swal.fire({text: "Update Failed!",icon: 'warning'}).then(function() {
                  //this.fileReset();
                });
              }
              this.spinner.hide();
              this.GetAllMasterInfo();
            });

          } else if (result.isDenied) {
            this.spinner.hide();
            Swal.fire('', 'Changes are not saved', 'info');
          }
        })
      }else{
        this.spinner.hide();
        Swal.fire({text: "Null values!",icon: 'warning'}).then(function() {
          //this.fileReset();
        });

      }
  }


  //Remove Workstream
  deleteWorkstream(wid){
    Swal.fire({
      title: "Do you want to Delete this record.?",
      text : "Note : If you delete this you cann't use any services and sub service under this workstream!",
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

        this.Apiservice.get('Masters/RemoveWorkstreams?rid='+wid+'&userid='+this.userId).subscribe((data: any) => {
          console.log("Delete Rec --->", data);
          this.globalConst.checkOriginAccess(data);

          if(data == 1){
            this.GetAllMasterInfo();
            Swal.fire('Saved!', '', 'success');
          }
        });

      } else if (result.isDenied) {

        Swal.fire('Changes are not saved', '', 'info');
      }
    })
  }

  //Form Resent
  frmReset(){
    this.workstream = "";
  }

  /************************** Service Section **************************************/
  //Form Submition
  frmServiceSubmit(){
     // console.log('Workstream else-->', this.seltdWorkstream.length);
    // return;

    if(this.service != "" && this.seltdWorkstream.length == undefined){

      this.spinner.show();
      this.Apiservice.get('Masters/InsertService?service='+this.service+'&wid='+this.seltdWorkstream+'&userid='+this.userId).subscribe((data: any) => {
        console.log("Bulk Upload --->", data);
        this.globalConst.checkOriginAccess(data);

        this.spinner.hide();
        if(data.length > 0){
            if(data[0].outPutName == 'Success'){
              Swal.fire({text: "Submited Successfullly!",icon: 'success'}).then(function() {});
              this.GetAllMasterInfo();
              this.resetAll();
            }else if(data[0].outPutName == 'Already Exists'){
              Swal.fire({text: this.service+ " Service Already Exists!",icon: 'error'}).then(function() {});
              this.resetAll();
            }
        }else{
          Swal.fire({text: "Something went wrong please try again!",icon: 'warning'}).then(function() {});
          this.resetAll();
        }
      });
    }else{
      Swal.fire({text: "Workstream and Service name are mandatory!",icon: 'warning'}).then(function() {});
      this.resetAll();
    }
  }



  //Form Sub service Submition
  frmServiceSubSubmit(){
  //   console.log('Workstream -->', this.seltdWorkstream)
  // console.log('Service -->', this.seltdService)
  // console.log('Sub s name -->', this.subserviceName)
  // return
   if(this.subserviceName != "" && this.seltdService.length == undefined && this.seltdWorkstream.length == undefined){

     this.spinner.show();
     this.Apiservice.get('Masters/InsertSubService?subservice='+this.subserviceName+'&service='+this.seltdService+'&wid='+this.seltdWorkstream+'&userid='+this.userId).subscribe((data: any) => {
       console.log("Bulk Upload --->", data);
       this.globalConst.checkOriginAccess(data);

       this.spinner.hide();
       if(data.length > 0){
           if(data[0].outPutName == 'Success'){
             Swal.fire({text: "Submited Successfullly!",icon: 'success'}).then(function() {});
             this.GetAllMasterInfo();
             this.resetAll();
           }else if(data[0].outPutName == 'Already Exists'){
             Swal.fire({text: this.subserviceName+ " Service Already Exists!",icon: 'error'}).then(function() {});
             this.resetAll();
           }
       }else{
         Swal.fire({text: "Something went wrong please try again!",icon: 'warning'}).then(function() {});
         this.resetAll();
       }
     });
   }else{
     Swal.fire({text: "Invalid input values!",icon: 'warning'}).then(function() {});
     this.resetAll();
   }
 }


  //Update Service form
  updateServiceSubmit(){
    if(this.selectedRec > 0 && this.updateServiceGrid == true && this.service != '' && this.seltWokstreamName != ''){
      this.Apiservice.get('Masters/UpdateServiceName?wid='+this.seltdWorkstream+'&rid='+this.selectedRec+'&service='+this.service+'&userid='+this.userId).subscribe((data: any) => {
        console.log("Update Workstream --->", data);
        this.globalConst.checkOriginAccess(data);

        this.updatefrmReset('sm');
        this.GetAllMasterInfo();
        if(data == 1){
          Swal.fire({text: "Updated Successfullly!",icon: 'success'}).then(function() {

          });
        }else if(data == 0){
          Swal.fire({text: "Service Already Exists!",icon: 'warning'}).then(function() {
            //this.fileReset();
          });
        }
        this.spinner.hide();
      });
    }else{
      Swal.fire({text: "Workstream and Service Name are mandatory!",icon: 'warning'}).then(function() {
        //this.fileReset();
      });
    }
  }


   //Update Service form
   updateSubServiceSubmit(){
    if(this.selectedRec > 0 && this.updatesubServiceGrid == true && this.subserviceName != ''){
      this.Apiservice.get('Masters/UpdateSubServiceName?rid='+this.selectedRec+'&subservice='+this.subserviceName+'&userid='+this.userId).subscribe((data: any) => {
        console.log("Update Workstream --->", data);
        this.globalConst.checkOriginAccess(data);

        this.updatefrmReset('ssm');
        this.GetAllMasterInfo();
        if(data == 1){
          Swal.fire({text: "Updated Successfullly!",icon: 'success'}).then(function() {

          });
        }else if(data == 0){
          Swal.fire({text: "Service Already Exists!",icon: 'warning'}).then(function() {
            //this.fileReset();
          });
        }
        this.spinner.hide();
      });
    }else{
      Swal.fire({text: "Invalid values!",icon: 'warning'}).then(function() {
        //this.fileReset();
      });
    }
  }

  onActivate(ev){
    alert('Seleted Row --->'+ ev)
  }

  onSelect({ selected }) {
    console.log('Select Event', selected);
    if(selected[0]){
      this.updateServiceStatus(selected[0].sid,selected[0].sm_delete_status);
    }

  }


   //Update Service status
   updateServiceStatus(sid,sts){
  //   alert('Sid -->'+ sid+ '  status-->'+ sts)
  //  return
    this.spinner.show();
      if(sid > 0 && sts != ""){
        if(sts == 'False'){
          var status = '1';
        }else if(sts == 'True'){
          var status = '0';
        }


        Swal.fire({
          title: "",
          text : "Do you want to Update Status for this record.?",
          icon : "warning",
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
            this.Apiservice.get('Masters/UpdateServiceStatus?rid='+sid+'&statusStr='+status+'&userid='+this.userId).subscribe((data: any) => {
              console.log("Service Update status --->", data);
              this.globalConst.checkOriginAccess(data);

              this.spinner.hide();
              if(data == 1){
                Swal.fire({text: "Updated Successfullly!",icon: 'success'}).then(function() {
                  //this.fileReset();
                });
              }else{
                Swal.fire({text: "Update Falied!",icon: 'warning'}).then(function() {
                  //this.fileReset();
                });
              }
              //this.spinner.hide();
              this.GetAllMasterInfo();
            });
          }else if (result.isDenied) {
            this.spinner.hide();
            Swal.fire('', 'Changes are not saved', 'info');
          }
        });

      }else{
        this.spinner.hide();
        Swal.fire({text: "Null values!",icon: 'warning'}).then(function() {
          //this.fileReset();
        });
      }
  }



  //Update Sub Service status
  updateSubServiceStatus(ssid,sts){
    // alert('Sid -->'+ ssid+ '  status-->'+ sts)
    // return

    this.spinner.show();
      if(ssid > 0 && sts != ""){
        if(sts == 'True'){
          var status = '0';
        }else if(sts == 'False'){
          var status = '1';
        }

        Swal.fire({
          title: "",
          text : "Do you want to Update Status for this record.?",
          icon : "warning",
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
            this.Apiservice.get('Masters/UpdateSubServiceStatus?rid='+ssid+'&statusStr='+status+'&userid='+this.userId).subscribe((data: any) => {
              console.log("Service Update status --->", data);
              this.globalConst.checkOriginAccess(data);

              this.spinner.hide();
              if(data == 1){
                Swal.fire({text: "Updated Successfullly!",icon: 'success'}).then(function() {
                  //this.fileReset();
                });
              }else{
                Swal.fire({text: "Update Failed!",icon: 'warning'}).then(function() {
                  //this.fileReset();
                });
              }
              this.spinner.hide();
              this.GetAllMasterInfo();
            });
          }else if (result.isDenied) {
            this.spinner.hide();
            Swal.fire('', 'Changes are not saved', 'info');
          }
        });


      }else{
        this.spinner.hide();
        Swal.fire({text: "Null values!",icon: 'warning'}).then(function() {
          //this.fileReset();
        });
      }
  }

  resetAll()
  {
    this.seltdWorkstream = [];
    this.service =[];
    this.subserviceName =[];
  }
  //Workstream select box
  selectWorkstream(wid){
    //alert(wid)
    var clean = this.services.filter((arr, index, self)  => (wid === arr.wid && arr.wm_delete_status === "True" && arr.sm_delete_status === "True"))
    this.servicesList = [];
    this.servicesList = clean;
    window.scrollBy(0, 100);
  }

  //Filter Workstream
  filterWorkstream(){
    var clean = this.allMasterInfo.filter((arr, index, self)  => (arr.wm_delete_status === "True"))
    this.allMasterInfo = [];
    this.allMasterInfo = clean;
  }

  //Form Resent
  frmServiceReset(){
    this.service = "";
    this.seltdWorkstream = [];
  }

  //Form Resent
  frmServiceSubReset(){
    this.subserviceName = "";
    this.seltdWorkstream = [];
    this.seltdService = [];
  }

  //Delete Service
  deleteService(sid){
    Swal.fire({
      title: "Do you want to Delete this record.?",
      text : "Note : If you delete this you cann't use any sub service under this service!",
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

        this.Apiservice.get('Masters/RemoveService?rid='+sid+'&userid='+this.userId).subscribe((data: any) => {
          console.log("Delete Rec --->", data);
          this.globalConst.checkOriginAccess(data);

          if(data == 1){
            this.GetAllMasterInfo();
            Swal.fire('Saved!', '', 'success');
          }
        });

      } else if (result.isDenied) {

        Swal.fire('Changes are not saved', '', 'info');
      }
    })
  }


  //Delete Sub Service
  deleteSubService(bid){
    Swal.fire({
      title: "Do you want to Delete this record.?",
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

        this.Apiservice.get('Masters/RemoveSubService?rid='+bid+'&userid='+this.userId).subscribe((data: any) => {
          console.log("Delete Rec --->", data);
          this.globalConst.checkOriginAccess(data);

          if(data == 1){
            this.GetAllMasterInfo();
            Swal.fire('Saved!', '', 'success');
          }
        });

      } else if (result.isDenied) {

        Swal.fire('Changes are not saved', '', 'info');
      }
    })
  }




  //Sweet Alert
  swapAlerts(msg,icon){
    return Swal.fire({
        icon: 'warning',title: '',text: msg,
        customClass: {
          confirmButton: 'btn btn-danger',

        },
        buttonsStyling: false
      }).then(function() {
        //this.router.navigate(['/dashboard/dashboard1']);
        //window.location.href = '/dashboard/dashboard1';
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
    XLSX.writeFile(wb, 'BulkWorkAllotment-EntrySampleExcel.xlsx');
  }

  //Page Auth
  getAuth(ulog){
    var userDesg = localStorage.getItem('Role');

    if(userDesg.includes(ulog)){
      return true;
    }else{
      return false;
    }
  }

  //Custome Search for Associtate
  customSearchFn(term: string, item: any) {
    term = term.toLocaleLowerCase();
    return item.w_name.toLocaleLowerCase().indexOf(term) > -1;
  }

  //Custome Search for Associtate
  customSearchFn2(term: string, item: any) {
    term = term.toLocaleLowerCase();
    return item.service_name.toLocaleLowerCase().indexOf(term) > -1;
  }


   //Grid postion
   getTabPos(gpos){
    this.GetAllMasterInfo();
    this.gridPos = gpos;
    this.selectedRec = '';
  }


}
