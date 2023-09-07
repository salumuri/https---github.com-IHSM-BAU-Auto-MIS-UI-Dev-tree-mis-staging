import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Api/api.service';
import { NgxSpinnerService } from "ngx-spinner";
import { GlobalConstants } from '../../common/global-constants';

@Component({
  selector: 'app-feedback-error-list',
  templateUrl: './feedback-error-list.component.html',
  styleUrls: ['./feedback-error-list.component.scss']
})
export class FeedbackErrorListComponent implements OnInit {

  @Input() fromParent;
  selectedRow : any;
  listOfErrors : any = [];
  serviceChk : any = false;
  userTyp : any;
  sltshift : any = 'WFH';
  timeentry : any = '';

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


  //Getting List of Feedabck for Maps
  getFeedbackListDetals(qcrow){
    console.log('Selected Row -->', qcrow)
    this.spinner.show();

    this.Apiservice.get('Feedback/GetMoreFeedback?qcID='+qcrow.qcID+'&workstream='+qcrow.workstream+'&service='+qcrow.service+'&map='+qcrow.map_name+'&step='+qcrow.qcStep).subscribe((data: any) => {
      console.log('Breckup list -->',data);
      this.globalConst.checkOriginAccess(data);

      this.listOfErrors = data;
      // this.listOfErrors = [];
      // this.serviceChk = false;
      if(data.length > 0){
        this.serviceChk = true;
      }
      this.spinner.hide();
    });
  }



  closeModal(bnttyp) {
    if(bnttyp == 'save'){
      var myObj = {
        recordStatus : 'Ok',
        timeentry : this.timeentry,
        shift : this.sltshift
      }
      this.activeModal.close(myObj);
    }else{
      this.activeModal.close('No');
    }
  }



}
