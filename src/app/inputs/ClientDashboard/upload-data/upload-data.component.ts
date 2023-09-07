import { HttpClient, HttpErrorResponse, HttpEventType, HttpRequest } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'app/Api/api.service';
import * as defaults from 'environments/environment';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-upload-data',
  templateUrl: './upload-data.component.html',
  styleUrls: ['./upload-data.component.scss']
})
export class UploadDataComponent implements OnInit {

  constructor(private http: HttpClient, public router: Router, private Apiservice: ApiService) { }

  ngOnInit(): void {

    var loginfo = localStorage.getItem('CorpId')

    if (loginfo == '' || loginfo == null || loginfo == 'null') {
      this.router.navigate(['/pages/login']);
    }
    this.GetReportTypeData();
  }
  myBaseUrl = defaults.environment.ApiUrl;
  progress: number;
  message: string;
  workstreamData: any;
  TotalFiles: any
  UploadFileName: any = ""
  ReportTypeData: any;
  wsname: any
  details = {
    ReportName: '',
    wsname: '',
    DocName: '',
    description: ''
  }

  userInfo = {
    'UserName': localStorage.getItem('Name'),
    'corpId': localStorage.getItem('CorpId'),
    'designation': localStorage.getItem('Role')

  }

  //@Output() public onUploadFinished = new EventEmitter();

  onSubmit(MyForm: NgForm) {
    if (this.TotalFiles.length === 0 || this.details.ReportName == '' || this.details.wsname == ''
      || this.details.DocName == '' || this.details.description == '')
      return;

    const formData = new FormData();

    for (const file of this.TotalFiles) {
      formData.append(file.name, file);
      formData.append('Category', 'Reports')
      formData.append('Report', this.details.ReportName)
      formData.append('WSName', this.details.wsname)
      formData.append('DocName', this.details.DocName)
      formData.append('Description', this.details.description)
      formData.append('CorpId', this.userInfo.corpId)
      formData.append('UserName', this.userInfo.UserName)
    }

    const uploadReq = new HttpRequest('POST', this.myBaseUrl + 'Client_Dashboard/upload', formData, {
      reportProgress: true,
    });

    this.http.request(uploadReq).subscribe(event => {
      if (event.type === HttpEventType.UploadProgress) {
        this.progress = Math.round(100 * event.loaded / event.total);
      };
    });
    Swal.fire({ text: "File uploaded Successfully!", icon: 'success' });
    MyForm.reset();
    this.details.ReportName = ""
    this.details.wsname = ""
    this.UploadFileName = ""
  }
  upload(files: any) {
    this.TotalFiles = files
    for (const file of this.TotalFiles) {
      this.UploadFileName = file.name
      console.log('uploading file name--->' + this.UploadFileName)
    }
  }
  GetReportTypeData() {
    this.Apiservice.get('Client_Dashboard/GetIHSD_reporttype').subscribe((data: any) => {
      this.ReportTypeData = data;
    });
  }
  GetWorkstream() {
    // this.workstreamData = JSON.parse(localStorage.getItem('WorkStreams'));;
    this.details.wsname='';
    let id = localStorage.getItem('LoginId');
    this.Apiservice.get('Client_Dashboard/GetIHSD_Workstrems').subscribe((data: any) => {
      console.log(data);
      this.workstreamData = data;
    });
  }

}
