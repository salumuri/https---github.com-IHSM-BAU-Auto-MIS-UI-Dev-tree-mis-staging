import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../Api/api.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { GlobalConstants } from '../../common/global-constants';

@Component({
  selector: 'app-realization',
  templateUrl: './realization.component.html',
  styleUrls: ['./realization.component.scss']
})
export class RealizationComponent implements OnInit {
  projectionReport : any;
  otherInfos : any = [];
  proMontlyCreate : any = false;
  projectionDetails : any = [];
  selectedMonth : any = '';
  constructor(public globalConst: GlobalConstants,private spinner: NgxSpinnerService, public router: Router, private Apiservice: ApiService, private fb: FormBuilder, private http: HttpClient) {
    var d = new Date();
    var dt = d.getFullYear()
    var m = d.getMonth()+1;

    this.selectedMonth = dt+'-'+m;
  }

  ngOnInit(): void {
    //console.log('Projections Json Data-- >', projectionsJson)
    // var jsonObj = projectionsJson;
    // localStorage.setItem('projectionObj', JSON.stringify(jsonObj));
    var montsDt = [];
    this.Apiservice.get('Projections/GetProandRelizMonthsData?selYear=2023&pageType=Realization').subscribe((data: any) => {
      console.log('Months Data Details --->', data);
      this.globalConst.checkOriginAccess(data);

      montsDt = data;
      this.gettingProjectionDetails(montsDt);
      this.getProjectionsData();
    });

  }

  gettingProjectionDetails(montsDt){
    this.spinner.show();
    var fromdt = '';
    var todt = '';
    var mrslt = montsDt[0].months.split(',')

    console.log('FInal Monts-->', mrslt);

    if(mrslt.length > 0){

      if(mrslt.length == 1){
        fromdt = mrslt[0];
      }else if(mrslt.length > 1){
        fromdt = mrslt[0].trim();
        todt = mrslt[mrslt.length - 1].trim();
      }

      this.Apiservice.get('Projections/GetRealizationDetails?FromMonth='+fromdt+'&ToMonth='+todt+'&Year=2023').subscribe((data: any) => {
        console.log('Realization Details --->', data);
        this.globalConst.checkOriginAccess(data);

        this.projectionDetails = data;
        this.spinner.hide()
      });
    }

  }

  //Add New Projections
  addProjection(){
    this.proMontlyCreate = !this.proMontlyCreate;
  }

  //Getting background color
  getColor(typ){
    //console.log('Sub service -->', typ)
      if(typ == 'Blank'){
        return '#E0E0E0'
      }else if(typ == 'Credit Reductions'){
        return '#fa5050'
      }else if(typ == 'Gain Sharing'){
        return '#fcc492'
      }else if(typ == 'Delta Billing'){
        return '#f06e7d'
      }else if(typ == 'Subtotal - ENERGY' || typ== 'Subtotal - Non-ENERGY' || typ == 'Subtotal - NA Logs & Formation Tops'){
        return '#cfaed1'
      }

  }

  //Getting selected month year
  getProDate(selDt,ev){
    var reslt = selDt.split('-');
  }

  //Getting current month and year
  getCurrMonth(){
    // return moment().format("MMM-YY");
  }

  //Get Month name
  getMonthName(monthNumber) {
    const date = new Date();
    date.setMonth(monthNumber -1);
    return date.toLocaleString('en-US', { month: 'long' });
  }

  //Inserting Projection Data
  insertProjection(){
    this.spinner.show();
    console.log('Final Projections Data --->', this.projectionReport);
    var reslt = this.selectedMonth.split('-');
    var reslt2 = reslt[1]+'/'+reslt[0];
    var userId = localStorage.getItem('LoginId');
    var smonth = this.getMonthName(reslt[1]);
    var syear  = reslt[0]

    var fobj = [];
    this.projectionReport.forEach(x => {
      //console.log("every Single row -->", x);
      var singleObj = {
        "cyient_owner" : (x['Cyient Owner'] ? x['Cyient Owner'] : 'Blank'),
        "po"           : '',
        "spgi_owner"   : (x['SPGI Owner'] ? x['SPGI Owner'] : 'Blank'),
        "ws"           : (x['WS'] ? x['WS'] : 'Blank'),
        "actual_value" : x['actual_value'],
        "breakpoint"   : (x['breakpoint'] == "True" ? '1' : '0'),
        "ind"          : x['ind'],
        "month"        : x['month'],
        "service"      : x['service'],
        "sub_service"  : (x['sub_service'] != '' ? x['sub_service'] : 'Blank'),
        "sub_stream"   : x['sub_stream'],
        "unit_rate"    : x['unit_rate'],
        "uom"          : x['umo'],
        "volumne_cost" : (x['volumne_cost'] != '' ? x['volumne_cost'] : 'Blank'),
        "workstream"   : x['workstream'],
        "year"         : x['year']
      }
      fobj.push(singleObj);
    });

    var postObj = {
      "proObj"    : fobj,
      "monthYear" : reslt2,
      "month"     : smonth,
      "year"      : syear,
      "accocId"   : userId.toString()
    }

    console.log('Resp :', postObj);
    //return;
    this.Apiservice.postmethod('Projections/InsertMonthlyRealization', postObj).subscribe((data:any)=>{
      console.log('Time entry Resp-->', data);
      this.globalConst.checkOriginAccess(data);

      if(data.length == 0){
        this.swapAlerts('Projections Updated successfully.!', 'success');
        this.spinner.hide();
      }else if(data.length > 0){
        var er=''
        if(data[0].errorType == 'Duplicate'){
          er = 'Found duplicates, Given month data already exists.!';
        }else{
          er = 'Somthing went wrong please try again.!';
        }
        this.swapAlerts( er , 'error');
        this.spinner.hide();
      }
    });
  }


  //Sweet Alert
  swapAlerts(msg,icn){
    return Swal.fire({
       icon:  icn,title: '',text: msg,
       customClass: {
         confirmButton: 'btn btn-danger',
       },
       buttonsStyling: false
     }).then(function() {
        return false;
     });
   }


  //Getting projection data
  getProjectionsData(){
    this.spinner.show();
    var userId = localStorage.getItem('LoginId');
    var lobj = localStorage.getItem('projectionObj');

        if(lobj && lobj !=null && lobj.length > 0){
          lobj = JSON.parse(lobj);
          console.log('Localstorage Obj-->',lobj);
          this.projectionReport = lobj;
          var inObj = [];
          var uspbill;
          var usprev;
          var engMdRev;
          var desktop;


    //   this.projectionReport[341].unit_rate_fte = {
    //     "Legal description IDs Threshold": ">20",
    //     "Unit Price": " $8.75 "
    // }

    //   this.projectionReport[265].unit_rate_fte = {
    //     "UOM": " New Instrument ",
    //     "Unit Cost": "$0.55"
    // }

    //   this.projectionReport[266].unit_rate_fte =  {
    //     "UOM": " New Instrument ",
    //     "Unit Cost": "$1.24"
    // }

    //   this.projectionReport[267].unit_rate_fte =  {
    //     "UOM": " New Instrument ",
    //     "Unit Cost": "$0.96"
    // }


      //   this.projectionReport[282].unit_rate_fte =  {
      //     "1FTE": "$2,385",
      //     ">10FTE": "$2,385",
      //     ">50FTE": "$2,281",
      //     ">60FTE": "$2,281",
      //     ">150FTE": "$2,074"
      // }

    // this.projectionReport[378].unit_rate = 95.00;
    // this.projectionReport[379].unit_rate = 64.00;
    // this.projectionReport[380].unit_rate = 21.00;
    // this.projectionReport[381].unit_rate = 95.00;
    // this.projectionReport[382].unit_rate = 64.00;
    // this.projectionReport[383].unit_rate = 21.00;

    // this.projectionReport[405].unit_rate = 0.15;

    // this.projectionReport[408].unit_rate = 0.057;

    // this.projectionReport[411].unit_rate = 5.45;

    // this.projectionReport[414].unit_rate = 2.17;
    // this.projectionReport[245].actual_value = 0;
    // localStorage.setItem('projectionObj', JSON.stringify(this.projectionReport));
  //   this.projectionReport[254].unit_rate_fte = {
  //     "Per Scaling": "$1.43"
  // }
  // localStorage.setItem('projectionObj', JSON.stringify(this.projectionReport));
  // return false

          this.projectionReport[168].actual_value = 0;
          this.projectionReport[198].actual_value = 0;
          this.projectionReport[246].actual_value = 0;
          this.projectionReport[288].actual_value = 0;
          this.projectionReport[375].actual_value = 0;
          this.projectionReport[392].actual_value = 0;
          this.projectionReport[284].actual_value = 0;

          this.projectionReport[422].actual_value = 0;
          this.projectionReport[424].actual_value = 0;
          this.projectionReport[426].actual_value = 0;
          this.projectionReport[428].actual_value = 0;

          this.projectionReport.forEach((x,ind)=> {

            x.ind = ind;

            if(x.workstream != 'Blank' && x.sub_stream != 'Blank' && x.service !='Blank'){
              inObj.push(x);
            }

            if(x.workstream == 'Blank' && x.sub_stream == 'Blank' && x.service =='Blank'){


              if(inObj.length > 0){
                if(inObj[0]?.sub_service == 'Management Services Fee Resource-Based'){
                  this.projectionReport[inObj[0].ind].actual_value = this.projectionReport[inObj[0].ind].unit_rate;
                  this.projectionReport[168].actual_value = Number(this.projectionReport[168].actual_value) + Number(this.projectionReport[inObj[0].ind].actual_value)
                }
                //Part 2
                if(inObj[0]?.sub_service == 'Permits / Manual & Data Loader Permits'){
                  uspbill = inObj;
                  var totVal = 0;
                  inObj.forEach((x,ind) => {
                      if(ind > 0){
                        totVal = totVal+x.actual_value
                      }
                  });

                  var finalVal = totVal * inObj[0].unit_rate;
                  this.projectionReport[inObj[0].ind].actual_value = finalVal.toFixed(2);
                  this.projectionReport[168].actual_value = Number(this.projectionReport[168].actual_value) + Number(this.projectionReport[inObj[0].ind].actual_value)
                  //console.log('Total Val-->',totVal);
                }

                //Part 3
                if(inObj[0]?.sub_service == 'Audits / Drilling Reports & Notices / Sundries / Per Update'){
                  uspbill = inObj;
                  var totVal = 0;
                  inObj.forEach((x,ind) => {
                      if(ind > 0){
                        totVal = totVal+x.actual_value
                      }
                  });

                  var finalVal = totVal * inObj[0].unit_rate;
                  this.projectionReport[inObj[0].ind].actual_value = finalVal.toFixed(2);
                  this.projectionReport[168].actual_value = Number(this.projectionReport[168].actual_value) + Number(this.projectionReport[inObj[0].ind].actual_value)
                  //console.log('Total Val-->',totVal);
                }

                //Part 4
                if(inObj[0]?.sub_service == 'Well Cost statement capture' || inObj[0]?.sub_service == 'International Energy' || inObj[0]?.sub_service == 'Frac Focus (WISER)' || inObj[0]?.sub_service == 'ODD - CANADA' || inObj[0]?.sub_service == 'ODD - US' || inObj[0]?.sub_service == 'Completions' || inObj[0]?.sub_service == 'RMA - US' || inObj[0]?.sub_service == 'RMA - CANADA'){
                  uspbill = inObj;
                  var totVal = 0;

                  inObj.forEach((x,ind) => {
                      if(ind > 0){
                        var calval = x.actual_value * x.unit_rate;
                        totVal = totVal+calval
                      }
                  });

                  var finalVal = totVal;
                  this.projectionReport[inObj[0].ind].actual_value = finalVal.toFixed(2);
                  if(inObj[0]?.sub_service == 'RMA - CANADA' || inObj[0]?.sub_service == 'Well Cost statement capture' || inObj[0]?.sub_service == 'International Energy' || inObj[0]?.sub_service == 'Frac Focus (WISER)' || inObj[0]?.sub_service == 'Completions' || inObj[0]?.sub_service == 'RMA - US' || inObj[0]?.sub_service == 'ODD - US' || inObj[0]?.sub_service == 'ODD - CANADA'){
                    this.projectionReport[168].actual_value = Number(this.projectionReport[168].actual_value) + Number(this.projectionReport[inObj[0].ind].actual_value)
                  }

                  //console.log('Completions Total Val-->',totVal);
                }


                //Part 4.1
                if(inObj[0]?.sub_service == 'Monthly Services Fee (Outside Pre-defined Shift)'){
                  this.projectionReport[inObj[0].ind].actual_value = this.projectionReport[inObj[0].ind].unit_rate;
                  this.projectionReport[168].actual_value = Number(this.projectionReport[168].actual_value) + Number(this.projectionReport[inObj[0].ind].actual_value)
                }

                //Part 4.2
                if(inObj[0]?.sub_service == 'Fields Data - Graph Grab)'){
                  uspbill = inObj;
                  var totVal = 0;

                  inObj.forEach((x,ind) => {
                    if(ind > 0){
                        var calval = x.actual_value * x.unit_rate;
                        totVal = totVal+calval
                    }
                  });

                  this.projectionReport[inObj[0].ind].actual_value = totVal;
                  this.projectionReport[168].actual_value = Number(this.projectionReport[168].actual_value) + Number(this.projectionReport[inObj[0].ind].actual_value)
                }

                //------------Energy Logs (ID Resolution) calculation------------------
                if(inObj[1]?.sub_service == 'Energy Logs (ID Resolution)'){
                  uspbill = inObj;
                  //console.log('Sample --->', uspbill);
                  var p1tot = 0;
                  var p2tot = 0;
                  var p1ind = uspbill[1].ind;
                  var p2ind;
                  var totFTE = this.getTotalFTE();
                  for(var i=0;i< uspbill.length;i++){
                    if(i > 1 && i < 6){
                      p1tot = p1tot + uspbill[i].actual_value;
                      //console.log('Sample 2--->', uspbill[i]);
                    }

                    if(i > 7 && i<=uspbill.length){
                      p2tot = p2tot + uspbill[i].actual_value;
                    }

                    if(uspbill[i].sub_service == 'Energy Logs (Digitization)'){
                      p2ind = uspbill[i].ind;
                    }
                  }
                  //console.log(p1ind);
                  this.projectionReport[p1ind].actual_value = p1tot;
                  var ftot;
                  var vals1 = uspbill[0].ind;
                  var vals2 = uspbill[1].ind;
                  if(uspbill[1].unit_rate_fte != undefined){
                    if(uspbill[1].actual_value >=  1 && uspbill[1].actual_value < 1000){
                        ftot = uspbill[1]['unit_rate_fte'][' ≥1 '];
                        ftot = ftot.replace(/[^0-9 ]/g, '');
                        //console.log('cal va-->l',ftot);
                    }else if(uspbill[1].actual_value >=  1000 && uspbill[1].actual_value < 2000){
                      ftot = uspbill[1]['unit_rate_fte'][' ≥1000 '];
                      ftot = ftot.replace(/[^0-9 ]/g, '');
                      //console.log('cal va-->l',ftot);
                    }else if(uspbill[1].actual_value >=  2000 && uspbill[1].actual_value < 5000){
                      ftot = uspbill[1]['unit_rate_fte'][' ≥2000 '];
                      ftot = ftot.replace(/[^0-9 ]/g, '');
                      //console.log('cal va-->l',ftot);
                    }else if(uspbill[1].actual_value >=  5000 && uspbill[1].actual_value < 7000){
                      ftot = uspbill[1]['unit_rate_fte'][' ≥5000 '];
                      ftot = ftot.replace(/[^0-9 ]/g, '');
                      //console.log('cal va-->l',ftot);
                    }else if(uspbill[1].actual_value >=  7000 && uspbill[1].actual_value < 10000){
                      ftot = uspbill[1]['unit_rate_fte'][' ≥7000 '];
                      ftot = ftot.replace(/[^0-9 ]/g, '');
                      //console.log('cal va-->l',ftot);
                    }else if(uspbill[1].actual_value >=  10000 && uspbill[1].actual_value < 15000){
                      //alert(uspbill[1]['unit_rate_fte'][' ≥10000 '])
                      ftot = uspbill[1]['unit_rate_fte'][' ≥10000 '];
                      ftot = ftot.replace(/[^0-9 ]/g, '');
                      //console.log('cal va-->l',ftot);
                    }else if(uspbill[1].actual_value >=  15000 && uspbill[1].actual_value < 20000){
                      ftot = uspbill[1]['unit_rate_fte'][' ≥15000 '];
                      ftot = ftot.replace(/[^0-9 ]/g, '');
                      //console.log('cal va-->l',ftot);
                    }else if(uspbill[1].actual_value >=  20000 && uspbill[1].actual_value < 25000){
                      ftot = uspbill[1]['unit_rate_fte'][' ≥20000 '];
                      ftot = ftot.replace(/[^0-9 ]/g, '');
                      //console.log('cal va-->l',ftot);
                    }else if(uspbill[1].actual_value >=  25000){
                      ftot = uspbill[1]['unit_rate_fte'][' ≥25000 '];
                      ftot = ftot.replace(/[^0-9 ]/g, '');
                      //console.log('cal va-->l',ftot);
                    }

                  }
                  this.projectionReport[vals1].actual_value = this.projectionReport[vals2].actual_value * ftot;
                  //this.projectionReport[246].actual_value = Number(this.projectionReport[246].actual_value) + this.round(Number(this.projectionReport[vals1].actual_value),2)


                  this.projectionReport[p2ind].actual_value = p2tot;
                  var ftot2;
                  var val1 = uspbill[7].ind;
                  var val2 = uspbill[6].ind;
                  if(uspbill[7].unit_rate_fte != undefined){
                    if(uspbill[7].actual_value < 400000){
                      ftot2 = uspbill[7]['unit_rate_fte'][' <=40 Mcft '];
                      ftot2 = ftot2.replace("$", '').trim();
                      //console.log('cal va 2-->',ftot2);
                    }else if(uspbill[7].actual_value > 400000 && uspbill[7].actual_value <= 600000){
                      ftot2 = uspbill[7]['unit_rate_fte'][' >40 to <= 60 MCft '];
                      ftot2 = ftot2.replace("$", '').trim();
                      //console.log('cal va 2-->',ftot2);
                    }else if(uspbill[7].actual_value > 600000 && uspbill[7].actual_value <= 800000){
                      ftot2 = uspbill[7]['unit_rate_fte'][' >60 to <= 80 MCft '];
                      ftot2 = ftot2.replace("$", '').trim();
                      //console.log('cal va 2-->',ftot2);
                    }else if(uspbill[7].actual_value > 800000 && uspbill[7].actual_value <= 1000000){
                      ftot2 = uspbill[7]['unit_rate_fte'][' >80 to <= 100 MCft '];
                      ftot2 = ftot2.replace("$", '').trim();
                      //console.log('cal va 2-->',ftot2);
                    }else if(uspbill[7].actual_value > 1000000 && uspbill[7].actual_value <= 12000000){
                      ftot2 = uspbill[7]['unit_rate_fte'][' >100 to <= 120 MCft '];
                      ftot2 = ftot2.replace("$", '').trim();
                      //console.log('cal va 2-->',ftot2);
                    }else if(uspbill[7].actual_value > 12000000){
                      ftot2 = uspbill[7]['unit_rate_fte'][' > 120 MCft '];
                      ftot2 = ftot2.replace("$", '').trim();
                      //console.log('cal va 2-->',ftot2);
                    }
                  }

                  this.projectionReport[val2].actual_value = this.projectionReport[val1].actual_value * ftot2;
                  //this.projectionReport[246].actual_value = Number(this.projectionReport[246].actual_value) +
                  this.projectionReport[246].actual_value = Number(this.projectionReport[246].actual_value) + Number(this.projectionReport[val2].actual_value)

                }
                //------------Energy Logs (ID Resolution) calculation Ends------------------


                //------------Part 11 US Production-------------------
                // if(inObj[0]?.sub_service == 'US Production - Billable FTE Count'){
                //   uspbill = inObj;
                // }

                //Part 12
               if(inObj[0]?.sub_service == 'US Production - Billable FTE Count' || inObj[0]?.sub_service == 'US Production - Revenue' || inObj[0]?.sub_service == 'Energy Midstream - Revenue' || inObj[0]?.sub_service == 'Energy Midstream - Billable FTE Count'){
                    //console.log('I am checking--->', inObj[1]?.sub_service)
                    uspbill = inObj;
                    var totVal = 0;
                    var calVal;

                    uspbill.forEach((i, idx) => {
                      if(idx > 0 && idx != (uspbill.length - 1)){
                      //alert(calVal)
                      totVal = totVal + (uspbill[idx].actual_value)
                    }
                    });

                    var fnln = uspbill.length - 1
                    this.projectionReport[uspbill[fnln].ind].actual_value = totVal;
                    if(inObj[0]?.sub_service == 'US Production - Revenue' || inObj[0]?.sub_service == 'Energy Midstream - Revenue'){
                      this.projectionReport[168].actual_value = Number(this.projectionReport[168].actual_value) + Number(this.projectionReport[uspbill[fnln].ind].actual_value)

                    }
                    if(inObj[0]?.sub_service == 'US Production - Billable FTE Count' || inObj[0]?.sub_service == 'Energy Midstream - Billable FTE Count'){
                      this.projectionReport[421].actual_value = Number(this.projectionReport[421].actual_value) + Number(this.projectionReport[uspbill[fnln].ind].actual_value)
                    }

                }


                //Part 14
                if(inObj[0]?.sub_service == 'Energy Midstream - Revenue'){
                  engMdRev = inObj;
                  uspbill = inObj;
                  var totVal = 0;
                  var calVal;

                  uspbill.forEach((i, idx) => {
                    if(idx > 0 && idx != (uspbill.length - 1)){
                    //alert(calVal)
                    totVal = totVal + (uspbill[idx].actual_value)
                  }
                  });

                  var fnln = uspbill.length - 1
                  this.projectionReport[uspbill[fnln].ind].actual_value = totVal;
                }
                //-------------------- Part 13 Energy Midstream End ---------------------

                //Part 15
                if(inObj[0]?.sub_service == 'International Production - Billable FTE Count'){
                  uspbill = inObj;
                  this.indrirectCalculationPart2(uspbill);
                }

                //Part 16
                if(inObj[0]?.sub_service == 'Desktop Publishing - Billable FTE Count'){
                  uspbill = inObj;
                  var totFTE = this.getTotalFTE();
                  totFTE =  totFTE[0].actual_value
                  var totVal = 0;
                  uspbill.forEach((i, idx) => {
                    if(idx > 0 && i.unit_rate_fte != undefined){
                      var urval = this.getUnitVal(i);
                      //console.log('Desktop Publishing 1--->', urval);
                      var ubil = i.actual_value;
                      var finalVal = ubil * urval;
                      totVal = totVal + finalVal;

                    }
                    if(this.projectionReport[i.ind].sub_service == 'Desktop Publishing Revenue - Sub-Total'){
                      this.projectionReport[i.ind].actual_value = totVal;
                      this.projectionReport[421].actual_value = Number(this.projectionReport[421].actual_value) + Number(this.projectionReport[i.ind].actual_value)
                    }
                  });

                  //console.log('Desktop Publishing 2-->', uspbill)
                }


                //Part 17
                if(inObj[0]?.sub_service == 'Desktop Publishing - Sub items'){
                  uspbill = inObj;
                  this.getCommonCal(inObj);
                }

                if(inObj[0]?.sub_service == 'Desktop Publishing - Total Revenue'){
                  var tot = this.projectionReport[97].actual_value + (this.projectionReport[100].actual_value != null ? this.projectionReport[100].actual_value : 0)
                  this.projectionReport[uspbill[0].ind].actual_value = tot;
                  this.projectionReport[168].actual_value = Number(this.projectionReport[168].actual_value) + Number(this.projectionReport[inObj[0].ind].actual_value)
                }

                //Part 17
                if(inObj[0]?.sub_service == 'Canada Data Processing (General Well Data Services)'){
                  uspbill = inObj;
                 // console.log("Canada Data Processing --- >",uspbill);
                  if(uspbill.length == 2){
                    var resp = uspbill[0].unit_rate * uspbill[1].actual_value;
                    this.projectionReport[uspbill[0].ind].actual_value = resp;
                    this.projectionReport[168].actual_value = Number(this.projectionReport[168].actual_value) + Number(this.projectionReport[inObj[0].ind].actual_value)
                  }

                }

                //Part 18
                if(inObj[0]?.sub_service == 'NA Data Processing (Well Data Services - Core Analysis)'){
                  uspbill = inObj;
                  this.getCommonCal(inObj);
                }

                //part 19
                if(inObj[0]?.sub_service == 'US Wells (DST & Core)'){
                  uspbill = inObj;
                  //console.log("US Wells --- >",uspbill);
                  if(uspbill.length == 2){
                    var resp = uspbill[0].unit_rate * uspbill[1].actual_value;
                    this.projectionReport[uspbill[0].ind].actual_value = resp;
                    this.projectionReport[168].actual_value = Number(this.projectionReport[168].actual_value) + Number(this.projectionReport[inObj[0].ind].actual_value)
                  }
                }

                //Part 20
                if(inObj[0]?.sub_service == 'Core Project 1'){
                  uspbill = inObj;
                  this.getCommonCal(inObj);
                }

                //part 21
                if(inObj[0]?.sub_service == 'Chemical Disclosure' || inObj[0]?.sub_service == 'ECR_Basic Data Entry Process' || inObj[0]?.sub_service == 'Energy Logs - Orphaned Logs Project'){
                  uspbill = inObj;
                  //console.log("US Wells --- >",uspbill);
                  if(uspbill.length == 2){
                    var resp = uspbill[0].unit_rate * uspbill[1].actual_value;
                    this.projectionReport[uspbill[0].ind].actual_value = resp;

                    if(inObj[0]?.sub_service == 'Chemical Disclosure'){
                      this.projectionReport[168].actual_value = Number(this.projectionReport[168].actual_value) + Number(this.projectionReport[uspbill[0].ind].actual_value)
                    }else if(inObj[0]?.sub_service == 'ECR_Basic Data Entry Process'){
                      this.projectionReport[198].actual_value = Number(this.projectionReport[198].actual_value) + Number(this.projectionReport[uspbill[0].ind].actual_value)
                    }else if(inObj[0]?.sub_service == 'Energy Logs - Orphaned Logs Project'){
                      this.projectionReport[246].actual_value = Number(this.projectionReport[246].actual_value) + this.round(Number(this.projectionReport[uspbill[0].ind].actual_value),2)
                     // alert('Energy Logs - Orphaned Logs Project -- >'+ this.projectionReport[246].actual_value)
                    }
                  }
                }

                //Part 22
                if(inObj[0]?.sub_service == 'AS$ET Conversion Project' || inObj[0]?.sub_service == 'US Fluid Analsis' || inObj[0]?.sub_service == 'RigSpec' || inObj[0]?.sub_service == 'Refracs' || inObj[0]?.sub_service == 'PIDM Individual Name Reversal - Data Cleansing Project' || inObj[0]?.sub_service == 'API14 Matching Project' || inObj[0]?.sub_service == 'AFE  Project  (Authorization For Expenditure)'){
                  uspbill = inObj;
                  this.getCommonCal(inObj);
                }


                //Part 1
                if(inObj[0]?.sub_service == 'Application outage' && inObj[0]?.ind == 164){
                    if(inObj[0]?.sub_service == 'Application outage'){
                      this.projectionReport[168].actual_value = Number(this.projectionReport[168].actual_value) + Number(this.projectionReport[inObj[0].ind].actual_value)
                      this.projectionReport[422].actual_value = Number(this.projectionReport[422].actual_value) + Number(this.projectionReport[168].actual_value)
                    }
                }

                if(inObj[1]?.sub_service == 'Credit Reductions' && inObj[1]?.ind == 165){
                  this.projectionReport[168].actual_value = Number(this.projectionReport[168].actual_value) + Number(this.projectionReport[inObj[1].ind].actual_value)
                  this.projectionReport[424].actual_value = Number(this.projectionReport[424].actual_value) + Number(this.projectionReport[168].actual_value)
                }

                if(inObj[2]?.sub_service == 'Gain Sharing' && inObj[2]?.ind == 166){
                  this.projectionReport[168].actual_value = Number(this.projectionReport[168].actual_value) + Number(this.projectionReport[inObj[2].ind].actual_value)
                  this.projectionReport[426].actual_value = Number(this.projectionReport[426].actual_value) + Number(this.projectionReport[168].actual_value)
                }

                if(inObj[3]?.sub_service == 'Delta Billing' && inObj[3]?.ind == 167){
                  this.projectionReport[168].actual_value = Number(this.projectionReport[168].actual_value) + Number(this.projectionReport[inObj[3].ind].actual_value)
                  this.projectionReport[428].actual_value = Number(this.projectionReport[428].actual_value) + Number(this.projectionReport[168].actual_value)
                }


              //Part 2
              if(inObj[0]?.sub_service == 'Application outage' && inObj[0]?.ind == 194){
                if(inObj[0]?.sub_service == 'Application outage'){
                  this.projectionReport[198].actual_value = Number(this.projectionReport[198].actual_value) + Number(this.projectionReport[inObj[0].ind].actual_value)
                  this.projectionReport[422].actual_value = Number(this.projectionReport[422].actual_value) + Number(this.projectionReport[198].actual_value)
                }
              }

              if(inObj[1]?.sub_service == 'Credit Reductions' && inObj[1]?.ind == 195){
                this.projectionReport[198].actual_value = Number(this.projectionReport[198].actual_value) + Number(this.projectionReport[inObj[1].ind].actual_value)
                this.projectionReport[424].actual_value = Number(this.projectionReport[424].actual_value) + Number(this.projectionReport[198].actual_value)
              }

              if(inObj[2]?.sub_service == 'Gain Sharing' && inObj[2]?.ind == 196){
                this.projectionReport[198].actual_value = Number(this.projectionReport[198].actual_value) + Number(this.projectionReport[inObj[2].ind].actual_value)
                this.projectionReport[426].actual_value = Number(this.projectionReport[426].actual_value) + Number(this.projectionReport[198].actual_value)
              }

              if(inObj[3]?.sub_service == 'Delta Billing' && inObj[3]?.ind == 197){
                this.projectionReport[198].actual_value = Number(this.projectionReport[198].actual_value) + Number(this.projectionReport[inObj[3].ind].actual_value)
                this.projectionReport[428].actual_value = Number(this.projectionReport[428].actual_value) + Number(this.projectionReport[198].actual_value)
              }



                //------------------------Part 23 Energy Logs (WSR Data Processing)----------------
                if(inObj[1]?.sub_service == 'Energy Logs (WSR Data Processing)'){
                  uspbill = inObj;
                  var totVal = 0;
                  uspbill.forEach((i, idx) => {
                    if(idx > 1){
                      totVal = totVal + i.actual_value;
                    }
                  });
                  this.projectionReport[uspbill[1].ind].actual_value = totVal;
                  var calVal;
                  //alert("checking--->"+uspbill[1].actual_value);
                  if(uspbill[1].unit_rate_fte != undefined){
                    if(uspbill[1].actual_value > 1 && uspbill[1].actual_value < 50){
                        calVal = uspbill[1].unit_rate_fte['≥1'];
                        calVal = Number(calVal.replace("$", '').trim());
                    }else if(uspbill[1].actual_value >= 50 && uspbill[1].actual_value < 100){
                      calVal = uspbill[1].unit_rate_fte['≥50'];
                      calVal = Number(calVal.replace("$", '').trim());
                    }else if(uspbill[1].actual_value >= 100 && uspbill[1].actual_value < 500){
                      calVal = uspbill[1].unit_rate_fte['≥100'];
                      calVal = Number(calVal.replace("$", '').trim());
                    }else if(uspbill[1].actual_value >= 500 && uspbill[1].actual_value < 1000){
                      calVal = uspbill[1].unit_rate_fte['≥500'];
                      calVal = Number(calVal.replace("$", '').trim());
                    }else if(uspbill[1].actual_value >= 1000 && uspbill[1].actual_value < 2000){
                      calVal = uspbill[1].unit_rate_fte['≥1000'];
                      calVal = Number(calVal.replace("$", '').trim());;
                    }else if(uspbill[1].actual_value >= 2000 && uspbill[1].actual_value < 3000){
                      calVal = uspbill[1].unit_rate_fte['≥2000'];
                      calVal = Number(calVal.replace("$", '').trim());
                    }else if(uspbill[1].actual_value >= 3000 && uspbill[1].actual_value < 4000){
                      calVal = uspbill[1].unit_rate_fte['≥3000'];
                      calVal = Number(calVal.replace("$", '').trim());
                    }else if(uspbill[1].actual_value >= 4000 && uspbill[1].actual_value < 5000){
                      calVal = uspbill[1].unit_rate_fte['≥4000'];
                      calVal = Number(calVal.replace("$", '').trim());
                    }else if(uspbill[1].actual_value >= 5000 && uspbill[1].actual_value < 6000){
                      calVal = uspbill[1].unit_rate_fte['≥5000'];
                      calVal = Number(calVal.replace("$", '').trim());
                    }
                  }


                  this.projectionReport[uspbill[0].ind].actual_value = this.projectionReport[uspbill[1].ind].actual_value * calVal;
                  //alert('Energy Logs (WSR Data Processing) 123-- >'+ this.projectionReport[246].actual_value);
                  this.projectionReport[246].actual_value = Number(this.projectionReport[246].actual_value) + Number(this.projectionReport[uspbill[0].ind].actual_value)

                }
                //------------------------Part 23 Energy Logs (WSR Data Processing) Ends----------------


                //------------------------Part 24 Formation TOPS----------------
                if(inObj[0]?.sub_service == 'Formation TOPS'){
                  uspbill = inObj;
                  var totVal = 0;
                  var calVal;
                  if(uspbill[0].unit_rate_fte != undefined){
                    if(uspbill[1].actual_value <  12000){
                      calVal = uspbill[0]['unit_rate_fte']['<=12000'];
                      calVal = Number(calVal.replace("$", '').trim());
                    }else if(uspbill[1].actual_value >= 12000 && uspbill[1].actual_value <= 24000){
                      calVal = uspbill[0]['unit_rate_fte']['<=24000'];
                      calVal = Number(calVal.replace("$", '').trim());
                    }else if(uspbill[1].actual_value > 24000 && uspbill[1].actual_value  <= 36000){
                      calVal = uspbill[0]['unit_rate_fte']['<=36000'];
                      calVal = Number(calVal.replace("$", '').trim());
                    }else if(uspbill[1].actual_value > 36000){
                      calVal = uspbill[0]['unit_rate_fte']['>36000'];
                      calVal = Number(calVal.replace("$", '').trim());
                    }
                  }
                  this.projectionReport[uspbill[0].ind].actual_value = this.projectionReport[uspbill[1].ind].actual_value * calVal;
                  this.projectionReport[246].actual_value = Number(this.projectionReport[246].actual_value) + Number(this.projectionReport[uspbill[0].ind].actual_value )
                  //alert('Formation TOPS -- >'+ this.projectionReport[246].actual_value)
                }
                //------------------------Part 24 Formation TOPS Ends----------------

                //------------------------Part 25 Global Data Processing (Well Data Services - Directional survey)------------------------
                if(inObj[0]?.sub_service == 'Global Data Processing (Well Data Services - Directional survey)'){
                  uspbill = inObj;
                  var totVal = 0;
                  uspbill.forEach((y, indx) => {
                    if(indx > 0){
                      if(uspbill[indx].unit_rate_fte?.objval){
                        var resp = (uspbill[indx].unit_rate_fte?.objval).replace('$','').trim();
                        totVal = totVal + (uspbill[indx].actual_value * resp);
                      }
                    }

                  });
                  this.projectionReport[uspbill[0].ind].actual_value = totVal;
                  this.projectionReport[246].actual_value = Number(this.projectionReport[246].actual_value) + Number(this.projectionReport[uspbill[0].ind].actual_value)
                 // alert('Global Data -- >'+ this.projectionReport[246].actual_value)
                }
                //------------------------End Part 25 Global Data Processing (Well Data Services - Directional survey) Ends------------------------

                //-------------------------- Part 26 Raster Header labeling ------------------------

                if(inObj[0]?.sub_service == 'Raster Header labeling'){
                  uspbill = inObj;
                  var totVal = 0;
                  //alert('Testing--->'+ uspbill[0].unit_rate_fte?.['Unit Cost'])
                  var val = uspbill[0].unit_rate_fte?.['Unit Cost'];
                  const resp = val.replace('$','').trim();
                  uspbill.forEach((y, indx) => {
                    if(indx > 0){
                      if(uspbill[0].unit_rate_fte && uspbill[0].unit_rate_fte?.['Unit Cost']){
                        totVal = totVal + (uspbill[indx].actual_value * resp);
                      }
                    }

                  });
                  this.projectionReport[uspbill[0].ind].actual_value = totVal;
                  this.projectionReport[246].actual_value = Number(this.projectionReport[246].actual_value) + Number(this.projectionReport[uspbill[0].ind].actual_value)
                 // alert('Raster Header -- >'+ this.projectionReport[246].actual_value)
                }


                //-------------------------- End 26 Raster Header labeling -------------------------

                //-------------------------- Part 27 Presure Data Header ------------------------

                if(inObj[0]?.sub_service == 'Pressure Data'){
                uspbill = inObj;
                var totVal = 0;
                uspbill.forEach((y, indx) => {
                  if(indx > 0){
                    if(uspbill[indx].unit_rate_fte && uspbill[indx].unit_rate_fte?.['Per Unit']){
                      var resp = (uspbill[indx].unit_rate_fte?.['Per Unit']).replace('$','').trim();
                      totVal = totVal + (uspbill[indx].actual_value * resp);
                    }
                  }

                });
                this.projectionReport[uspbill[0].ind].actual_value = totVal;
                this.projectionReport[246].actual_value = Number(this.projectionReport[246].actual_value) + Number(this.projectionReport[uspbill[0].ind].actual_value)

                //console.log('Testing Obj -->',uspbill);
              }
                //-------------------------- End 27 Presure Data -------------------------


                //-------------------------- Part 28 Agriculture Commodities------------------------

                if(inObj[0]?.sub_service == 'Agriculture Commodities'){
                  uspbill = inObj;
                  var totVal = 0;
                  uspbill.forEach((y, indx) => {
                    if(indx > 0){
                      if(uspbill[indx].unit_rate_fte && uspbill[indx].unit_rate_fte?.['Per Unit']){
                        var resp = (uspbill[indx].unit_rate_fte?.['Per Unit']).replace('$','').trim();
                        totVal = totVal + (uspbill[indx].actual_value * resp);
                      }
                    }

                  });
                  this.projectionReport[uspbill[0].ind].actual_value = totVal;
                  this.projectionReport[246].actual_value = Number(this.projectionReport[246].actual_value) + Number(this.projectionReport[uspbill[0].ind].actual_value)
                }
                //-------------------------- End 28 Agriculture Commodities -------------------------


                 //Part 3
              if(inObj[0]?.sub_service == 'Application outage' && inObj[0]?.ind == 242){
                if(inObj[0]?.sub_service == 'Application outage'){
                 this.projectionReport[246].actual_value = Number(this.projectionReport[246].actual_value) + Number(this.projectionReport[inObj[0].ind].actual_value)
                 this.projectionReport[422].actual_value = Number(this.projectionReport[422].actual_value) + Number(this.projectionReport[246].actual_value)
                }
              }

              if(inObj[1]?.sub_service == 'Credit Reductions' && inObj[1]?.ind == 243){
                this.projectionReport[246].actual_value = Number(this.projectionReport[246].actual_value) + Number(this.projectionReport[inObj[1].ind].actual_value)
                this.projectionReport[424].actual_value = Number(this.projectionReport[424].actual_value) + Number(this.projectionReport[246].actual_value)
              }

              if(inObj[2]?.sub_service == 'Gain Sharing' && inObj[2]?.ind == 244){
               this.projectionReport[246].actual_value = Number(this.projectionReport[246].actual_value) + Number(this.projectionReport[inObj[2].ind].actual_value)
               this.projectionReport[426].actual_value = Number(this.projectionReport[426].actual_value) + Number(this.projectionReport[246].actual_value)
              }

              if(inObj[3]?.sub_service == 'Delta Billing' && inObj[3]?.ind == 245){
               this.projectionReport[246].actual_value = Number(this.projectionReport[246].actual_value) + Number(this.projectionReport[inObj[3].ind].actual_value)
               this.projectionReport[428].actual_value = Number(this.projectionReport[428].actual_value) + Number(this.projectionReport[246].actual_value)
              }


                //------------------------Part 29 US Wells - Spotting New permits----------------
                if(inObj[0]?.sub_service == 'US Wells - Spotting New permits'){
                  uspbill = inObj;
                  var totVal = 0;
                  var calVal;
                  //console.log('US Wells - 0 --?', uspbill[1].actual_value);

                  if(uspbill[1].unit_rate_fte){
                    if(uspbill[1].actual_value >=  1 && uspbill[1].actual_value < 750){
                      calVal = uspbill[1]['unit_rate_fte']['≥1'];
                      calVal = Number(calVal.replace("$", '').trim());
                    }else if(uspbill[1].actual_value >= 750 && uspbill[1].actual_value < 1000){
                      calVal = uspbill[1]['unit_rate_fte']['≥750'];
                      calVal = Number(calVal.replace("$", '').trim());
                    }else if(uspbill[1].actual_value >= 1000 && uspbill[1].actual_value  < 2000){
                      //console.log('US Wells - 4 --?', uspbill[1].actual_value);
                      calVal = uspbill[1]['unit_rate_fte']['≥1000'];
                      calVal = Number(calVal.replace("$", '').trim());
                    }else if(uspbill[1].actual_value >= 2000 && uspbill[1].actual_value  < 4000){
                      calVal = uspbill[1]['unit_rate_fte']['≥2000'];
                      calVal = Number(calVal.replace("$", '').trim());
                    }else if(uspbill[1].actual_value >= 4000 && uspbill[1].actual_value  < 7500){
                      calVal = uspbill[1]['unit_rate_fte']['≥4000'];
                      calVal = Number(calVal.replace("$", '').trim());
                    }else if(uspbill[1].actual_value >= 7500 && uspbill[1].actual_value  < 8500){
                      calVal = uspbill[1]['unit_rate_fte']['≥7500'];
                      calVal = Number(calVal.replace("$", '').trim());
                    }else if(uspbill[1].actual_value >= 8500 && uspbill[1].actual_value  < 9500){
                      calVal = uspbill[1]['unit_rate_fte']['≥8500'];
                      calVal = Number(calVal.replace("$", '').trim());
                    }else if(uspbill[1].actual_value >= 9500 && uspbill[1].actual_value  < 10000){
                      calVal = uspbill[1]['unit_rate_fte']['≥9500'];
                      calVal = Number(calVal.replace("$", '').trim());
                    }else if(uspbill[1].actual_value >= 10000 && uspbill[1].actual_value  < 11000){
                      calVal = uspbill[1]['unit_rate_fte']['≥10000'];
                      calVal = Number(calVal.replace("$", '').trim());
                    }else if(uspbill[1].actual_value >= 11000){
                      calVal = uspbill[1]['unit_rate_fte']['≥11000'];
                      calVal = Number(calVal.replace("$", '').trim());
                    }
                  }
                  //console.log('US Wells - Spotting', calVal);
                  this.projectionReport[uspbill[0].ind].actual_value = this.projectionReport[uspbill[1].ind].actual_value * calVal;
                  this.projectionReport[288].actual_value = Number(this.projectionReport[288].actual_value) + Number(this.projectionReport[uspbill[0].ind].actual_value)
                }
              //------------------------End Part 29 US Wells - Spotting New permits----------------


               //------------------------Part 30 US Wells - Spotting----------------
               if(inObj[0]?.sub_service == 'US Wells - Spotting' && inObj[0]?.sub_service == 'COMPLETIONS'){
                uspbill = inObj;
                var totVal = 0;
                var calVal;
                //console.log('US Wells - 0 --?', uspbill[1].actual_value);

                if(uspbill[1].unit_rate_fte){
                  if(uspbill[1].actual_value >=  1 && uspbill[1].actual_value < 250){
                    calVal = uspbill[1]['unit_rate_fte']['≥1'];
                    calVal = Number(calVal.replace("$", '').trim());
                  }else if(uspbill[1].actual_value >= 250 && uspbill[1].actual_value < 500){
                    calVal = uspbill[1]['unit_rate_fte']['≥250'];
                    calVal = Number(calVal.replace("$", '').trim());
                  }else if(uspbill[1].actual_value >= 500 && uspbill[1].actual_value  < 1000){
                    console.log('US Wells - 4 --?', uspbill[1].actual_value);
                    calVal = uspbill[1]['unit_rate_fte']['≥500'];
                    calVal = Number(calVal.replace("$", '').trim());
                  }else if(uspbill[1].actual_value >= 1000 && uspbill[1].actual_value  < 1500){
                    calVal = uspbill[1]['unit_rate_fte']['≥1000'];
                    calVal = Number(calVal.replace("$", '').trim());
                  }else if(uspbill[1].actual_value >= 1500 && uspbill[1].actual_value  < 2000){
                    calVal = uspbill[1]['unit_rate_fte']['≥1500'];
                    calVal = Number(calVal.replace("$", '').trim());
                  }else if(uspbill[1].actual_value >= 2000 && uspbill[1].actual_value  < 3000){
                    calVal = uspbill[1]['unit_rate_fte']['≥2000'];
                    calVal = Number(calVal.replace("$", '').trim());
                  }else if(uspbill[1].actual_value >= 3000 && uspbill[1].actual_value  < 5000){
                    calVal = uspbill[1]['unit_rate_fte']['≥3000'];
                    calVal = Number(calVal.replace("$", '').trim());
                  }else if(uspbill[1].actual_value >= 5000 && uspbill[1].actual_value  < 8000){
                    calVal = uspbill[1]['unit_rate_fte']['≥5000'];
                    calVal = Number(calVal.replace("$", '').trim());
                  }else if(uspbill[1].actual_value >= 8000 && uspbill[1].actual_value  < 12000){
                    calVal = uspbill[1]['unit_rate_fte']['≥8000'];
                    calVal = Number(calVal.replace("$", '').trim());
                  }else if(uspbill[1].actual_value >= 12000){
                    calVal = uspbill[1]['unit_rate_fte']['≥12000'];
                    calVal = Number(calVal.replace("$", '').trim());
                  }
                }
                //console.log('US Wells - Spotting', calVal);
                this.projectionReport[uspbill[0].ind].actual_value = this.round(this.projectionReport[uspbill[1].ind].actual_value * calVal,2);
                this.projectionReport[288].actual_value = Number(this.projectionReport[288].actual_value) + Number(this.projectionReport[uspbill[0].ind].actual_value)
              }
            //------------------------End Part 30 US Wells - Spotting----------------


                //-------------------------- Part 31 US Wells (Scaling) ------------------------

                if(inObj[0]?.sub_service == 'US Wells (Scaling)'){
                  uspbill = inObj;
                  var totVal = 0;
                  const resp = (uspbill[0].unit_rate_fte?.['Per Scaling']).replace('$','').trim();
                  uspbill.forEach((y, indx) => {
                    if(indx > 0){
                      if(uspbill[0].unit_rate_fte && uspbill[0].unit_rate_fte?.['Per Scaling']){
                        totVal = totVal + (uspbill[indx].actual_value * resp);
                      }
                    }

                  });
                  this.projectionReport[uspbill[0].ind].actual_value = totVal;
                  this.projectionReport[288].actual_value = Number(this.projectionReport[288].actual_value) + Number(this.projectionReport[uspbill[0].ind].actual_value)
                }
                //-------------------------- End 31 US Wells (Scaling) -------------------------


                //------------------------Part 32 US Wells - Spotting----------------
                if(inObj[0]?.sub_service == 'Canada Data Processing (Land Services) - Land Text'){
                  uspbill = inObj;
                  var totVal = 0;
                  var calVal;

                  if(uspbill[1].unit_rate_fte){
                    if(uspbill[1].actual_value >=  1 && uspbill[1].actual_value < 250){
                      calVal = uspbill[1]['unit_rate_fte']['≥1'];
                      calVal = Number(calVal.replace("$", '').trim());
                    }else if(uspbill[1].actual_value >= 250 && uspbill[1].actual_value < 500){
                      calVal = uspbill[1]['unit_rate_fte']['≥250'];
                      calVal = Number(calVal.replace("$", '').trim());
                    }else if(uspbill[1].actual_value >= 500 && uspbill[1].actual_value  < 1000){
                      console.log('US Wells - 4 --?', uspbill[1].actual_value);
                      calVal = uspbill[1]['unit_rate_fte']['≥500'];
                      calVal = Number(calVal.replace("$", '').trim());
                    }else if(uspbill[1].actual_value >= 1000 && uspbill[1].actual_value  < 1500){
                      calVal = uspbill[1]['unit_rate_fte']['≥1000'];
                      calVal = Number(calVal.replace("$", '').trim());
                    }else if(uspbill[1].actual_value >= 1500){
                      calVal = uspbill[1]['unit_rate_fte']['≥1500'];
                      calVal = Number(calVal.replace("$", '').trim());
                    }
                  }
                  this.projectionReport[uspbill[0].ind].actual_value = this.round(this.projectionReport[uspbill[1].ind].actual_value * calVal,2);
                  this.projectionReport[288].actual_value = Number(this.projectionReport[288].actual_value) + Number(this.projectionReport[uspbill[0].ind].actual_value)
                }
                //------------------------End Part 32 US Wells - Spotting----------------



                  //------------------------Part 33 Energy Logs (WSR Data Processing)----------------
                  if(inObj[1]?.sub_service == 'Canada Data Processing (Land Text CROWN) - BAU'){
                    uspbill = inObj;
                    var totVal = 0;
                    uspbill.forEach((i, idx) => {
                      if(idx > 1){
                        totVal = totVal + i.actual_value;
                      }
                    });
                    this.projectionReport[uspbill[1].ind].actual_value = totVal;
                    var calVal;

                    if(uspbill[1].unit_rate_fte != undefined){
                      if(uspbill[1].actual_value >= 1 && uspbill[1].actual_value < 5000){
                          calVal = uspbill[1].unit_rate_fte['≥1'];
                          calVal = Number(calVal.replace("$", '').trim());
                      }else if(uspbill[1].actual_value >= 5000 && uspbill[1].actual_value < 8000){
                        calVal = uspbill[1].unit_rate_fte['≥5000'];
                        calVal = Number(calVal.replace("$", '').trim());
                      }else if(uspbill[1].actual_value >= 8000 && uspbill[1].actual_value < 12000){
                        calVal = uspbill[1].unit_rate_fte['≥8000'];
                        calVal = Number(calVal.replace("$", '').trim());
                      }else if(uspbill[1].actual_value >= 12000 && uspbill[1].actual_value < 15000){
                        calVal = uspbill[1].unit_rate_fte['≥12000'];
                        calVal = Number(calVal.replace("$", '').trim());
                      }else if(uspbill[1].actual_value >= 15000 && uspbill[1].actual_value < 20000){
                        calVal = uspbill[1].unit_rate_fte['≥15000'];
                        calVal = Number(calVal.replace("$", '').trim());;
                      }else if(uspbill[1].actual_value >= 20000 && uspbill[1].actual_value < 25000){
                        calVal = uspbill[1].unit_rate_fte['≥20000'];
                        calVal = Number(calVal.replace("$", '').trim());
                      }else if(uspbill[1].actual_value >= 25000 && uspbill[1].actual_value < 30000){
                        calVal = uspbill[1].unit_rate_fte['≥25000'];
                        calVal = Number(calVal.replace("$", '').trim());
                      }else if(uspbill[1].actual_value >= 30000 && uspbill[1].actual_value < 35000){
                        calVal = uspbill[1].unit_rate_fte['≥30000'];
                        calVal = Number(calVal.replace("$", '').trim());
                      }else if(uspbill[1].actual_value >= 35000 && uspbill[1].actual_value < 40000){
                        calVal = uspbill[1].unit_rate_fte['≥35000'];
                        calVal = Number(calVal.replace("$", '').trim());
                      }else if(uspbill[1].actual_value >= 40000){
                        calVal = uspbill[1].unit_rate_fte['≥40000'];
                        calVal = Number(calVal.replace("$", '').trim());
                      }
                    }

                    this.projectionReport[uspbill[0].ind].actual_value = this.projectionReport[uspbill[1].ind].actual_value * calVal;
                    this.projectionReport[288].actual_value = Number(this.projectionReport[288].actual_value) + Number(this.projectionReport[uspbill[0].ind].actual_value)
                  }
                  //------------------------Part 33 Energy Logs (WSR Data Processing) Ends-------------------------


                //-------------------------- Part 34 Canadian Freehold Data Entry (Alberta) ------------------------
                if(inObj[0]?.sub_service == 'Canadian Freehold Data Entry (Alberta)'){
                  uspbill = inObj;
                  var totVal = 0;
                  //const resp = (uspbill[0].unit_rate_fte?.['Per Scaling']).replace('$','').trim();
                  uspbill.forEach((y, indx) => {
                    if(indx > 0){
                     // if(uspbill[0].unit_rate_fte && uspbill[0].unit_rate_fte?.['Per Scaling']){
                      const resp = (y.unit_rate_fte?.['Unit Cost']).replace('$','').trim();
                      totVal = totVal + (y.actual_value * resp);
                     // }
                    }
                  });
                  this.projectionReport[uspbill[0].ind].actual_value = totVal;
                  this.projectionReport[288].actual_value = Number(this.projectionReport[288].actual_value) + Number(this.projectionReport[uspbill[0].ind].actual_value)
                }
                //-------------------------- End 34 Canadian Freehold Data Entry (Alberta)-------------------------


                 //-------------------------- Part PEPS-PRM Oil and Gas Risk Commentary update------------------------
                 if(inObj[0]?.sub_service == 'PEPS-PRM Oil and Gas Risk Commentary update'){
                  uspbill = inObj;
                  var totVal = 0;
                  //const resp = (uspbill[0].unit_rate_fte?.['Per Scaling']).replace('$','').trim();
                  uspbill.forEach((y, indx) => {
                    if(indx > 0){
                     // if(uspbill[0].unit_rate_fte && uspbill[0].unit_rate_fte?.['Per Scaling']){
                      const resp = (y.unit_rate_fte?.['Effort in minutes']);
                      totVal = totVal + (y.actual_value * resp);
                     // }
                    }
                  });
                  this.projectionReport[uspbill[0].ind].actual_value = totVal;
                  this.projectionReport[198].actual_value = Number(this.projectionReport[198].actual_value) + Number(this.projectionReport[inObj[0].ind].actual_value)
                }
                //-------------------------- End PEPS-PRM Oil and Gas Risk Commentary update-------------------------



                //-------------------------- Part 34 Oil and Gas Risk - Phoenix publishing------------------------
                if(inObj[0]?.sub_service == 'Oil and Gas Risk - Phoenix publishing'){
                  uspbill = inObj;
                  var totVal = 0;
                  //const resp = (uspbill[0].unit_rate_fte?.['Per Scaling']).replace('$','').trim();
                  uspbill.forEach((y, indx) => {
                    if(indx > 0){
                     // if(uspbill[0].unit_rate_fte && uspbill[0].unit_rate_fte?.['Per Scaling']){
                      const resp = (y.unit_rate_fte?.['Unit Rate']);
                      totVal = totVal + (y.actual_value * resp);
                     // }
                    }
                  });
                  this.projectionReport[uspbill[0].ind].actual_value = totVal;
                  this.projectionReport[198].actual_value = Number(this.projectionReport[198].actual_value) + Number(this.projectionReport[inObj[0].ind].actual_value)
                }
                //-------------------------- End Oil and Gas Risk - Phoenix publishing-------------------------



                 //-------------------------- Part 35 Canadian Saskatchewan Freehold (Backlog Data update) ------------------------
                 if(inObj[0]?.sub_service == 'Canadian Saskatchewan Freehold (Backlog Data update)'){
                  uspbill = inObj;
                  var totVal = 0;
                  //const resp = (uspbill[0].unit_rate_fte?.['Per Scaling']).replace('$','').trim();
                  uspbill.forEach((y, indx) => {
                    if(indx > 0){
                     if(y.unit_rate_fte && y.unit_rate_fte?.['UUnit Cost (USD)'] != undefined){
                      //console.log('Chkkkk ---->', y.unit_rate_fte?.['UUnit Cost (USD)'])
                      const resp = (y.unit_rate_fte?.['UUnit Cost (USD)']).replace('$','').trim();
                      totVal = totVal + (y.actual_value * resp);
                     }
                    }

                  });
                  this.projectionReport[uspbill[0].ind].actual_value = totVal;
                  this.projectionReport[288].actual_value = Number(this.projectionReport[288].actual_value) + Number(this.projectionReport[uspbill[0].ind].actual_value)
                }
                //-------------------------- End 35 Canadian Saskatchewan Freehold (Backlog Data update)-------------------------


                //-------------------------- Part 36 Canadian Land text Crown agreement Linking ------------------------
                if(inObj[0]?.sub_service == 'Canadian Land text Crown agreement Linking)'){
                  uspbill = inObj;
                  var totVal = 0;
                  //const resp = (uspbill[0].unit_rate_fte?.['Per Scaling']).replace('$','').trim();
                  uspbill.forEach((y, indx) => {
                    if(indx > 0){
                     // if(uspbill[0].unit_rate_fte && uspbill[0].unit_rate_fte?.['Per Scaling']){
                      const resp = (y.unit_rate_fte?.['Unit Cost']).replace('$','').trim();
                      totVal = totVal + (y.actual_value * resp);
                     // }
                    }
                  });
                  this.projectionReport[uspbill[0].ind].actual_value = totVal;
                  this.projectionReport[288].actual_value = Number(this.projectionReport[288].actual_value) + Number(this.projectionReport[uspbill[0].ind].actual_value)
                }
                //-------------------------- End 36 Canadian Land text Crown agreement Linking-------------------------


                //-------------------------- Part 37 US Wells - Spotting-------------------------
                if(inObj[0]?.sub_service == 'US Wells - Spotting' && inObj[0]?.sub_stream == 'SPOTTING'){
                  uspbill = inObj;
                  var totVal = 0;
                  //const resp = (uspbill[0].unit_rate_fte?.['Per Scaling']).replace('$','').trim();
                  uspbill.forEach((y, indx) => {
                    if(indx > 0){
                     if(y.unit_rate_fte && y.unit_rate_fte?.['Unit Cost'] != undefined){
                      const resp = (y.unit_rate_fte?.['Unit Cost']).replace('$','').trim();
                      totVal = totVal + (y.actual_value * resp);
                     }
                    }
                  });
                  this.projectionReport[uspbill[0].ind].actual_value = totVal;
                  this.projectionReport[288].actual_value = Number(this.projectionReport[288].actual_value) + Number(this.projectionReport[uspbill[0].ind].actual_value)
                }
              //-------------------------- End 37 US Wells - Spotting------------------------


              //-------------------------- Part 37 US Wells - Spotting-------------------------
              if(inObj[0]?.sub_service == 'PEPS - Reports Migration'){
                uspbill = inObj;
                var totVal = 0;
                //const resp = (uspbill[0].unit_rate_fte?.['Per Scaling']).replace('$','').trim();
                uspbill.forEach((y, indx) => {
                  var unitCst = this.projectionReport[uspbill[1].ind].unit_rate
                  if(indx > 0){

                    totVal = totVal + (y.actual_value * unitCst)
                  }
                });
                this.projectionReport[uspbill[0].ind].actual_value = totVal;
                this.projectionReport[198].actual_value = Number(this.projectionReport[198].actual_value) + Number(this.projectionReport[inObj[0].ind].actual_value)
              }
            //-------------------------- End 37 US Wells - Spotting------------------------



                 //------------------------Part 38 US Wells - Spotting Leadership Role----------------
                 if(inObj[0]?.sub_service == 'US Wells - Spotting Leadership Role'){
                  //console.log('I am checking--->', inObj[1]?.sub_service)
                  uspbill = inObj;
                  var totVal = 0;
                  var calVal;
                  uspbill.forEach((i, idx) => {
                    if(idx >= 1){
                      totVal = totVal + i.actual_value;
                    }
                  });
                  //this.projectionReport[uspbill[1].ind].actual_value = totVal;

                  //if(uspbill[1].unit_rate_fte != undefined){
                    if(uspbill[1].actual_value >= 1 && uspbill[1].actual_value < 10){
                        calVal = uspbill[1].unit_rate_fte['1FTE'];
                        calVal = Number(calVal.replace(/[^0-9]/g, "").trim());
                    }else if(uspbill[1].actual_value >= 10 && uspbill[1].actual_value < 50){
                      calVal = uspbill[1].unit_rate_fte['>10FTE'];
                      calVal = Number(calVal.replace(/[^0-9]/g, "").trim());
                    }else if(uspbill[1].actual_value >= 50 && uspbill[1].actual_value < 60){
                      calVal = uspbill[1].unit_rate_fte['>50FTE'];
                      calVal = Number(calVal.replace(/[^0-9]/g, "").trim());
                    }else if(uspbill[1].actual_value >= 60 && uspbill[1].actual_value < 150){
                      calVal = uspbill[1].unit_rate_fte['>60FTE'];
                      calVal = Number(calVal.replace(/[^0-9]/g, "").trim());
                    }else if(uspbill[1].actual_value >= 150){
                      calVal = uspbill[1].unit_rate_fte['>150FTE'];
                      calVal = Number(calVal.replace(/[^0-9]/g, "").trim());
                    }
                  //}
                  this.projectionReport[uspbill[0].ind].actual_value = this.projectionReport[uspbill[1].ind].actual_value * calVal;
                  this.projectionReport[288].actual_value = Number(this.projectionReport[288].actual_value) + Number(this.projectionReport[uspbill[0].ind].actual_value)
                  this.projectionReport[421].actual_value = Number(this.projectionReport[421].actual_value) + Number(this.projectionReport[uspbill[1].ind].actual_value)
                }
                //------------------------Part 38 End US Wells - Spotting Leadership Role----------------

                if(inObj[0]?.sub_service ==  'Land Entry of Oil & Gas Lease Documents - All'){
                  uspbill = inObj;
                  var totVal = 0;
                  var calVal;
                  uspbill.forEach((i, idx) => {
                      if(inObj[idx]?.sub_service ==  'Land Entry of Oil & Gas Lease Documents - All'){
                        this.projectionReport[uspbill[idx].ind].actual_value =  this.projectionReport[uspbill[idx+1].ind].actual_value * this.projectionReport[uspbill[idx].ind].unit_rate
                        this.projectionReport[375].actual_value = Number(this.projectionReport[375].actual_value) + Number(this.projectionReport[idx].actual_value)
                      }

                      if(inObj[idx]?.sub_service ==  'State Leases Processing - Per Agreement'){
                        this.projectionReport[uspbill[idx].ind].actual_value =  this.projectionReport[uspbill[idx+1].ind].actual_value * this.projectionReport[uspbill[idx].ind].unit_rate
                        this.projectionReport[375].actual_value = Number(this.projectionReport[375].actual_value) + Number(this.projectionReport[idx].actual_value)
                      }

                      if(inObj[idx]?.sub_service ==  'Texas LandEntry of Oil and Gas Lease Documents-All'){
                        this.projectionReport[uspbill[idx].ind].actual_value =  this.projectionReport[uspbill[idx+1].ind].actual_value * this.projectionReport[uspbill[idx].ind].unit_rate
                        this.projectionReport[375].actual_value = Number(this.projectionReport[375].actual_value) + Number(this.projectionReport[idx].actual_value)
                      }

                      if(inObj[idx]?.sub_service ==  'Child Documents-All'){
                        this.projectionReport[uspbill[idx].ind].actual_value =  this.projectionReport[uspbill[idx+1].ind].actual_value * this.projectionReport[uspbill[idx].ind].unit_rate
                        this.projectionReport[375].actual_value = Number(this.projectionReport[375].actual_value) + Number(this.projectionReport[idx].actual_value)
                      }

                      if(inObj[idx]?.sub_service ==  'County Books Preprocessing - Per PDF file'){
                        this.projectionReport[uspbill[idx].ind].actual_value =  this.projectionReport[uspbill[idx+1].ind].actual_value * this.projectionReport[uspbill[idx].ind].unit_rate
                        this.projectionReport[375].actual_value = Number(this.projectionReport[375].actual_value) + Number(this.projectionReport[idx].actual_value)
                      }

                      if(inObj[idx]?.sub_service ==  'State Lease Processing TX - Per Book'){
                        this.projectionReport[uspbill[idx].ind].actual_value =  this.projectionReport[uspbill[idx+1].ind].actual_value * this.projectionReport[uspbill[idx].ind].unit_rate
                        this.projectionReport[375].actual_value = Number(this.projectionReport[375].actual_value) + Number(this.projectionReport[idx].actual_value)
                      }

                      if(inObj[idx]?.sub_service ==  'Largeblanket Processing - Per Template'){
                        this.projectionReport[uspbill[idx].ind].actual_value =  this.projectionReport[uspbill[idx+1].ind].actual_value * this.projectionReport[uspbill[idx].ind].unit_rate
                        this.projectionReport[375].actual_value = Number(this.projectionReport[375].actual_value) + Number(this.projectionReport[idx].actual_value)
                      }

                      if(inObj[idx]?.sub_service ==  'Edge Matching'){
                        this.projectionReport[uspbill[idx].ind].actual_value =  this.projectionReport[uspbill[idx+1].ind].actual_value * this.projectionReport[uspbill[idx].ind].unit_rate
                        this.projectionReport[375].actual_value = Number(this.projectionReport[375].actual_value) + Number(this.projectionReport[idx].actual_value)
                      }

                      if(inObj[idx]?.sub_service ==  'Reference Documents Processing - Per Document'){
                        this.projectionReport[uspbill[idx].ind].actual_value =  this.projectionReport[uspbill[idx+1].ind].actual_value * this.projectionReport[uspbill[idx].ind].unit_rate
                        this.projectionReport[375].actual_value = Number(this.projectionReport[375].actual_value) + Number(this.projectionReport[idx].actual_value)
                      }

                      if(inObj[idx]?.sub_service ==  'Derived Documents Processing - Per Document'){

                      }else if(inObj[idx]?.sub_service ==  'Other than Texas'){
                        totVal = totVal + (this.projectionReport[uspbill[idx].ind].actual_value * this.projectionReport[uspbill[idx].ind].unit_rate)
                      }else if(inObj[idx]?.sub_service ==  'Texas (TX)'){
                        totVal = totVal + (this.projectionReport[uspbill[idx].ind].actual_value * this.projectionReport[uspbill[idx].ind].unit_rate)
                      }else if(inObj[idx]?.sub_service ==  'North Dakota (ND)'){
                        totVal = totVal + (this.projectionReport[uspbill[idx].ind].actual_value * this.projectionReport[uspbill[idx].ind].unit_rate)

                        this.projectionReport[308].actual_value = totVal;
                        this.projectionReport[375].actual_value = Number(this.projectionReport[375].actual_value) + Number(totVal)
                      }

                  });
                }

                //------------------------Part 39 Texas Parcel Mapping of Oil and Gas----------------

                if(inObj[0]?.sub_service ==  'NA Land Mapping of CHILD & Large Blanket Documents -OpEx' || inObj[0]?.sub_service == 'NA Land Mapping of CHILD & Large Blanket Documents -CapEx' || inObj[0]?.sub_service == 'LA Counties Mapping of Oil and Gas Lease Documents-OpEx' || inObj[0]?.sub_service == 'LA Counties Mapping of Oil and Gas Lease Documents-CapEx' || inObj[0]?.sub_service == 'NA Land PLSS Mapping of Oil and Gas Lease Documents-OpEx' || inObj[0]?.sub_service == 'NA Land PLSS Mapping of Oil and Gas Lease Documents-CapEx' || inObj[0]?.sub_service == 'Texas Parcel Mapping of Oil and Gas Lease Documents-CapEx' || inObj[0]?.sub_service == 'Texas Parcel Mapping of Oil and Gas Lease Documents-OpEx'){
                  //console.log('I am checking Texas Parcel --->', inObj)
                  uspbill = inObj;
                  var totVal = 0;
                  var calVal;
                  uspbill.forEach((i, idx) => {
                    if(idx >= 1){
                      var calVal = i.unit_rate_fte['Unit Price'];
                      calVal = Number(calVal.replace("$", '').trim());
                      totVal = Number(totVal) + Number(calVal * i.actual_value);
                    }
                  });

                  this.projectionReport[inObj[0].ind].actual_value = this.round(totVal,2);

                  //if(inObj[0]?.sub_service ==  'NA Land Mapping of CHILD & Large Blanket Documents -OpEx' || inObj[0]?.sub_service == 'NA Land Mapping of CHILD & Large Blanket Documents -CapEx' || inObj[0]?.sub_service == 'LA Counties Mapping of Oil and Gas Lease Documents-OpEx' || inObj[0]?.sub_service == 'LA Counties Mapping of Oil and Gas Lease Documents-CapEx' || inObj[0]?.sub_service == 'NA Land PLSS Mapping of Oil and Gas Lease Documents-OpEx' || inObj[0]?.sub_service == 'NA Land PLSS Mapping of Oil and Gas Lease Documents-CapEx' || inObj[0]?.sub_service ==  'Texas Parcel Mapping of Oil and Gas Lease Documents-CapEx' || inObj[0]?.sub_service == 'Texas Parcel Mapping of Oil and Gas Lease Documents-OpEx'){
                    this.projectionReport[375].actual_value = Number(this.projectionReport[375].actual_value) + Number(this.projectionReport[inObj[0].ind].actual_value)
                  //}
                }

                //------------------------Part 39 End Texas Parcel Mapping of Oil and Gas----------------


                //------------------------Part 40 US Land - Units Mapping -------------------------------
                if(inObj[0]?.sub_service ==  'US Land - Units Mapping'){
                  //console.log('I am checking Texas Parcel --->', inObj)
                  uspbill = inObj;
                  var totVal = 0;
                  var calVal;
                  uspbill.forEach((i, idx) => {
                    if(idx > 1){
                      var calVal = i.unit_rate;
                     // console.log("Testing 1--->", totVal);
                      if(calVal > 0)
                        calVal = Number(calVal);
                        totVal = Number(totVal) + Number(calVal * i.actual_value);
                    }
                  });

                  this.projectionReport[inObj[1].ind].actual_value = this.round(totVal,2);
                  this.projectionReport[375].actual_value = Number(this.projectionReport[375].actual_value) + Number(this.projectionReport[inObj[1].ind].actual_value)
                }

                //------------------------Part 40 End US Land - Units Mapping -------------------------------

                //------------------------Part 41 US Land - Units Mapping -------------------------------
                if(inObj[0]?.sub_service ==  'Investor Presentations - Polygon Data Capture '){
                  //console.log('I am checking Texas Parcel --->', inObj)
                  uspbill = inObj;
                  var totVal = 0;
                  var calVal;
                  uspbill.forEach((i, idx) => {
                    if(idx >= 1){
                      var calVal = i.unit_rate;
                      //console.log("Testing 1--->", calVal);
                      if(calVal > 0)
                        calVal = Number(calVal);
                        totVal = Number(totVal) + Number(calVal * i.actual_value);
                    }
                  });


                  this.projectionReport[inObj[0].ind].actual_value = this.round(totVal,2);
                  this.projectionReport[375].actual_value = Number(this.projectionReport[375].actual_value) + Number(this.projectionReport[inObj[0].ind].actual_value)
                }


                //Part 4
                if(inObj[0]?.sub_service == 'Application outage' && inObj[0]?.ind == 284){
                  if(inObj[0]?.sub_service == 'Application outage'){
                   this.projectionReport[284].actual_value = Number(this.projectionReport[284].actual_value) + Number(this.projectionReport[inObj[0].ind].actual_value)
                   this.projectionReport[422].actual_value = Number(this.projectionReport[422].actual_value) + Number(this.projectionReport[284].actual_value)
                  }
                }

                if(inObj[1]?.sub_service == 'Credit Reductions' && inObj[1]?.ind == 285){
                  this.projectionReport[285].actual_value = Number(this.projectionReport[285].actual_value) + Number(this.projectionReport[inObj[1].ind].actual_value)
                  this.projectionReport[424].actual_value = Number(this.projectionReport[424].actual_value) + Number(this.projectionReport[285].actual_value)
                }

                if(inObj[2]?.sub_service == 'Gain Sharing' && inObj[2]?.ind == 286){
                 this.projectionReport[286].actual_value = Number(this.projectionReport[286].actual_value) + Number(this.projectionReport[inObj[2].ind].actual_value)
                 this.projectionReport[426].actual_value = Number(this.projectionReport[426].actual_value) + Number(this.projectionReport[286].actual_value)
                }

                if(inObj[3]?.sub_service == 'Delta Billing' && inObj[3]?.ind == 287){
                 this.projectionReport[287].actual_value = Number(this.projectionReport[287].actual_value) + Number(this.projectionReport[inObj[3].ind].actual_value)
                 this.projectionReport[428].actual_value = Number(this.projectionReport[428].actual_value) + Number(this.projectionReport[287].actual_value)
                }

                //Part 5
              if(inObj[0]?.sub_service == 'Application outage' && inObj[0]?.ind == 371){
                if(inObj[0]?.sub_service == 'Application outage'){
                 this.projectionReport[375].actual_value = Number(this.projectionReport[375].actual_value) + Number(this.projectionReport[inObj[0].ind].actual_value)
                 this.projectionReport[422].actual_value = Number(this.projectionReport[422].actual_value) + Number(this.projectionReport[375].actual_value)
                }
              }

              if(inObj[1]?.sub_service == 'Credit Reductions' && inObj[1]?.ind == 372){
                this.projectionReport[375].actual_value = Number(this.projectionReport[375].actual_value) + Number(this.projectionReport[inObj[1].ind].actual_value)
                this.projectionReport[424].actual_value = Number(this.projectionReport[424].actual_value) + Number(this.projectionReport[375].actual_value)
              }

              if(inObj[2]?.sub_service == 'Gain Sharing' && inObj[2]?.ind == 373){
               this.projectionReport[375].actual_value = Number(this.projectionReport[375].actual_value) + Number(this.projectionReport[inObj[2].ind].actual_value)
               this.projectionReport[426].actual_value = Number(this.projectionReport[426].actual_value) + Number(this.projectionReport[375].actual_value)
              }

              if(inObj[3]?.sub_service == 'Delta Billing' && inObj[3]?.ind == 374){
               this.projectionReport[375].actual_value = Number(this.projectionReport[375].actual_value) + Number(this.projectionReport[inObj[3].ind].actual_value)
               this.projectionReport[428].actual_value = Number(this.projectionReport[428].actual_value) + Number(this.projectionReport[375].actual_value)
              }

                //------------------------Part 41 End US Land - Units Mapping -------------------------------


                if(inObj[0]?.sub_service ==  'IHS Chemicals - PFD'){
                  //console.log('I am checking Texas Parcel --->', inObj)
                  uspbill = inObj;
                  var totVal = 0;
                  uspbill.forEach((i, idx) => {
                    if(idx > 1){
                      var calVal = i.unit_rate;
                     // console.log("Testing 1--->", totVal);
                      if(calVal > 0)
                        calVal = Number(calVal);
                        totVal = Number(totVal) + Number(calVal * i.actual_value);
                    }
                  });

                  this.projectionReport[inObj[0].ind].actual_value = this.round(totVal,2);
                  this.projectionReport[392].actual_value = Number(this.projectionReport[392].actual_value) + Number(this.projectionReport[inObj[0].ind].actual_value)
                }


                  //------------------------Part 42 IHS Chemicals - DCP & Chemical Assets ----------------
                  if(inObj[0]?.sub_service == 'IHS Chemicals - DCP & Chemical Assets'){
                    //console.log('I am checking--->', inObj[1]?.sub_service)
                    uspbill = inObj;
                    var totVal = 0;
                    var calVal;
                    // uspbill.forEach((i, idx) => {
                    //   if(idx >= 1){
                    //     totVal = totVal + i.actual_value;
                    //   }
                    // });
                    //this.projectionReport[uspbill[1].ind].actual_value = totVal;

                    //if(uspbill[1].unit_rate_fte != undefined){
                      if(uspbill[1].actual_value >= 1 && uspbill[1].actual_value < 10){
                          calVal = uspbill[1].unit_rate_fte['1FTE'];
                          console.log('Selected val-->', calVal)
                          calVal = Number(calVal);
                      }else if(uspbill[1].actual_value >= 10 && uspbill[1].actual_value < 50){
                        calVal = uspbill[1].unit_rate_fte['>10FTE'];
                        calVal = Number(calVal);
                      }else if(uspbill[1].actual_value >= 50 && uspbill[1].actual_value < 60){
                        calVal = uspbill[1].unit_rate_fte['>50FTE'];
                        calVal = Number(calVal);
                      }else if(uspbill[1].actual_value >= 60 && uspbill[1].actual_value < 150){
                        calVal = uspbill[1].unit_rate_fte['>60FTE'];
                        calVal = Number(calVal);
                      }else if(uspbill[1].actual_value >= 150){
                        calVal = uspbill[1].unit_rate_fte['>150FTE'];
                        calVal = Number(calVal);
                      }
                    //}
                    this.projectionReport[uspbill[0].ind].actual_value = this.projectionReport[uspbill[1].ind].actual_value * calVal;
                    this.projectionReport[421].actual_value = Number(this.projectionReport[421].actual_value) + Number(this.projectionReport[inObj[0].ind].actual_value)
                    this.projectionReport[392].actual_value = Number(this.projectionReport[392].actual_value) + Number(this.projectionReport[inObj[1].ind].actual_value)
                  }
                  //------------------------Part 42 End IHS Chemicals - DCP & Chemical Assets ----------------

                  if(inObj[0]?.sub_service == 'Application outage' && inObj[0]?.ind == 388){
                    if(inObj[0]?.sub_service == 'Application outage'){
                     this.projectionReport[392].actual_value = Number(this.projectionReport[392].actual_value) + Number(this.projectionReport[inObj[0].ind].actual_value)
                     this.projectionReport[422].actual_value = Number(this.projectionReport[422].actual_value) + Number(this.projectionReport[392].actual_value)
                    }
                  }

                  if(inObj[1]?.sub_service == 'Credit Reductions' && inObj[1]?.ind == 389){
                    this.projectionReport[392].actual_value = Number(this.projectionReport[392].actual_value) + Number(this.projectionReport[inObj[1].ind].actual_value)
                    this.projectionReport[424].actual_value = Number(this.projectionReport[424].actual_value) + Number(this.projectionReport[392].actual_value)
                  }

                  if(inObj[2]?.sub_service == 'Gain Sharing' && inObj[2]?.ind == 390){
                   this.projectionReport[392].actual_value = Number(this.projectionReport[392].actual_value) + Number(this.projectionReport[inObj[2].ind].actual_value)
                   this.projectionReport[426].actual_value = Number(this.projectionReport[426].actual_value) + Number(this.projectionReport[392].actual_value)
                  }

                  if(inObj[3]?.sub_service == 'Delta Billing' && inObj[3]?.ind == 391){
                   this.projectionReport[392].actual_value = Number(this.projectionReport[392].actual_value) + Number(this.projectionReport[inObj[3].ind].actual_value)
                   this.projectionReport[428].actual_value = Number(this.projectionReport[428].actual_value) + Number(this.projectionReport[392].actual_value)
                  }


                   //------------------------Part 43 US Land - Units Mapping -------------------------------
                if(inObj[0]?.sub_service == 'Image Georeferencing' || inObj[0]?.sub_service == 'US Wells' || inObj[0]?.sub_service == 'Graph Transcription Project' || inObj[0]?.sub_service == 'Actioned items' || inObj[0]?.sub_service ==  'PETRODATA PROJECT'){
                  //console.log('I am checking Texas Parcel --->', inObj)
                  uspbill = inObj;
                  var totVal = 0;
                  var calVal;
                  uspbill.forEach((i, idx) => {
                    if(idx >= 1){
                      var calVal = i.unit_rate;
                      //console.log("Testing 1--->", calVal);
                      if(calVal > 0)
                        calVal = Number(calVal);
                        totVal = Number(totVal) + Number(calVal * i.actual_value);
                    }
                  });


                  this.projectionReport[inObj[0].ind].actual_value = this.round(totVal,2);
                  this.projectionReport[420].actual_value = Number(this.projectionReport[420].actual_value) + Number(this.projectionReport[inObj[0].ind].actual_value)
                }


                if(inObj[0]?.sub_service == 'Application outage' && inObj[0]?.ind == 418){
                  if(inObj[0]?.sub_service == 'Application outage'){
                   this.projectionReport[420].actual_value = Number(this.projectionReport[420].actual_value) + Number(this.projectionReport[inObj[0].ind].actual_value)
                   this.projectionReport[422].actual_value = Number(this.projectionReport[422].actual_value) + Number(this.projectionReport[420].actual_value)
                  }
                }

                if(inObj[1]?.sub_service == 'Delta Billing' && inObj[1]?.ind == 419){
                 this.projectionReport[420].actual_value = Number(this.projectionReport[420].actual_value) + Number(this.projectionReport[inObj[1].ind].actual_value)
                 this.projectionReport[428].actual_value = Number(this.projectionReport[428].actual_value) + Number(this.projectionReport[420].actual_value)
                }


                //------------------------Part 43 End US Land - Units Mapping -------------------------------


                inObj.forEach((i, idx) => {
                  if(inObj[idx]?.ind == 430){
                    this.projectionReport[430].actual_value = (Number(this.projectionReport[168].actual_value) + Number(this.projectionReport[198].actual_value) + Number(this.projectionReport[246].actual_value) + Number(this.projectionReport[284].actual_value) + Number(this.projectionReport[375].actual_value) + Number(this.projectionReport[392].actual_value) + Number(this.projectionReport[420].actual_value) - Number(this.projectionReport[424].actual_value));
                  }
                });

              }
              inObj = [];
            }

            //console.log('Blocks --->', inObj)
          });

          localStorage.setItem('projectionObj', JSON.stringify(this.projectionReport));
          this.spinner.hide();
        }else{
          this.Apiservice.get('Projections/GetProjectionsData').subscribe((data: any) => {
            //console.log('Employee Details --->', data);
            this.globalConst.checkOriginAccess(data);

            if(data.length > 0){
              this.projectionReport = data;
              localStorage.setItem('projectionObj', JSON.stringify(data));
            }

            this.spinner.hide();
        });
        }
  }

  //Round Flot value
  round(value, exp) {
    if (typeof exp === 'undefined' || +exp === 0)
      return Math.round(value);

    value = +value;
    exp = +exp;

    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0))
      return NaN;

    // Shift
    value = value.toString().split('e');
    value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp)));

    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp));
  }

 //Part 2 type calculation
  indrirectCalculationPart2(uspbill){
    var totFTE = this.projectionReport.filter(element => {
      if(element.sub_service == 'Total Billable FTE Count'){
        return element;
      }
    });

    totFTE = totFTE[0].actual_value

    if(uspbill[0]?.sub_service == 'International Production - Billable FTE Count'){
      var totlVal = 0;
      //console.log('Type --->', uspbill[0]?.sub_service);
      uspbill.forEach((i, idx) => {
        if(idx > 0){
          //console.log('Start with totl FTE --->', totFTE);
          //console.log('Each Loop--->', i);
          //console.log('Each Loop--->', i.unit_rate_fte) ;
          if(totFTE > 1 && totFTE <= 10 && i.unit_rate_fte != undefined){
            var urval = i.unit_rate_fte['1 FTE'];
          }else if(totFTE > 10 && totFTE <=50 && i.unit_rate_fte != undefined){
            var urval = i.unit_rate_fte['> 10 FTE'];
          }else if(totFTE > 50 && totFTE <=60 && i.unit_rate_fte != undefined){
            var urval = i.unit_rate_fte['> 50 FTE'];
          }else if(totFTE > 60 && totFTE <=150 && i.unit_rate_fte != undefined){
            var urval = i.unit_rate_fte['> 60 FTE'];
          }else if(totFTE > 150 && i.unit_rate_fte != undefined){
            var urval = i.unit_rate_fte['> 150 FTE'];
          }

          if(urval != undefined){
            urval = Number(urval.replace(/[^0-9 ]/g, ''));
            var ubil = i.actual_value;
            var finalVal = ubil * urval;
            //console.log("Bill -->",ubil);
            //console.log("Rev -->",urval);
            //console.log("Rev tot -->",finalVal);
            totlVal = totlVal + finalVal;
          }
        }

        this.projectionReport[421].actual_value = Number(this.projectionReport[421].actual_value) + Number(this.projectionReport[uspbill[idx].ind].actual_value)
      });
      this.projectionReport[uspbill[0].ind].actual_value = totlVal;
      if(uspbill[0].sub_service = 'International Production - Billable FTE Count'){
        this.projectionReport[168].actual_value = Number(this.projectionReport[168].actual_value) + Number(this.projectionReport[uspbill[0].ind].actual_value)

      }


    }

      if(totlVal > 0){
        this.projectionReport[uspbill[0].ind].actual_value = totlVal;
      }else{
        this.projectionReport[uspbill[0].ind].actual_value = 0;
      }
  }


  indrirectCalculation(uspbill,selObj){
    var totFTE = this.projectionReport.filter(element => {
      if(element.sub_service == 'Total Billable FTE Count'){
        return element;
      }
    });
      totFTE = totFTE[0].actual_value

      if(uspbill[0]?.sub_service == 'Desktop Publishing - Billable FTE Count'){
      var totlVal = 0;
      var ubTotl = 0;
      //console.log('Type --->', uspbill[0]?.sub_service);
      selObj.forEach((i, idx) => {
        if(idx > 0){
          //console.log('Start with totl FTE --->', totFTE);
          //console.log('Each Loop--->', i);
          //console.log('Each Loop--->', i.unit_rate_fte) ;
          if(totFTE > 1 && totFTE <= 10 && i.unit_rate_fte != undefined){
            var urval = i.unit_rate_fte['1 FTE'];
          }else if(totFTE > 10 && totFTE <=50 && i.unit_rate_fte != undefined){
            var urval = i.unit_rate_fte['> 10 FTE'];
          }else if(totFTE > 50 && totFTE <=60 && i.unit_rate_fte != undefined){
            var urval = i.unit_rate_fte['> 50 FTE'];
          }else if(totFTE > 60 && totFTE <=150 && i.unit_rate_fte != undefined){
            var urval = i.unit_rate_fte['> 60 FTE'];
          }else if(totFTE > 150 && i.unit_rate_fte != undefined){
            var urval = i.unit_rate_fte['> 150 FTE'];
          }

          if(urval != undefined){
            urval = Number(urval.replace(/[^0-9 ]/g, ''));
            var ubil = uspbill[idx].actual_value;
            var finalVal = ubil * urval;
            //console.log("Bill -->",ubil);
            //console.log("Rev -->",urval);
            //console.log("Rev tot -->",finalVal);
            i.unit_rate = finalVal;
            totlVal = totlVal + finalVal;
            ubTotl = ubTotl + ubil;
            //console.log("Sub Total -->",totlVal);
            this.projectionReport[i.ind].actual_value = finalVal;
          }
        }
      });

      var upVal = selObj.length - 1;
      var ubVal = uspbill.length -1;
        if(totlVal > 0){
          this.projectionReport[selObj[upVal].ind].actual_value = totlVal;
          this.projectionReport[uspbill[ubVal].ind].actual_value = ubTotl;
        }else{
          this.projectionReport[selObj[upVal].ind].actual_value = 0;
        }
      }

  }




  //Common calculations
  getCommonCal(inObj){
    var totVal = 0;

    inObj.forEach((x,ind) => {
        if(ind > 0){
          var calval = x.actual_value * x.unit_rate;
          totVal = totVal+calval
        }
    });

    var finalVal = totVal;
    this.projectionReport[inObj[0].ind].actual_value = finalVal.toFixed(2);
    if(inObj[0]?.sub_service == 'US Fluid Analsis' || inObj[0]?.sub_service == 'Refracs' || inObj[0]?.sub_service == 'RigSpec' || inObj[0].sub_service == 'AFE  Project  (Authorization For Expenditure)' || inObj[0].sub_service == 'API14 Matching Project' || inObj[0].sub_service == 'NA Data Processing (Well Data Services - Core Analysis)' || inObj[0].sub_service == 'Core Project 1'){
      if(Number(this.projectionReport[inObj[0].ind].actual_value) > 0)
        this.projectionReport[168].actual_value = Number(this.projectionReport[168].actual_value) + Number(this.projectionReport[inObj[0].ind].actual_value)
    }
  }

  //tot billable FTE value
  getTotalFTE(){
    var totFTE = this.projectionReport.filter(element => {
      if(element.sub_service == 'Total Billable FTE Count'){
        return element;
      }
    });
    return totFTE
  }

  //Part 1 type calculation
  getUnitVal(uspbill){
    var totFTE = this.getTotalFTE();
    totFTE =  totFTE[0].actual_value;

    //console.log('get val --->', uspbill);
    var i = uspbill;

      if(totFTE > 1 && totFTE <= 10 && i.unit_rate_fte != undefined){
        var urval = i.unit_rate_fte['1 FTE'];
      }else if(totFTE > 10 && totFTE <=50 && i.unit_rate_fte != undefined){
        var urval = i.unit_rate_fte['> 10 FTE'];
      }else if(totFTE > 50 && totFTE <=60 && i.unit_rate_fte != undefined){
        var urval = i.unit_rate_fte['> 50 FTE'];
      }else if(totFTE > 60 && totFTE <=150 && i.unit_rate_fte != undefined){
        var urval = i.unit_rate_fte['> 60 FTE'];
      }else if(totFTE > 150 && i.unit_rate_fte != undefined){
        var urval = i.unit_rate_fte['> 150 FTE'];
      }

      if(urval != undefined && urval != ''){
        urval = Number(urval.replace(/[^0-9 ]/g, ''));
        return urval;
      }

  }

  onKeyUpEvent(ev){
    console.log(this.projectionReport);
  }


  getHeader(val,sval){
    if(val == ''){
      return true;
    }else if(sval == 'Management Services Fee Resource-Based'){
      return true;
    }else if(sval == 'Permits / Manual & Data Loader Permits'){
      return true;
    }else if(sval == 'Audits / Drilling Reports & Notices / Sundries / Per Update'){
      return true;
    }else if(sval == 'Frac Focus (WISER)'){
      return true;
    }else if(sval == 'Blank'){
      return true;
    }
  }
}
