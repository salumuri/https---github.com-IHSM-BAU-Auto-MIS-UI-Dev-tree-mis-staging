import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Api/api.service';
import { NgxSpinnerService } from "ngx-spinner";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { ClientViewFeedbackListComponent } from "../../modals/client-view-feedback-list/client-view-feedback-list.component";
import { GlobalConstants } from '../../common/global-constants';

@Component({
  selector: 'app-view-feedback',
  templateUrl: './view-feedback.component.html',
  styleUrls: ['./view-feedback.component.scss']
})
export class ViewFeedbackComponent implements OnInit {
  workstreamData : any;
  showTbl : any = false;
  selectedWrksteam : any;public minDate : any;
  p : any = 1;


  stSearchFm: FormGroup = new FormGroup({
    ftyle : new FormControl(''),
    wsname: new FormControl(''),
    ffrom: new FormControl(''),
    fduration: new FormControl(''),
    fromdt: new FormControl(''),
    todt: new FormControl('')

  });

  fdfromnames : any = [];
  durations    : any = [];
  feedbackData : any = [];
  feedbackDataExport : any = [];
  subAction : any = false;



  constructor(public globalConst: GlobalConstants,private fb: FormBuilder,private http: HttpClient,private modalService: NgbModal,private spinner: NgxSpinnerService,public router : Router,private Apiservice: ApiService) {
    const current = new Date();
    this.minDate = {
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      day: current.getDate()
    };

  }

  ngOnInit(): void {
    this.stSearchFm = this.fb.group({
      wsname: [''],
      ftyle : ['CFB', Validators.required],
      ffrom : [''],
      fduration : [''],
      fromdt: [''],
      todt: ['']
    });
    //alert('Hello')
    this.GetWorkstream();
    this.firstFeedbackData();
  }

  // fromValidate(){
  //   var formObj = this.stSearchFm.value;
  //   console.log(formObj.fromdt, formObj.todt)
  //   if (formObj.fromdt.year > formObj.todt.year)
  //   {
  //     alert('1')
  //     this.spinner.hide();
  //           Swal.fire({text: "Please check the From Date!",icon: 'error'}).then(function() {
  //           });
  //   }
  //   else if(formObj.fromdt.month > formObj.todt.month)
  //   {
  //     alert('2')
  //     this.spinner.hide();
  //     Swal.fire({text:todt "Please check the From Date!",icon: 'error'}).then(function() {
  //     });
  //   }
  //   else if(formObj.fromdt.day > formObj.todt.day && formObj.fromdt.month >= formObj.todt.month)
  //   {
  //     alert('3')
  //     this.spinner.hide();
  //     Swal.fire({text: "Please check the From Date!",icon: 'error'}).then(function() {
  //     });
  //   }
  // }


  dateValidate(){
    var formObj = this.stSearchFm.value;
    console.log(formObj.fromdt, formObj.todt)
    if (formObj.fromdt.year > formObj.todt.year)
    {
      this.spinner.hide();
            Swal.fire({text: "Please check the Date!",icon: 'error'}).then(function() {
            });
    }
    else if(formObj.fromdt.month > formObj.todt.month)
    {
      this.spinner.hide();
      Swal.fire({text: "Please check the Date!",icon: 'error'}).then(function() {
      });
    }
    else if(formObj.fromdt.day > formObj.todt.day && formObj.fromdt.month >= formObj.todt.month)
    {
      this.spinner.hide();
      Swal.fire({text: "Please check the Date!",icon: 'error'}).then(function() {
      });
    }
  }


      //Workstream
      GetWorkstream() {
      this.Apiservice.get('WorkAllotment/GetAllWorkstream').subscribe((data: any) => {
      console.log('All Workstreams-->', data);
      this.globalConst.checkOriginAccess(data);
      this.workstreamData = data;
      this.getFeedbackNames();
    });
  }



    getInfo(){
      if (this.stSearchFm.invalid) {
        Swal.fire({text: "Please select all mandatory fileds.!",icon: 'warning'}).then(function() {
          //this.fileReset();
        });
        return;
      }

      this.showTbl = true;
    }


    //Workstream
    getFeedbackNames() {
      this.spinner.show();
      // this.workstreamData = JSON.parse(localStorage.getItem('WorkStreams'));
      let id=localStorage.getItem('LoginId');
      let wid = this.stSearchFm.get('wsname').value

      var splObj = wid.split('-');
      this.selectedWrksteam = splObj;

      this.Apiservice.get('ClientBasic/GetSMENames?wid=' + splObj[0]).subscribe((data: any) => {
          console.log('Getting Data -->',data);
          this.globalConst.checkOriginAccess(data);
          this.fdfromnames = data;
          this.spinner.hide();
      });
    }

    //Getting Duration
    getDuration(){
      this.Apiservice.get('ClientBasic/GetDuration').subscribe((data: any) => {
        console.log('Getting Duration -->',data);
        this.globalConst.checkOriginAccess(data);

        this.durations = data;
        this.spinner.hide();
      });
    }

    firstFeedbackData(){
      this.spinner.show();
      this.Apiservice.get('ClientBasic/GetViewFeedback?given_id='+''+'&wid='+''+'&type='+'CFB'+'&fromdate='+''+'&todate='+''+'&fdate='+''+'&tdate='+'').subscribe((data: any) => {
        //this.Apiservice.get('ClientBasic/GetViewFeedback?given_id='+formObj.ffrom.toString()+'&wid='+formObj.wsname.toString()+'&type='+formObj.ftyle.toString()+'&fromdate=2023-02-27&todate=2023-03-03').subscribe((data: any) => {

          console.log('Feedback Data -->',data);
          this.globalConst.checkOriginAccess(data);

          this.feedbackData = data;
          this.spinner.hide();
          this.subAction = true;
        });

        this.Apiservice.get('ClientBasic/GetViewFeedbackExport?given_id='+''+'&wid='+''+'&type='+'CFB'+'&fromdate='+''+'&todate='+''+'&fdate='+''+'&tdate='+'').subscribe((data: any) => {         
   
            this.feedbackDataExport = data;
            
          });
    }

    //Getting Feedback
    getFeedbackData(){
      this.spinner.show();

      var formObj = this.stSearchFm.value;
      console.log('Form Values  -->', formObj);
      var dtSplit = formObj.fduration.split('--');
      console.log('Form Values  2-->', dtSplit);
      var frmDt = this.formatDate(dtSplit[0]).toString();
      var toDt = this.formatDate(dtSplit[1]).toString();

      let frmDate : any = '';
      let toDate : any = '';
      if(formObj.fromdt != ''){
        var fdt = formObj.fromdt.year +'-'+ formObj.fromdt.month +'-'+ formObj.fromdt.day
        frmDate = new Date(fdt);
        //frmDate = frmObj.fromdt;
        frmDate = (frmDate != '' ? this.formatDate2(frmDate) : '');
      }
      if(formObj.todt != ''){
        var tdt = formObj.todt.year +'-'+ formObj.todt.month +'-'+ formObj.todt.day
        toDate =  new Date(tdt);
        toDate = (toDate != '' ? this.formatDate2(toDate) : '');
        //toDate = frmObj.shipmentdt
      }

      console.log('From Date -->', frmDate);
      console.log('From To -->', toDate);

      this.Apiservice.get('ClientBasic/GetViewFeedback?given_id='+formObj.ffrom.toString()+
      '&wid='+this.selectedWrksteam[0].toString()+'&type='+formObj.ftyle.toString()+'&fromdate='+''+'&todate='+''+
      '&fdate='+frmDate+'&tdate='+toDate).subscribe((data: any) => {
      //this.Apiservice.get('ClientBasic/GetViewFeedback?given_id='+formObj.ffrom.toString()+'&wid='+formObj.wsname.toString()+'&type='+formObj.ftyle.toString()+'&fromdate=2023-02-27&todate=2023-03-03').subscribe((data: any) => {
        this.spinner.hide();
        console.log('Feedback Data -->',data);
        this.globalConst.checkOriginAccess(data);

        this.feedbackData = data;
        this.subAction = true;
      });

      this.Apiservice.get('ClientBasic/GetViewFeedbackExport?given_id='+formObj.ffrom.toString()+
      '&wid='+this.selectedWrksteam[0].toString()+'&type='+formObj.ftyle.toString()+'&fromdate='+''+'&todate='+''+
      '&fdate='+frmDate+'&tdate='+toDate).subscribe((data: any) => {
      
        
        this.feedbackDataExport = data;
        
      });


    }




    formatDate2(date) {
      var year = date.getFullYear().toString();
      var month = (date.getMonth() + 101).toString().substring(1);
      var day = (date.getDate() + 100).toString().substring(1);
      return year + "-" + month + "-" + day;
    }

    formatDate(date) {
      var d = new Date(date),
          month = '' + (d.getMonth() + 1),
          day = '' + d.getDate(),
          year = d.getFullYear();

      if (month.length < 2)
          month = '0' + month;
      if (day.length < 2)
          day = '0' + day;

      return [year, month, day].join('-');
  }

  //Feedback Errors List Details
   openFeedbackErrorsModal(rowdt,ind){
    // this.getSteps(rowdt.workstream,rowdt.service);
    const modalRef = this.modalService.open(ClientViewFeedbackListComponent,
    {
      scrollable: true,windowClass: 'myCustomModalClass',size : 'lg'
    },);

    var formObj = this.stSearchFm.value;
    var wstream = formObj.wsname.split('-')
    var obj = {
      'rowdt' : rowdt,
      'wstream' : wstream[0],
    }

    modalRef.componentInstance.fromParent = obj;
    modalRef.result.then((result) => {
      console.log('Model Result --->', result)

    });
  }

  //Excel Export
  exportExl(fname){
   // this.globalConst.exportexcel(fname);
   this.globalConst.exportArrayToExcel(this.feedbackDataExport, fname);
  }
}
