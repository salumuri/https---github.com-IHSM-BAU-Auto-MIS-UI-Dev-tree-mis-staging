import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Api/api.service';
import { NgxSpinnerService } from "ngx-spinner";
import Swal from 'sweetalert2';
import { ExcelService } from 'app/Api/ExcelService';
import { GlobalConstants } from 'app/common/global-constants';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-maperror',
  templateUrl: './maperror.component.html',
  styleUrls: ['./maperror.component.scss']
})
export class MaperrorComponent implements OnInit {
  @Input() fromParent;
  errorData: any='';
  objList=[];
  page1:any=1;
  sumerror; document;
  show: boolean;
  tableshow: boolean = false;
  excel1 = 'assets/img/icons/excel1.png'
  constructor(public globalConst: GlobalConstants, private spinner: NgxSpinnerService, public activeModal: NgbActiveModal, private Apiservice: ApiService, private excelService: ExcelService) { }

  ngOnInit(): void {
    console.log(this.fromParent);
    this.getErrorList();
  }

  getErrorList() {
    if (this.fromParent.modws == '' || this.fromParent.modtdt == '' || this.fromParent.modfdt == '') {
      this.swapAlerts('Please select Mandatory Fields.!')
    }
    else {
      console.log(this.fromParent)
      this.spinner.show();

      if (this.fromParent.modws != '' && this.fromParent.modse != '' && this.fromParent.modbt != '') {
        this.Apiservice.get('Tower/GetErrorReport?ws=' + this.fromParent.modws + '&service=' + this.fromParent.modse +
          '&batch=' + this.fromParent.modbt + '&fromDt=' + this.fromParent.modfdt + '&toDt=' + this.fromParent.modtdt + '&error=' + this.fromParent.modind).subscribe((data: any) => {
            console.log('error Report --->', data);
            this.globalConst.checkOriginAccess(data);

            this.errorData = data;
            if (data.length > 0) {
              this.sumerror = data[0].sumerror;
              this.document = data[0].documentcount;
              this.spinner.hide();
              this.tableshow == true;
            } else {
              this.spinner.hide();
              this.tableshow == true;
            }
          });
      }

      else if (this.fromParent.modws != '' && this.fromParent.modse != '' && this.fromParent.modbt == '') {
        this.Apiservice.get('Tower/GetErrorReport?ws=' + this.fromParent.modws + '&service=' + this.fromParent.modse + '&batch=' + 'bt' + '&fromDt=' + this.fromParent.modfdt + '&toDt=' + this.fromParent.modtdt + '&error=' + this.fromParent.modind).subscribe((data: any) => {
          console.log(this.fromParent)
          console.log('error Report --->', data);
          this.globalConst.checkOriginAccess(data);

          this.errorData = data;
          if (data.length > 0) {
            this.sumerror = data[0].sumerror;
            this.document = data[0].documentcount;
            this.spinner.hide();
            this.tableshow == true;
          } else {
            this.spinner.hide();
            this.tableshow == true;
          }

        });

      }
      else {
        this.Apiservice.get('Tower/GetErrorReport?ws=' + this.fromParent.modws + '&service=' + 'bt' + '&batch=' + 'bt' + '&fromDt=' + this.fromParent.modfdt + '&toDt=' + this.fromParent.modtdt + '&error=' + this.fromParent.modind).subscribe((data: any) => {
          console.log('error Report --->', data);
          this.globalConst.checkOriginAccess(data);

          this.errorData = data;
          if (data.length > 0) {
            this.sumerror = data[0].sumerror;
            this.document = data[0].documentcount;
            this.spinner.hide();
            this.tableshow == true;
          } else {
            this.spinner.hide();
            this.tableshow == true;
          }
        });

      }
    }

  }
  swapAlerts(msg) {
    return Swal.fire({
      icon: 'error', title: 'Oops...', text: msg,
      customClass: {
        confirmButton: 'btn btn-danger'
      },
      buttonsStyling: false
    }).then(function () {
      return false;
    });
  }
  closeModal(bnttyp) {
    this.activeModal.close('');
  }
  exportAsXLSX(): void {
    var errordetObj={};
    
    if (this.errorData.length > 0) {
      
      for (let s = 0; s <= this.errorData.length -1; s++)
      {
        errordetObj =
        {
          'Workstream': this.errorData[s]?.['w_name'],
          'Service': this.errorData[s]?.['service_name'],
          'Sub Service': this.errorData[s]?.['batch_name'],
          'Record Type': this.errorData[s]?.['mapType'],
          'Record': this.errorData[s]?.['map'],
          'Date': formatDate(this.errorData[s]?.['date'], 'yyyy-MM-dd', 'en'),
          'Error Number': this.errorData[s]?.['errorNo'],
          'Error Description': this.errorData[s]?.['errorDesc'],
          'Error Count': this.errorData[s]?.['errorcount'],
          'Feedback For Step': this.errorData[s]?.['feedbackstep'],
          'Feedback To': this.errorData[s]?.['feedbackTo'],
          'Feedback To Associate': this.errorData[s]?.['feedbcname'],
          'Done By': this.errorData[s]?.['doneBy'],
          'Done By Associate': this.errorData[s]?.['qcdone'],
          'Acceptance': this.errorData[s]?.['acceptance'],
          'Qual Per': this.errorData[s]?.['qual_per'],
          'Feedback Type': this.errorData[s]?.['feedback_type'],
          'Remarks': this.errorData[s]?.['remarks'],
        }
        
        this.objList.push(errordetObj);
      }    
     
      this.excelService.exportAsExcelFile(this.objList, 'Error List');
    }
    else
      this.swapAlerts('Not Found!!');
  }
}
