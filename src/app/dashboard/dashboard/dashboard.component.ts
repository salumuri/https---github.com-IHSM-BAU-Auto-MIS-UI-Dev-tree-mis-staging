import { Component, HostListener, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder }  from '@angular/forms';
import {FormsModule,ReactiveFormsModule} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import * as Chartist from 'chartist';
import { ApiService } from '../../Api/api.service';
import { ChartType, ChartEvent } from "ng-chartist";
import ChartistTooltip from 'chartist-plugin-tooltips-updated';
import { Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import Swal from 'sweetalert2';
import { GlobalConstants } from '../../common/global-constants';

declare var require: any;

const data: any = require('../../shared/data/chartist.json');

export interface Chart {
  type: ChartType;
  data: Chartist.IChartistData;
  options?: any;
  responsiveOptions?: any;
  events?: ChartEvent;
  
  // plugins?: any;

}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit {
  newTaskForm: FormGroup;
  date: '2022-12-12';
  timeSpent: any = 0;
  frequentUrls : any;
  feedbackErrorlist : any = [];
  fbchk = true;
  userType : any = localStorage.getItem('UserType');
  logoClient = 'assets/img/logo-client.png'

  constructor(public globalConst: GlobalConstants,private spinner: NgxSpinnerService, public router: Router, private Apiservice: ApiService, private fb: FormBuilder, private http: HttpClient) {
    this.newTaskForm = fb.group({
      name: ["", Validators.required]
    });
    //alert('Hello Dashboard.!')

    // window.addEventListener("resize", this.displayWindowSize);

    // // Calling the function for the first time
    // this.displayWindowSize();
  }

  ngOnInit():void {
    // this.generateFm = this.fb.group({
    //   receivedfrmdt: ['', Validators.required]
    // });
    var loginfo = localStorage.getItem('CorpId')
    var loclVar = localStorage.getItem('frequentlyUrls');

    this.frequentUrls = JSON.parse(loclVar);
    // if(loginfo == '' || loginfo == null || loginfo == 'null'){
    //   this.router.navigate(['/pages/login']);
    // }


    this.GetTimeSpentCount();
    this.getFeedbackList();
  }

  //Return sort array
  getSortedArray(obj){
   return obj.sort((a, b) => {
      return b.count - a.count;
    });
  }

  //Getting Filter Url
  getProperUrl(url){
      return  this.capitalizeFirstLetter(url.substring(url.lastIndexOf('/') + 1));
  }

  //Capital letter
  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  //Redirect URL
  redirectUrl(url){
    this.router.navigateByUrl(url);
  }

  onResized(event: any) {
    setTimeout(() => {
      this.fireRefreshEventOnWindow();
    }, 300);
  }

  fireRefreshEventOnWindow = function () {
    var evt = document.createEvent("HTMLEvents");
    evt.initEvent("resize", true, false);
    window.dispatchEvent(evt);
  };


  empId = localStorage.getItem("LoginId");
  GetTimeSpentCount() {
    this.spinner.show();
    this.Apiservice.get('WorkAllotment/GetTimeSpentCount?userID=' + this.empId).subscribe((data: any) => {
      console.log('Resp -->', data)
      this.globalConst.checkOriginAccess(data);

      this.spinner.hide();
      if(data[0] || data.length > 0){
        this.timeSpent = data[0].Time_Spent;
      }
    });
  }

  //Getting Feedback Count
  getFeedbackList(){
    this.spinner.show();
    this.Apiservice.get('Feedback/GetFeedbackDetailsList?login_ID='+this.empId).subscribe((data: any) => {
      console.log('Feedback List -->',data);
      this.globalConst.checkOriginAccess(data);

      this.spinner.hide();
      this.feedbackErrorlist = data;
    });
  }


  @HostListener('window:resize', ['$event'])
  onWindowResize(event) {
     this.displayWindowSize();
  }


  displayWindowSize(){
    // Get width and height of the window excluding scrollbars

    var w = document.documentElement.clientWidth;
    var h = document.documentElement.clientHeight;
    console.log('WIdth :', w , " Height :", h);
    document.body.classList.remove('vertical-menu');
    document.body.classList.remove('menu-expanded');
    document.body.classList.remove('menu-open');
    document.body.classList.add('menu-hide');

    // Display result inside a div element
   // document.getElementById("result").innerHTML = "Width: " + w + ", " + "Height: " + h;
}
}
