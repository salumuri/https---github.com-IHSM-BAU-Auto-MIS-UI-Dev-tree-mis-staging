import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Api/api.service';
import { NgxSpinnerService } from "ngx-spinner";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { GlobalConstants } from '../../common/global-constants';


@Component({
  selector: 'app-feedback-entry',
  templateUrl: './feedback-entry.component.html',
  styleUrls: ['./feedback-entry.component.scss']
})
export class FeedbackEntryComponent implements OnInit {

  workstreamData : any;
  walotServices : any;
  showTbl : any = false;
  fdfromnames : any = [];
  durations : any = [];
  workstreamDt : any;
  allworkstreamData : any = [];
  logInfo  : any;
  defalutwid : any = 0;
  reqVal: any = 0;
  reqobj: any = [];
  selectUser : any = {
    emp_no : '',
    emp_name : ''
  };

  rating2 : any = [
    {title : '7 - Always', rvalue : '7'},
    {title : '6', rvalue : '6'},
    {title : '5', rvalue : '5'},
    {title : '4', rvalue : '4'},
    {title : '3', rvalue : '3'},
    {title : '2', rvalue : '2'},
    {title : '1 - Very Poor', rvalue : '1'}
  ]

  rating : any = [
    {title : '7 - Delighted', rvalue : '7'},
    {title : '6 - Very Good', rvalue : '6'},
    {title : '5 - Good', rvalue : '5'},
    {title : '4 - Average', rvalue : '4'},
    {title : '3 - Poor', rvalue : '3'},
    {title : '2 - Very Poor', rvalue : '2'},
    {title : '1 - UnAcceptable', rvalue : '1'},
  ]

  rating5 : any = [
    {title : 'Yes', rvalue : 'Yes'},
    {title : 'No', rvalue : 'No'}
  ]


  feedbacktable : any;
  objectKeys = Object.keys;

  stSearchFm: FormGroup = new FormGroup({
    ftyle : new FormControl(''),
    wsname: new FormControl(''),
    service: new FormControl(''),
    ffrom : new FormControl(''),
    fduration : new FormControl('')
  });

  public selectFrom : any;

  constructor(public globalConst: GlobalConstants,private fb: FormBuilder,private http: HttpClient,private modalService: NgbModal,private spinner: NgxSpinnerService,public router : Router,private Apiservice: ApiService) {
    this.logInfo = JSON.parse(localStorage.getItem('UserCientInfo'));
    this.fdfromnames = { emp_no : this.logInfo.emp_no, emp_name : this.logInfo.emp_name}
  }

  ngOnInit(): void {
    this.reqobj[0] = 0;
     this.reqVal = 0;
    this.stSearchFm = this.fb.group({
      ftyle : ['', Validators.required],
      wsname: ['', Validators.required],
      service: ['All', Validators.required],
      //ffrom : ['', Validators.required],
      fduration : ['', Validators.required]
    });

    //this.getWorkstreams();
    this.GetWorkstream();
    this.getFeedbackNames();
    this.getTable();
    this.getDuration();

    console.log('Log Info : ', this.logInfo);
    this.showTbl = true;
  }
 //
 cangeOption(rowVal,ind){
 
  var indid = "gvFeedbacks_ctl02_txtComments"+ind;
  var ind : any  = document.getElementById(indid);
  if(rowVal <= 5){
    ind.style.borderColor = "red";
   
  }else{

    ind.style.borderColor = "black";
  }
}

noEmptyComment(rowVal,ind){
  var indid = "gvFeedbacks_ctl02_txtComments"+ind;
  var ind : any  = document.getElementById(indid);
  console.log('Key Value ==>', ind.value)
  if(rowVal <= 5 && ind.value != ''){
    ind.style.borderColor = "black";
  }else if(rowVal <= 5 && ind.value == ''){
    ind.style.borderColor = "red";
  }
}

  //t
  checkValidation(){
    
    var cnt = 0;
    console.log(this.feedbacktable);
    this.feedbacktable.forEach((i,ind) => {
      console.log('feedback_rating : ', i.feedback_rating)
      console.log('feedback_rating 2: ', i.feedback_comments)
      if(i.feedback_rating == '' && i.feedback_rating != undefined && i.feedback_rating <= 5 || (i.feedback_comments == '' && i.feedback_rating <=5)){
        
          cnt = cnt + 1;
          Swal.fire({text: "Please select all ratings and provide comments if rating is <= 5",icon: 'warning'}).then(function() {
           //this.fileReset();
           //alert('Hello i am ok...')
          });
          return;
      }
      if(this.feedbacktable.length == ind+1){
        if(cnt == 0){
          this.submitFeedback();
        }
      }
    });
  }
 // Set Validation
 changeVal(rval,ind){
  console.log('Selected val : ', rval);
  console.log('Ind val :', ind);
  var indxid = 'gvFeedbacks_ctl02_txtComments'+ind;
  console.log('ID :', indxid);
  var cmt = document.getElementById(indxid);
      if(rval <= 3){
        //cmt.setAttribute('required','required');
        document.getElementById(indxid).attributes["required"] = true;  
      }else{
        document.getElementById(indxid).attributes["required"] = false;  
      }

  //gvFeedbacks_ctl02_txtComments
 }
  getTable(){
    this.feedbacktable = [
      {
       feedback_id : 1,
       feedback_desp : "ADHERENCE TO SCHEDULES :- Work product delivered according to contractual schedule, or negotiated alternative.",
       feedback_rating : '',
       feedback_comments : ''
      },
      {
        feedback_id : 2,
        feedback_desp : "QUALITY :- Work product meets or exceeds acceptance criteria.",
        feedback_rating : '',
        feedback_comments : ''
       },
       {
        feedback_id : 3,
        feedback_desp : "COMPETENCY :- Project team exhibits technical skill level adequate for the product or service and capable of suggesting alternate solutions or value additions.",
        feedback_rating : '',
        feedback_comments : ''
       },
       {
        feedback_id : 4,
        feedback_desp : "SERVICE :- Project team provides timely, consistent and proactive communication.(Tracking, prioritization, resolution cycle time, corrective and preventive actions taken to eliminate future occurrences, customer feedbacks for improvement and their implementation)",
        feedback_rating : '',
        feedback_comments : ''
       },
       {
        feedback_id : 5,
        feedback_desp : "IMPACT OF OUR SERVICES ON YOUR CUSTOMERS :- Has the work helped you meet the requirements of your own customers?",
        feedback_rating : '',
        feedback_comments : ''
       },
       {
        feedback_id : 6,
        feedback_desp : "CUSTOMER'S OVERALL RATING :- Overall rating regarding Cyient’s effectiveness in delivering work product or service.",
        feedback_rating : '',
        feedback_comments : ''
       },
       {
        feedback_id : 7,
        feedback_desp : "Specific Comments:",
        feedback_comments : ''
       }
  ]

  }


  //Workstream
  getWorkstreams() {
    this.Apiservice.get('WorkAllotment/GetAllWorkstream').subscribe((data: any) => {
      console.log('All Workstreams-->', data);
      this.globalConst.checkOriginAccess(data);
      this.allworkstreamData = data;
      this.getFeedbackNames();
    });
  }


    //Workstream
    GetWorkstream() {
      this.spinner.show();
      // this.workstreamData = JSON.parse(localStorage.getItem('WorkStreams'));
      var id=localStorage.getItem('LoginId');
      if(id == 'undefined'){
        id = 'null'
      }
      this.Apiservice.get('WorkAllotment/GetWorkStreamClient?wid=' + this.logInfo.id).subscribe((data: any) => {
          console.log('User WOrkstream-->', data);
          this.globalConst.checkOriginAccess(data);
          this.allworkstreamData = data;
          var defalutWs = data.findIndex(x => function(){
           return x.w_name = this.logInfo.WorkStream;
          } )
          console.log('Defalut : ', defalutWs);
          this.defalutwid = data[defalutWs].wid;
          this.stSearchFm.controls['wsname'].setValue(data[defalutWs].wid);

          let wid = this.stSearchFm.get('wsname').value;
          if(wid != '' || wid != null){
            this.getServiceslist(wid);
          }

          this.getFeedbackNames();
          this.spinner.hide();
      });

    }



    //Service List
  getServiceslist(typ){
    this.spinner.show();
    // let wid = this.stSearchFm.get('wsname').value;
    // var splitstr = wid.split('-');

    this.Apiservice.get('WorkAllotment/GetAreaListClient?wid=' + typ).subscribe((data: any) => {
      //console.log('Services-->',data);
      this.globalConst.checkOriginAccess(data);

      this.walotServices = data;
     // this.getUserWiseSteps();
     this.stSearchFm.controls['service'].setValue('All');
     this.spinner.hide();
    });
    this.spinner.hide();
  }


    //Workstream
    getFeedbackNames() {
      this.spinner.show();
      // this.workstreamData = JSON.parse(localStorage.getItem('WorkStreams'));
      let id=localStorage.getItem('LoginId');
      let wid = this.stSearchFm.get('wsname').value;
      console.log('Selected Worksteam :', wid)
      this.getServiceslist(wid);

      //this.Apiservice.get('ClientBasic/GetSMENames?wid=' + wid).subscribe((data: any) => {
      this.Apiservice.get('ClientBasic/GetSMENames?wid='+wid).subscribe((data: any) => {
          console.log('Getting Emp Data -->',data);
          this.globalConst.checkOriginAccess(data);
          //this.stSearchFm.controls['wsname'].setValue('All');
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
        console.log('Check Emp frm NAme --->', this.fdfromnames);
        // this.stSearchFm = this.fb.group({
        //   wsname: [this.workstreamData?.wid, Validators.required],
        //   service: ['', Validators.required],
        //   ftyle : ['CFB', Validators.required],
        //   ffrom : ['', Validators.required],
        //   fduration : [this.durations[0]?.duration, Validators.required]
        // });
        this.stSearchFm.controls['ftyle'].setValue("CFB");
        this.stSearchFm.controls['fduration'].setValue(this.durations[0]?.duration);
        this.spinner.hide();
      });
    }

    selectedUser(ev){
      var selectedVal = this.stSearchFm.get('ffrom').value;
      selectedVal = selectedVal.split('-');
      this.selectUser.emp_no = selectedVal[0];
      this.selectUser.emp_name = selectedVal[1];
    }


    onSubmit() {

    }


  getInfo(){
    if (this.stSearchFm.invalid) {
      Swal.fire({text: "Please select all mandatory fileds.!",icon: 'warning'}).then(function() {
        //this.fileReset();
      });
      return;
    }

    this.showTbl = true;

    this.spinner.show();

    var formObj = this.stSearchFm.value;
    console.log('Form Values  -->', formObj);
    var dtSplit = formObj.fduration.split('--');
    console.log('Form Values  2-->', dtSplit);
    var frmDt = this.formatDate(dtSplit[0]).toString();
    var toDt = this.formatDate(dtSplit[1]).toString();

    this.spinner.hide();
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

  cancelForm(){
    this.stSearchFm = this.fb.group({
      wsname: ['', Validators.required],
      service: ['', Validators.required],
      ftyle : ['', Validators.required],
      ffrom : ['', Validators.required],
      fduration : ['', Validators.required]
    });
  }


  submitFeedback(){
    console.log('Feedback From --->', this.feedbacktable);
    var formObj = this.stSearchFm.value;
    console.log('Form Values  -->', formObj);

    this.spinner.show();
    if (this.stSearchFm.invalid) {
      Swal.fire({text: "Please select to all mandatory fields!",icon: 'error'});
      this.spinner.hide();
      return;
    }


    var dtSplit = this.durations[0]?.duration.split('--');
    console.log('Form Values  2-->', dtSplit);
    var frmDt = this.formatDate(dtSplit[0]).toString();
    var toDt = this.formatDate(dtSplit[1]).toString();

    var finalObj = {
      "feedbacksList" : [],
      "loginId" : localStorage.getItem('LoginId')
    };

    var cnt = 0;
    let wid = this.stSearchFm.get('wsname').value;
    if(this.feedbacktable.length > 0){
        this.feedbacktable.reverse();
        this.feedbacktable.forEach((x,ind) => {
          let wid = this.stSearchFm.get('wsname').value;
          // var splitstr = wid.split('-');

          var cdt = new Date()
            if(x.feedback_rating != '' && x.feedback_rating != undefined){

                var copyObj = {
                  "feedbacktype": formObj.ftyle,
                  "workstream": Number(wid),
                  "givenbyname": this.logInfo?.emp_name,
                  "givenbyid": this.logInfo?.emp_no,
                  "givenDate": this.formatDate(cdt)+' 00:00:00.000',
                  "fDate": frmDt,
                  "tDate": toDt,
                  "service": formObj.service,
                  "FB_Id": x.feedback_id,
                  "rating":x.feedback_rating,
                  "comments":x.feedback_comments
              }

              finalObj.feedbacksList.push(copyObj);

              cnt = cnt +1
            }else if(x.feedback_rating == undefined && x.feedback_comments != ''){
              var copyObj2 = {
                "feedbacktype": formObj.ftyle,
                "workstream": Number(wid),
                "givenbyname": this.logInfo?.emp_name,
                "givenbyid": this.logInfo?.emp_no,
                "givenDate": this.formatDate(cdt)+' 00:00:00.000',
                "fDate": frmDt,
                "tDate": toDt,
                "service": formObj.service,
                "FB_Id": x.feedback_id,
                "rating": '',
                "comments":x.feedback_comments
              }

              finalObj.feedbacksList.push(copyObj2);

              cnt = cnt +1
            }
        });
    }

    if(cnt > 0){
      console.log('Final Obj -->', finalObj)
      //return
      this.Apiservice.postmethod('ClientBasic/BulkSaveClientFeedbacks',finalObj).subscribe((data: any) => {
        //this.Apiservice.get('ClientBasic/GetViewFeedback?given_id='+formObj.ffrom.toString()+'&wid='+formObj.wsname.toString()+'&type='+formObj.ftyle.toString()+'&fromdate=2023-02-27&todate=2023-03-03').subscribe((data: any) => {
        this.globalConst.checkOriginAccess(data);
        this.stSearchFm.controls['wsname'].setValue(this.defalutwid);
        this.stSearchFm.controls['service'].setValue('All');
        this.spinner.hide();
          this.getTable();
          console.log('Feedback Resp -->',data);
          if(data.length > 0){
            var htmlbody = `<h6>Below Feedback details are already Updated.!</h6><br>
              <center>
              <table  id="table" border=1 class="table m-0 custmTbl" style="font-size:9px;font-weight:bold">
              <thead class="thead-dark">
                  <tr>
                      <th>Feedback Given</th>
                      <th>Feedback Type</th>
                      <th>Workstream</th>
                      <th>Service</th>
                      <th>Date</th>
                  </tr>
              </thead>
              <tbody>`;
             for(var x=0; x < data.length; x++){
              console.log('Dt --->', data[x]?.map);
              htmlbody = htmlbody + `<tr>`
                      +`<td>`+data[x]?.givenbyname+`</td>`
                      +`<td>`+data[x]?.feedbacktype +`</td>`
                      +`<td>`+data[x]?.workstream+`</td>`
                      +`<td>`+data[x]?.service+`</td>`
                      +`<td>`+data[x]?.givenDate+`</td>`
                  +`</tr>`
                }
              htmlbody = htmlbody + `</tbody>
              </table>
              </center>`;
                this.spinner.hide();
                Swal.fire({html : htmlbody,text: "Insertion Failed !",icon: 'warning',width: '1000px'});
          }else{
            Swal.fire({text: "Submited Successfullly!",icon: 'success'}).then(function() {
              //this.fileReset();
            });
          }
        });
    }else{
      this.spinner.hide();
      this.getTable();
      Swal.fire({text: "Please select atleast one rating!",icon: 'warning'}).then(function() {
        //this.fileReset();
      });
    }

  }
}
