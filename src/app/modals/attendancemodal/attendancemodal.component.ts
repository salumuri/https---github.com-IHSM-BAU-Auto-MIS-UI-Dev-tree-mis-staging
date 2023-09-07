import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from 'app/Api/api.service';
import { GlobalConstants } from 'app/common/global-constants';
import { NgxSpinnerService } from "ngx-spinner";
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';



@Component({
  selector: 'app-attendancemodal',
  templateUrl: './attendancemodal.component.html',
  styleUrls: ['./attendancemodal.component.scss']
})
export class AttendancemodalComponent implements OnInit {
  @Input() fromParent;
  @Input() parDate;
  @Input() parWSName;
  @Input() parWSId;
  constructor(public activeModal: NgbActiveModal, public Apiservice: ApiService, private fb: FormBuilder, private http: HttpClient) { }
  selectedRow = [];
  statusList = [];
  selectedInd = '';
  selectedstp = '';
  rowchklist = [];
  userInfo = [];
  areaInfo = [];
  batchInfo = [];
  Compoffdates = [];
  upcomingCompoffdates = []; 
  submitted = false;
  
  
  myGroup: FormGroup = new FormGroup({
    tOperatorID: new FormControl(''),
    tOperatorName: new FormControl(''),
    tDate: new FormControl(''),
    tGlName: new FormControl(''),
    tWSM: new FormControl(''),
    tProcess: new FormControl(''),
    tArea: new FormControl(''),
    tBatch: new FormControl(''),
    tStep: new FormControl(''),
    tStatus: new FormControl(''),
    tShift: new FormControl(''),
    tTime: new FormControl(''),
    twof: new FormControl({value: '', disabled: true}),
    tpwd: new FormControl({value: '', disabled: true}),
    tRemarks: new FormControl('')
  });

  ngOnInit(): void {
    console.log('Attendance Model id---->', this.fromParent);
    console.log('Attendance Model Date---->', this.parDate);
    console.log('Attendance Model work stream---->', this.parWSName);    
    this.loadData();
    this.loadArea();

  }

  closeModal(myVal) {
    
      this.activeModal.close('');
    
  }
  loadData() {
    if (this.fromParent != '') {

      this.Apiservice.get('AttendanceManagement/GetUserbasicinfo?Empid=' + this.fromParent + '').subscribe((data: any) => {
        this.userInfo = data;
        if (this.userInfo != null || this.userInfo.length > 0) {
          this.myGroup = this.fb.group({
            tOperatorID: this.userInfo[0]?.['ihsm_id'],
            tOperatorName: this.userInfo[0]?.['emp_name'],
            tGlName: this.userInfo[0]?.['glid'],
            tWSM: this.userInfo[0]?.['taskManager'],
            tDate: this.parDate,
            tProcess: this.parWSName,
            tArea: '',
            tBatch: '',
            tStep: '',
            tStatus: '',
            tShift: '',
            tTime: '',
            twof: '',
            tpwd: '',
            tRemarks: ''
          });
        }
      });
    }
  }
  loadArea() {
    this.Apiservice.get('AttendanceManagement/GetUserServicesinfo?WorksteamID=' + this.parWSId + '').subscribe((data: any) => {
      this.areaInfo = data;
    });
  }
  loadBatch() {
    var sId = this.myGroup.get('tArea').value;
    console.log('my service id', sId);
    this.Apiservice.get('AttendanceManagement/GetUserBatchinfo?WorksteamID=' + this.parWSId + '&serviceID=' + sId + '').subscribe((data: any) => {
      this.batchInfo = data;
    });
  }
  loadStatus(event) {
    this.Compoffdates = [];
    this.upcomingCompoffdates = [];

    this.myGroup.patchValue({
      tTime: '',
    });
    var stepName = event.target.options[event.target.options.selectedIndex].text
    console.log('selected step name--->', stepName);
    this.statusList = [];
    if (stepName == 'CompOff') {
      this.statusList.push({ 'id': 1, 'status': 'CompOff' });
    }
    else if (stepName == 'Absent') {
      this.statusList.push({ 'id': 1, 'status': 'NotInformed-Leave' });
      this.statusList.push({ 'id': 2, 'status': 'Informed-Leave' });
      this.statusList.push({ 'id': 3, 'status': 'Half day' });
      this.statusList.push({ 'id': 4, 'status': 'ESI Leave' });
    }
    else if (stepName == 'AdvCompOff') {
      this.statusList.push({ 'id': 1, 'status': 'AdvCompOff' });
    }
    else if (stepName == 'CompWeekOff') {
      this.statusList.push({ 'id': 1, 'status': 'CompWeekOff' });
    }
  }
  updateTime(event) {
    this.Compoffdates = [];
    this.upcomingCompoffdates = [];
    var statusName = event.target.options[event.target.options.selectedIndex].text
    if (statusName == 'Half day') {
      this.myGroup.patchValue({
        tTime: '4.5',
      });
    }
    else {
      this.myGroup.patchValue({
        tTime: '9.0',
      });
    }
    if (statusName == 'CompOff') {
      this.myGroup.get('tpwd').enable(); 
      this.myGroup.get('twof').disable(); 
      this.previousWorkedDates();
    }
    else if (statusName == 'AdvCompOff') {
      this.myGroup.get('twof').enable(); 
      this.myGroup.get('tpwd').disable(); 
      this.upcomingCompOffDates();
    }
    else{
      this.myGroup.get('twof').disable(); 
      this.myGroup.get('tpwd').disable(); 
    }

  }
  previousWorkedDates() {
    this.Apiservice.get('AttendanceManagement/GetCompoffdates?empvtid=' + this.fromParent + '&dates=' + this.myGroup.get('tDate').value + '').subscribe((data: any) => {
      this.Compoffdates = data;
    });
  }
  upcomingCompOffDates() {
    this.Apiservice.get('AttendanceManagement/GetUpcomingCompoffdates?empvtid=' + this.fromParent + '&fromdate=' + this.myGroup.get('tDate').value + '').subscribe((data: any) => {
      this.upcomingCompoffdates = data;
    });
  }
  onSubmit() {
    this.submitted=true
    
    var comp_status = ''
    var comp_date = '';

    if (this.myGroup.get('tArea').value == '') {
      Swal.fire({ text: "Please select Service", icon: 'warning' })
      return;
    }
    if (this.myGroup.get('tBatch').value == '') {
      Swal.fire({ text: "Please select SubService", icon: 'warning' })
      return;
    }
    if (this.myGroup.get('tStep').value == '') {
      Swal.fire({ text: "Please select Step", icon: 'warning' })
      return;
    }
    if (this.myGroup.get('tStatus').value == '') {
      Swal.fire({ text: "Please select Status", icon: 'warning' })
      return;
    }
    if (this.myGroup.get('tShift').value == '') {
      Swal.fire({ text: "Please select Shift", icon: 'warning' })
      return;
    }

    if (this.myGroup.get('tStep').value == 'AdvCompOff' && this.myGroup.get('twof').value==''){
      Swal.fire({ text: "Please select Upcome Weekly Offs", icon: 'warning' })
      return;
    }
    if (this.myGroup.get('tStep').value == 'CompOff' && this.myGroup.get('tpwd').value==''){
      Swal.fire({ text: "Please select Previously Worked Days", icon: 'warning' })
      return;
    }

    if (this.myGroup.get('tStep').value == 'Absent') {//Absent
      comp_status='Absent';
      comp_date = '01/01/1900';
    }
    else if (this.myGroup.get('tStep').value == 'AdvCompOff'){//AdvCompOff
      comp_status = 'AdvCompOff';
      comp_date=this.myGroup.get('twof').value;
    }
    else if (this.myGroup.get('tStep').value == 'CompOff'){//CompOff
      comp_status = 'CompOff';
      comp_date=this.myGroup.get('tpwd').value;
    }
    else if (this.myGroup.get('tStep').value == 'CompWeekOff'){//CompOff
      comp_status = 'CompWeekOff';
      comp_date='01/01/1900';
    }   
    
   
    this.Apiservice.getStrMethod('AttendanceManagement/InsertAbsent_records?emp_VID=' + this.fromParent + '&workstream=' + this.parWSId + 
                                '&service=' + this.myGroup.get('tArea').value + '&batch=' + this.myGroup.get('tBatch').value + '&date=' +
                                 this.myGroup.get('tDate').value + '&shift=' + this.myGroup.get('tShift').value + '&status=' + 
                                 this.myGroup.get('tStatus').value + '&time_spent=' + this.myGroup.get('tTime').value + 
                                 '&remarks=' + this.myGroup.get('tRemarks').value + '&comp_status=' + comp_status + 
                                 '&comp_date=' + comp_date + '&stepname=' + this.myGroup.get('tStep').value + '').subscribe((data: any) => {
      console.log('update button service------------->',data) ;

      if (data!='' || data !=null){
        
          Swal.fire({ text: "Absenteeism submited successfully!", icon: 'success' }).then(function () {
            
          });
          this.closeModal('dismiss');
      }
    });


  }
  get f(): { [key: string]: AbstractControl } {
    return this.myGroup.controls;
  }
}
