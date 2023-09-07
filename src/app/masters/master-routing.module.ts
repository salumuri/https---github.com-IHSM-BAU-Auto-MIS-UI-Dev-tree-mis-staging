import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WorkstreamsServicesComponent } from "./workstreams-services/workstreams-services.component";
import { WorkstreamUserAccessComponent } from "./workstream-user-access/workstream-user-access.component"
import { WorkFlowComponent } from "./work-flow/work-flow.component"
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'workstreams-services',
        component: WorkstreamsServicesComponent,
        data: {
          title: 'WorkstreamsServices'
        }
      },
      {
        path: 'workstream-user-access',
        component: WorkstreamUserAccessComponent,
        data: {
          title: 'Workstream User Access'
        }
      },
      {
        path: 'work-flow',
        component: WorkFlowComponent,
        data: {
          title: 'Work Flow'
        }
      }
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MasterRoutingModule { }
