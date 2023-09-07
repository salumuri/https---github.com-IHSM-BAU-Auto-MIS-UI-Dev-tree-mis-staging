import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Api/api.service';
import { NgxSpinnerService } from "ngx-spinner";
import { GlobalConstants } from '../../common/global-constants';

@Component({
  selector: 'app-external-feedback-errorlist',
  templateUrl: './external-feedback-errorlist.component.html',
  styleUrls: ['./external-feedback-errorlist.component.scss']
})
export class ExternalFeedbackErrorlistComponent implements OnInit {
  @Input() fromParent;
  selectedRow : any;
  listOfErrors : any = [];
  serviceChk : any = false;
  userTyp : any;

  constructor(public globalConst: GlobalConstants,private spinner: NgxSpinnerService,public activeModal: NgbActiveModal,private Apiservice: ApiService) { }

  ngOnInit(): void {
    if(this.fromParent['rowdt']){
      console.log('Rec Dt ---> ', this.fromParent['rowdt'])
      this.selectedRow = this.fromParent['rowdt'];
      this.userTyp = this.fromParent['userTyp']
      console.log('Rec Dt 2---> ', this.selectedRow)
      this.getFeedbackListDetals(this.selectedRow);
    }
  }
  getFeedbackListDetals(qcrow){
    console.log('Selected Row -->', qcrow)
    this.spinner.show();

    this.Apiservice.get('Feedback/GetMoreFeedback?qcID='+qcrow.qcID+'&workstream='+qcrow.workstream+'&service='+qcrow.service+'&map='+qcrow.map_name+'&step=178').subscribe((data: any) => {
      console.log('Breckup list -->',data);
      this.globalConst.checkOriginAccess(data);

      this.listOfErrors = data;
      if(data.length > 0){
        this.serviceChk = true;
      }
      this.spinner.hide();
    });
    this.spinner.hide();
  }
  closeModal(bnttyp) {  
    if (bnttyp=='close')
    {

      this.Apiservice.get('Feedback/ExternalFeedbackStatus?qcID='+this.selectedRow.qcID+'&workstream='+this.selectedRow.workstream+'&service='+this.selectedRow.service+'&map='+this.selectedRow.map_name).subscribe((data: any) => {        
        this.globalConst.checkOriginAccess(data);        
               
      });
      this.activeModal.close('No');
    }
    else{
      this.activeModal.close('No'); 
    }
        
  }

}
