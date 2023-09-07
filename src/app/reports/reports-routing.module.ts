import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AttendanceReportComponent } from "./attendance-report/attendance-report.component";
import { DeliveryReportComponent } from './delivery-report/delivery-report.component';
import { DailyLogComponent } from './daily-log/daily-log.component';
import { EmployeeDetailsComponent } from './employee-details/employee-details.component';
import { ProjectionsComponent } from './projections/projections.component';
import { RealizationComponent } from './realization/realization.component';
import { SyncComponent } from './sync/sync.component';
import { QcfeedbackreportComponent } from './qcfeedbackreport/qcfeedbackreport.component';
import { UserFeedbackListComponent } from './user-feedback-list/user-feedback-list.component';
import { ControltowerComponent } from './controltower/controltower.component';
import { MasterReportComponent } from './master-report/master-report.component';
import { TimeSpentDetailsComponent } from './time-spent-details/time-spent-details.component';
import { OndemandReportComponent } from "./ondemand-report/ondemand-report.component";
import { TrainingInfoComponent } from './training-info/training-info.component';
import { PatrEntryReportComponent } from '../reports/patr-entry-report/patr-entry-report.component';
import { PatrEntryComponent } from '../reports/patr-entry/patr-entry.component';


const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'attendance-report',
        component: AttendanceReportComponent,
        data: {
          title: 'Attendance Report'
        }
      },
      {
        path: 'ondemand-report',
        component: OndemandReportComponent,
        data: {
          title: 'OnDemand Report'
        }
      },
      {
        path: 'training-info',
        component: TrainingInfoComponent,
        data: {
          title: 'OnDemand Report'
        }
      },
      {
        path: 'employee-details',
        component: EmployeeDetailsComponent,
        data: {
          title: 'Employee Details'
        }
      },
      {
        path: 'delivery-report',
        component: DeliveryReportComponent,
        data: {
          title: 'Delivery Report'
        }
      },
      {
        path: 'daily-log',
        component: DailyLogComponent,
        data: {
          title: 'Daily Log'
        }
      },
      {
        path: 'qcfeedbackreport',
        component: QcfeedbackreportComponent,
        data: {
          title: 'External Feedback'
        }
      },
      {
        path: 'projections',
        component: ProjectionsComponent,
        data: {
          title: 'Projections'
        }
      },
      {
        path: 'realization',
        component: RealizationComponent,
        data: {
          title: 'Realization'
        }
      },
      {
        path: 'sync',
        component: SyncComponent,
        data: {
          title: 'Sync'
        }
      },
      {
        path: 'user-feedback-list',
        component: UserFeedbackListComponent,
        data: {
          title: 'User Feedback Error List'
        }
      },
      {
        path: 'controltower',
        component: ControltowerComponent,
        data: {
          title: 'Control Tower'
        }
      },
      {
        path: 'master-report',
        component: MasterReportComponent,
        data: {
          title: 'Master Report'
        }
      },
      {
        path: 'time-spent-details',
        component: TimeSpentDetailsComponent,
        data: {
          title: 'Time Spent Details'
        }
      },
      {
        path: 'patr-entry-report',
        component: PatrEntryReportComponent,
        data: {
          title: 'PATR'
        }
      },
      {
        path: 'patr-entry',
        component: PatrEntryComponent,
        data: {
          title: 'PATR Entry Report'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsRoutingModule { }
