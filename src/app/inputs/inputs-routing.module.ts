import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MapsComponent } from "./maps/maps.component";
import { WorkAllotmentComponent } from "./work-allotment/work-allotment.component";

import { ChecklistComponent } from "./checklist/checklist.component";

import { DemandSupplyReportComponent } from "./ClientDashboard/demand-supply-report/demand-supply-report.component";

import { UploadDataComponent } from "./ClientDashboard/upload-data/upload-data.component"

import { SingleTimeentryComponent } from "./single-timeentry/single-timeentry.component";
import { TimeentryListComponent } from "./timeentry-list/timeentry-list.component";
import { AddClientComponent } from './add-client/add-client.component';
import { FeedbackEntryComponent } from './feedback-entry/feedback-entry.component';
import { ViewFeedbackComponent } from './view-feedback/view-feedback.component';
import { SLATrackerComponent } from './ClientDashboard/sla-tracker/sla-tracker.component';
import { KPIReportComponent } from './ClientDashboard/kpi-report/kpi-report.component';
import { AttendanceManagementComponent } from './attendance-management/attendance-management.component';


const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'maps',
        component: MapsComponent,
        data: {
          title: 'Maps'
        }
      },
      {
        path: 'work-allotment',
        component: WorkAllotmentComponent,
        data: {
          title: 'Work Allotment'
        }
      },
      {
        path: 'checklist',
        component: ChecklistComponent,
        data: {
          title: 'Check List'
        }
      },
      {

        path: 'attendance-management',

        component: AttendanceManagementComponent,

        data: {

          title: 'Attendance Management'

        }

      },
      {

       path: 'ClientDashboard/demand-supply-report',
        
     component: DemandSupplyReportComponent,
        
     data: {
        
     title: 'Demand Supply Report'
        
      }
     },
     {

      path: 'ClientDashboard/upload-data',
       
    component: UploadDataComponent,
       
    data: {
       
    title: 'Uplaod Data'
       
     }
    },
      {
        path: 'single-timeentry',
        component: SingleTimeentryComponent,
        data: {
          title: 'Single Time Entry'
        }
      },
      {
        path: 'timeentry-list',
        component: TimeentryListComponent,
        data: {
          title: 'Time Entry List'
        }
      },
      {
        path: 'add-client',
        component: AddClientComponent,
        data: {
          title: 'Add Client'
        }
      },{
        path: 'feedback-entry',
        component: FeedbackEntryComponent,
        data: {
          title: 'Feedback Entry'
        }
      },
      {
        path: 'view-feedback',
        component: ViewFeedbackComponent,
        data: {
          title: 'View Feedback'
        }
      },
      {

        path: 'ClientDashboard/sla-tracker',

        component: SLATrackerComponent,

        data: {

          title: 'SLA Tracker'

        }

      },

      {

        path:'ClientDashboard/kpi-report',

        component:KPIReportComponent,

        data:{

          title:'KPI Report'

        }

      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InputsRoutingModule { }
