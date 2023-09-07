import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Api/api.service';
import { NgxSpinnerService } from "ngx-spinner";
import { GlobalConstants } from '../../common/global-constants';

@Component({
  selector: 'app-checklistmodal',
  templateUrl: './checklistmodal.component.html',
  styleUrls: ['./checklistmodal.component.scss']
})
export class ChecklistmodalComponent implements OnInit {
  @Input() fromParent;

  selectedRow = [];
  selectedInd = '';
  selectedstp = '';
  rowchklist = [];
  chkindexs = [];

  empName  = localStorage.getItem("Name");
  empId = localStorage.getItem("LoginId");
  curDate = new Date().toISOString().slice(0, 10)
  constructor(public globalConst: GlobalConstants,private spinner: NgxSpinnerService,public activeModal: NgbActiveModal,private Apiservice: ApiService) { }

  ngOnInit(): void {
    this.spinner.show();
    this.selectedRow = [];
    this.selectedInd = '';
    this.selectedstp = '';
    this.rowchklist = [];

    console.log(this.fromParent);

    if(this.fromParent.rowdt){
      console.log('Form Vals -->', this.fromParent);
      this.selectedRow = this.fromParent.rowdt;
      this.selectedInd = this.fromParent['rowind'];
      this.selectedstp = this.fromParent['rowstp'];
      var stepId = this.selectedstp;
    }

    var userId = localStorage.getItem('LoginId');

    this.Apiservice.get('Checklist/GetCheckList?workstream='+this.selectedRow['workstream']+'&services='+this.selectedRow['service']+'&state='+this.selectedRow['batch']+'&empId='+userId+'&stepId='+this.selectedstp).subscribe((data: any) => {
        console.log('Check List resp 1-->', data)
        this.globalConst.checkOriginAccess(data);

        if(data.length > 0 && data[0]['approvedCheckList']){
          //alert(stepId)
          this.rowchklist = data[0]['approvedCheckList'].filter(function (el) {
              return el.tasktype == stepId;
          });

          if(this.rowchklist.length > 0){
            this.checkAll2(this.selectedRow['chk']);
          }
          console.log('Chk List final ---s->', this.rowchklist);
        }


        this.spinner.hide();
    });
    console.log('Get Row-->', this.selectedRow);

  }

  closeModal(bnttyp) {
    if(bnttyp == 'save'){

      var rslt = {
        mainrow : this.selectedRow,
        mainind : this.fromParent['rowind'],
        rowchklist : this.rowchklist
      }

      this.activeModal.close(rslt);
    }else{
      this.activeModal.close('');
    }
  }

  checkAll(ev,ind){
    if(ev.target.checked == true){
      this.rowchklist.forEach(y => {
        y.chk = 'Yes';
      });
      this.selectedRow['chk'] = 'Yes';
    }else{
      this.rowchklist.forEach(y => {
        y.chk = 'No';
      });
      this.selectedRow['chk'] = 'No';
    }
      console.log('Checkall Main Obj -->', this.selectedRow);
  }


  checkAll2(ev){
    if(ev == 'Yes'){
      this.rowchklist.forEach(y => {
        y.chk = 'Yes';
      });
      this.selectedRow['chk'] = 'Yes';
    }else{
      this.rowchklist.forEach(y => {
        y.chk = 'No';
      });
      this.selectedRow['chk'] = 'No';
    }
      console.log('Checkall Main Obj -->', this.selectedRow);
  }

  chkSelect(ev,ind,subind){
    if(ev.target.checked == true){
      var noChk = 0;
      this.rowchklist[subind]['chk'] = 'Yes';
      this.rowchklist.forEach(y => {
        if(y['chk'] == 'No')
          noChk = 1
      });
      if(noChk == 1){
        this.selectedRow['chk'] = 'No';
      }
    }else{
      this.rowchklist[subind].chk = 'No';
      this.selectedRow['chk'] = 'No';
    }
    console.log('Single Chk Main Obj -->', this.selectedRow);
  }

}
