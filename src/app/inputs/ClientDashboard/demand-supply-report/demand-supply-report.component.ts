import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { ApiService } from 'app/Api/api.service';
import { GlobalConstants } from 'app/common/global-constants';
import * as defaults from 'environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-demand-supply-report',
  templateUrl: './demand-supply-report.component.html',
  styleUrls: ['./demand-supply-report.component.scss']
})
export class DemandSupplyReportComponent implements OnInit {

  workstreamData: any = '';
  reportData: any = [];
  ReportTypeData: any;
  userInfos: any;
  logInfo: any;
  utype: any = '';
  clientId: any = 0;
  public frmSubmit: any = false;
  myBaseUrl = defaults.environment.ApiUrl;
  waSearchFm: FormGroup = new FormGroup({
    wname: new FormControl('', Validators.required),
    ReportName: new FormControl()
  });

  userInfo = {
    'UserName': localStorage.getItem('Name'),
    'corpId': localStorage.getItem('CorpId'),
    'designation': localStorage.getItem('Role'),
    'level_code': localStorage.getItem('Role')
  }
  httpClient: any;
  constructor(public globalConst: GlobalConstants, private spinner: NgxSpinnerService, public router: Router, private Apiservice: ApiService, private fb: FormBuilder, private http: HttpClient) {
    this.utype = localStorage.getItem('UserType');
    this.logInfo = JSON.parse(localStorage.getItem('UserCientInfo'));
  }

  ngOnInit(): void {
    this.spinner.show();
    var loginfo = localStorage.getItem('CorpId')

    if (loginfo == '' || loginfo == null || loginfo == 'null') {
      this.router.navigate(['/pages/login']);
    }
    this.GetReportTypeData();
    this.waSearchFm = this.fb.group({
      wname: [''],
      ReportName: ['']
    });
    this.spinner.hide();
  }

  GetReportTypeData() {
    this.Apiservice.get('Client_Dashboard/GetIHSD_reporttype').subscribe((data: any) => {
      this.ReportTypeData = data;
    });
  }
  GetWorkstream() {
    this.waSearchFm.reset({
ReportName: this.waSearchFm.get('ReportName').value,    
wname: ''
    });

    if (this.utype == 'client') {

      this.Apiservice.get('WorkAllotment/GetWorkStreamClient?wid=' + this.logInfo.id).subscribe((data: any) => {
        console.log('client work streams-->', data);
        this.workstreamData = data;
      });
    }
    else {
      let id = localStorage.getItem('LoginId');
      this.Apiservice.get('Client_Dashboard/GetIHSD_Workstrems').subscribe((data: any) => {
        console.log(data);
        this.globalConst.checkOriginAccess(data);
        this.workstreamData = data;
      });
    }
  }

  onSubmit() {
    console.log("MIS");
    const wsName = this.waSearchFm.get('wname').value;
    const Rname = this.waSearchFm.get('ReportName').value;
    if (this.utype == 'client') {
      this.clientId = this.logInfo.id;
    }
    else {
      this.clientId = 0;
    }
    this.Apiservice.get('Client_Dashboard/GetIHSD_Workstreamwise_viewdeatils?stream=' + wsName + '&CategoryName=Reports&reporttype=' + Rname + '&Client_Id='+this.clientId+'').subscribe((data: any) => {
      console.log('Demand Supply --->', data);
      this.globalConst.checkOriginAccess(data);

      this.reportData = data;
      this.frmSubmit = true;
      this.spinner.hide();

    });

  };

  deleteRow(id: any, UploadName: any) {

    if (UploadName != localStorage.getItem('Name') && !this.userInfo.level_code.includes('WSM')) {
      Swal.fire({ text: "You are not authorized to delete the file", icon: 'warning' })
      return;
    }

    // if(this.userInfo.designation.includes('Manager'))
    // {     
    // var delBtn = confirm(" Do you want to delete ?");
    // if ( delBtn == true ) {
    //   //this.reportData.splice(x, 1 );
    //   const url='Client_Dashboard/Cli_Delete_record_ser?_id='+id+'&_Deletedby_ID='+this.userInfo.corpId+'&_Deleteletedby='+this.userInfo.UserName+''
    //   this.Apiservice.get('Client_Dashboard/Cli_Delete_record_ser?_id='+id+'&_Deletedby_ID='+this.userInfo.corpId+'&_Deleteletedby='+this.userInfo.UserName+'').subscribe((data: any) => {
    //     console.log('Demand Supply Delete --->', data);
    //     this.globalConst.checkOriginAccess(data);            
    //     this.reportData = data;    
    //     this.frmSubmit = true;
    //     Swal.fire({text: "File deleted Successfully!",icon: 'success'});
    //     this.spinner.hide();  
    //     this.onSubmit();
    // });
    //} 

    Swal.fire({
      title: 'Do you want to delete?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.value) {
        const url = 'Client_Dashboard/Cli_Delete_record_ser?_id=' + id + '&_Deletedby_ID=' + this.userInfo.corpId + '&_Deleteletedby=' + this.userInfo.UserName + ''
        this.Apiservice.get('Client_Dashboard/Cli_Delete_record_ser?_id=' + id + '&_Deletedby_ID=' + this.userInfo.corpId + '&_Deleteletedby=' + this.userInfo.UserName + '').subscribe((data: any) => {
          console.log('Demand Supply Delete --->', data);
          this.globalConst.checkOriginAccess(data);
          this.reportData = data;
          this.frmSubmit = true;
          Swal.fire({ text: "File deleted Successfully!", icon: 'success' });
          this.spinner.hide();
          this.onSubmit();
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {

      }
    })
  }
  // }

  download(file: any, origName: any) {
    let fileName = file;
    this.DownloadFile(fileName)
      .subscribe(
        success => {
          saveAs(success, origName);//fileName
        },
        err => {
          alert("Server error while downloading file.");
        }
      );
  }

  DownloadFile(filePath: string): Observable<any> {
    let input = filePath;
    return this.http.get(this.myBaseUrl + "Client_Dashboard/DocumentsDownload?fileName=" + input, {
      responseType: 'blob',
      observe: 'response'
    })
      .pipe(
        map((res: any) => {
          return new Blob([res.body]);
        })
      );
  }
}

