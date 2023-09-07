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
import { forEach } from 'core-js/core/array';
import { NgbModal, ModalDismissReasons, NgbActiveModal, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { GlobalConstants } from '../../common/global-constants';


@Component({
  selector: 'app-feedback-errors',
  templateUrl: './feedback-errors.component.html',
  styleUrls: ['./feedback-errors.component.scss']
})
export class FeedbackErrorsComponent implements OnInit {
  respArry = {
    'feedbackList' : []
  }
  constructor(public globalConst: GlobalConstants,private spinner: NgxSpinnerService,public activeModal: NgbActiveModal,private Apiservice: ApiService) {
  }

  ngOnInit(): void {
  }


  closeModal(bnttyp) {
    if(bnttyp == 'save'){

      var rslt = {
        postObj : this.respArry
      }

      console.log('Feedback--->', rslt);
      this.activeModal.close(rslt);
    }
    else{
      this.activeModal.close('');
    }
  }

}
