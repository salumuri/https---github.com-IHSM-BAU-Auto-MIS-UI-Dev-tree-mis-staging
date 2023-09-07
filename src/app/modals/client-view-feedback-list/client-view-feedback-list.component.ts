import { NgModule, Component, OnInit,ViewEncapsulation, ViewChild, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
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
import { forEach } from 'core-js/core/array';
import { NgbModal, ModalDismissReasons, NgbActiveModal, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { GlobalConstants } from 'app/common/global-constants';

@Component({
  selector: 'app-client-view-feedback-list',
  templateUrl: './client-view-feedback-list.component.html',
  styleUrls: ['./client-view-feedback-list.component.scss']
})
export class ClientViewFeedbackListComponent implements OnInit {

  @Input() fromParent;
  selectedRow : any = '';
  subAction : any = false;
  respData : any;
  workstream : any;

  constructor(public globalConst: GlobalConstants,private spinner: NgxSpinnerService,public activeModal: NgbActiveModal,private Apiservice: ApiService) { }

  ngOnInit(): void {
   // alert('Hello..!')
    console.log('Req Dt -->', this.fromParent)
    if(this.fromParent['rowdt']){
      console.log('Rec Dt ---> ', this.fromParent['rowdt']);

      this.selectedRow = this.fromParent['rowdt'];
      this.workstream = this.fromParent['wstream'];
      var givendt = this.formatDate(this.selectedRow.givenDate);
      var fromdt = this.formatDate(this.selectedRow.fromDate);
      var todt = this.formatDate(this.selectedRow.todate);

      this.Apiservice.get('ClientBasic/GetClientRatings?feedbackno='+this.selectedRow.feedbackno+'&feedback_type='+this.selectedRow.feedbacktype.toString()+
      '&wid='+this.workstream.toString()+'&give_id='+this.selectedRow.givenbyid.toString()+'&given_date='+givendt+
      '&fromdate='+fromdt+'&todate='+todt).subscribe((data: any) => {
        //this.Apiservice.get('ClientBasic/GetViewFeedback?given_id='+formObj.ffrom.toString()+'&wid='+formObj.wsname.toString()+'&type='+formObj.ftyle.toString()+'&fromdate=2023-02-27&todate=2023-03-03').subscribe((data: any) => {
          this.globalConst.checkOriginAccess(data);

          this.spinner.hide();
          console.log('Feedback Data -->',data);
          this.respData = data;
          if(this.respData.length > 0)
              this.respData;
          this.subAction = true;
      });

      this.subAction = true;
    }
  }


    //Format Date
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

  closeModal(bnttyp) {
    if(bnttyp == 'save'){

    }
    else{
      this.activeModal.close('');
    }
  }

}
