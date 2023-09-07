import { NgModule, CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ReportsRoutingModule } from './reports-routing.module'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { PerfectScrollbarModule } from "ngx-perfect-scrollbar";
import { ClickOutsideModule } from 'ng-click-outside';
import { NgSelectModule } from '@ng-select/ng-select';
//import { AutocompleteModule } from 'components/autocomplete/autocomplete.module';
import { PipeModule } from 'app/shared/pipes/pipe.module';
import { NgxSpinnerModule } from 'ngx-spinner';
//COMPONENTS
import { AttendanceReportComponent } from "./attendance-report/attendance-report.component";
import { DeliveryReportComponent } from './delivery-report/delivery-report.component';
import { DailyLogComponent } from './daily-log/daily-log.component';
import { EmployeeDetailsComponent } from './employee-details/employee-details.component';
import { ProjectionsComponent } from './projections/projections.component';
import { SyncComponent } from './sync/sync.component';
import { RealizationComponent } from './realization/realization.component';
import { QcfeedbackreportComponent } from './qcfeedbackreport/qcfeedbackreport.component';
import { UserFeedbackListComponent } from './user-feedback-list/user-feedback-list.component';
import { ControltowerComponent } from './controltower/controltower.component';
import { MasterReportComponent } from './master-report/master-report.component';
import { DragulaModule } from 'ng2-dragula';
import { TimeSpentDetailsComponent } from './time-spent-details/time-spent-details.component';
import { OndemandReportComponent } from './ondemand-report/ondemand-report.component';
import { GlobalConstants } from '../common/global-constants';
import { TrainingInfoComponent } from './training-info/training-info.component';
import { PatrEntryReportComponent } from './patr-entry-report/patr-entry-report.component';
import { PatrEntryComponent } from './patr-entry/patr-entry.component';
import { NgxPaginationModule } from 'ngx-pagination';


@NgModule({
  imports: [
      FormsModule,
      ReactiveFormsModule,
      ReportsRoutingModule,
      RouterModule,
      CommonModule,
      NgbModule,
      TranslateModule,
      FormsModule,
      ReactiveFormsModule ,
      PerfectScrollbarModule,
      ClickOutsideModule,
      PipeModule,
      NgxDatatableModule,
      NgSelectModule,
      NgxSpinnerModule,
      NgxPaginationModule,
      DragulaModule.forRoot(),
  ],
  declarations: [
    AttendanceReportComponent,
    DeliveryReportComponent,
    DailyLogComponent,
    EmployeeDetailsComponent,
    ProjectionsComponent,
    SyncComponent,
    RealizationComponent,
    QcfeedbackreportComponent,
    UserFeedbackListComponent,
    ControltowerComponent,
    MasterReportComponent,
    TimeSpentDetailsComponent,
    OndemandReportComponent,
    TrainingInfoComponent,
    PatrEntryReportComponent,
    PatrEntryComponent,
  ],
  providers: [GlobalConstants],
  entryComponents:[
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class ReportsModule { }
