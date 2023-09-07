import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../Api/api.service';
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-remarks',
  templateUrl: './remarks.component.html',
  styleUrls: ['./remarks.component.scss']
})
export class RemarksComponent implements OnInit {
  @Input() fromParent;
  public remarks : any;
  
  constructor(private spinner: NgxSpinnerService,public activeModal: NgbActiveModal,private Apiservice: ApiService) { }

  ngOnInit(): void {

    console.log(this.fromParent);
  }

  
  closeModal(bnttyp) {
    if(bnttyp == 'save'){   
      this.activeModal.close(this.remarks);
    }else{
      this.activeModal.close('');
    }
  }
}
