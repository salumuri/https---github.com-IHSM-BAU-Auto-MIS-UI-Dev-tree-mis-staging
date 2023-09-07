import { NgModule, Component, OnInit,ViewEncapsulation, ViewChild, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { ApiService } from '../../Api/api.service';
import { NgxSpinnerService } from "ngx-spinner";
import { NgbModal, ModalDismissReasons, NgbActiveModal, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { GlobalConstants } from 'app/common/global-constants';

@Component({
  selector: 'app-workflow-single-map',
  templateUrl: './workflow-single-map.component.html',
  styleUrls: ['./workflow-single-map.component.scss']
})
export class WorkflowSingleMapComponent implements OnInit {
  @Input() fromParent;
  selectedRow : any;
  subAction : any = false;
  dataResponse : any = [];
  constructor(public globalConst: GlobalConstants,private spinner: NgxSpinnerService,public activeModal: NgbActiveModal,private Apiservice: ApiService) { }

  ngOnInit(): void {
    console.log('Req Dt -->', this.fromParent)
    if(this.fromParent['rowdt']){
      console.log('Rec Dt ---> ', this.fromParent['rowdt']);

      this.selectedRow = this.fromParent['rowdt'];
      var searchRow = this.fromParent['searchfm'];
      console.log(this.selectedRow);

      this.Apiservice.get('Masters/GetCountOfWorkFlow_Map_info_bulk?wid='+this.selectedRow.wid+'&map='+this.selectedRow.map+
      '&service='+this.selectedRow.sid+'&batch='+this.selectedRow.bid+
      '&step='+this.selectedRow.current_step).subscribe((data: any) => {
        console.log(' Resp --->', data);
        this.dataResponse = data;
        this.subAction = true;
      });
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
