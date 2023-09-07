import { NgModule, CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { InputsRoutingModule } from './inputs-routing.module'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { PerfectScrollbarModule } from "ngx-perfect-scrollbar";
import { ClickOutsideModule } from 'ng-click-outside';
import { NgSelectModule } from '@ng-select/ng-select';
//import { AutocompleteModule } from 'components/autocomplete/autocomplete.module';
import { PipeModule } from 'app/shared/pipes/pipe.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AttendanceManagementComponent } from './attendance-management/attendance-management.component';
import { AttendancemodalComponent } from "./../modals/attendancemodal/attendancemodal.component";

//COMPONENTS
import { MapsComponent } from "./maps/maps.component";
import { WorkAllotmentComponent } from "./work-allotment/work-allotment.component";

import { ChecklistComponent } from "./checklist/checklist.component";

import { SingleTimeentryComponent } from "./single-timeentry/single-timeentry.component";

import { ChecklistmodalComponent } from "./../modals/checklistmodal/checklistmodal.component";

import { FeedbackComponent } from "../modals/feedback/feedback.component";

import { FeedbackErrorListComponent } from "../modals/feedback-error-list/feedback-error-list.component";
import { ClientViewFeedbackListComponent } from "../modals/client-view-feedback-list/client-view-feedback-list.component";
import { MapDetailsComponent } from "../modals/map-details/map-details.component";

import { EmpFilterPipe } from "../pipes/emp-filter.pipe";
import { TextsearchPipe } from 'app/pipes/textsearch.pipe';
import { AddClientComponent } from './add-client/add-client.component';
import { FeedbackEntryComponent } from './feedback-entry/feedback-entry.component';
import { ViewFeedbackComponent } from './view-feedback/view-feedback.component';
import { TimeentryListComponent } from './timeentry-list/timeentry-list.component';
import { GlobalConstants } from '../common/global-constants';

import { WorkflowViewMoreComponent } from './../modals/workflow-view-more/workflow-view-more.component';
import { DemandSupplyReportComponent } from './ClientDashboard/demand-supply-report/demand-supply-report.component';
import { UploadDataComponent } from './ClientDashboard/upload-data/upload-data.component';
import { SLATrackerComponent } from './ClientDashboard/sla-tracker/sla-tracker.component';
import { KPIReportComponent } from './ClientDashboard/kpi-report/kpi-report.component';
import { WorkflowSingleMapComponent } from './../modals/workflow-single-map/workflow-single-map.component';
import {Ng2SearchPipeModule} from 'ng2-search-filter';

@NgModule({
  imports: [
      FormsModule,
      ReactiveFormsModule,
      InputsRoutingModule,
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
      Ng2SearchPipeModule
  ],
  declarations: [
    MapsComponent,
    WorkAllotmentComponent,
    ChecklistComponent,
    SingleTimeentryComponent,
    ChecklistmodalComponent,
    WorkflowViewMoreComponent,
    WorkflowSingleMapComponent,
    FeedbackComponent,
    EmpFilterPipe,
    TextsearchPipe,
    FeedbackErrorListComponent,
    AddClientComponent,
    FeedbackEntryComponent,
    ViewFeedbackComponent,
    TimeentryListComponent,
    DemandSupplyReportComponent,    
    UploadDataComponent, 
    SLATrackerComponent,
    KPIReportComponent,
    AttendanceManagementComponent,
    AttendancemodalComponent

    
    
  ],
  entryComponents:[
    ChecklistmodalComponent,
    WorkflowViewMoreComponent,
    WorkflowSingleMapComponent,
    FeedbackComponent,
    FeedbackErrorListComponent,
    AttendancemodalComponent
  ],
  providers: [GlobalConstants],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class InputsModule { }
