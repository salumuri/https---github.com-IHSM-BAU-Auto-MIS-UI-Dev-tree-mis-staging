import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators , FormControl} from '@angular/forms';
import { ApiService } from '../../Api/api.service';
import { NgxSpinnerService } from "ngx-spinner";
import Swal from 'sweetalert2';
import { GlobalConstants } from '../../common/global-constants';

@Component({
  selector: 'app-sync',
  templateUrl: './sync.component.html',
  styleUrls: ['./sync.component.scss']
})
export class SyncComponent implements OnInit {

  addpnl:boolean=false;gridPnl:boolean=true;
    GembaListData:any;
    p: number = 1;
    total: number = 0;
    filterTerm:any;
    Report_arry:any={'FromDate':'','ToDate':''}
    generateFm: FormGroup = new FormGroup({
      accMonth: new FormControl(''),
      wsname: new FormControl(''),
      // region: new FormControl(''),
      // service: new FormControl(''),
      // state: new FormControl(''),
      // recdate: new FormControl(''),
    });
    constructor(public globalConst: GlobalConstants,private spinner: NgxSpinnerService,public iservice : ApiService,private fb: FormBuilder) {
    }
    ngOnInit() {
      this.generateFm = this.fb.group({
        e3fromDt: ['', Validators.required],
        e3toDt: ['', Validators.required]
      });
        this.BindGrid();
    }

    swapErrorAlerts(msg){
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

    BindGrid(){
      const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
       let m = new Date();
       let month=monthNames[m.getMonth()]
       let y = new Date().getFullYear().toString();
        this.iservice.get('E3Sync/GetE3SyncData?Month='+month+'&Year='+y).subscribe((data: any) => {
          this.globalConst.checkOriginAccess(data);

          console.log(data);
          this.GembaListData=data
      });
    }
    // getSyncE3Data(FromDate:any,ToDate:any){

    //   this.iservice.get('E3Sync/SyncE3Data?FromDate='+FromDate+'&ToDate='+ToDate)
    // }
    Dumptoe3(FromDate:any,ToDate:any){
      if(FromDate=="")
      {
        alert("Please Select From Date");
      }
      else if(ToDate=="")
      {
        alert("Please Select To Date");
      }
   else
   {
    this.iservice.get('E3Sync/SyncE3Data?FromDate='+FromDate+'&ToDate='+ToDate).subscribe(data => {
        this.globalConst.checkOriginAccess(data);

         console.log(data);
         this.spinner.hide();
         if(data >= 1){
             Swal.fire({
               icon: 'success',title: '',text: 'E3 Sync Successful..!',
               customClass: {
                 confirmButton: 'btn btn-success'
               },
               buttonsStyling: false
             });
             this.BindGrid();
         }else{
           this.swapErrorAlerts('Something went wrong please try again.!');
         }
        });
      }
    }

}
