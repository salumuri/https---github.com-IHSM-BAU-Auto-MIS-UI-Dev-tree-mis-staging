import { NgModule, CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { PerfectScrollbarModule } from "ngx-perfect-scrollbar";
import { ClickOutsideModule } from 'ng-click-outside';
import { NgSelectModule } from '@ng-select/ng-select';
//import { AutocompleteModule } from 'components/autocomplete/autocomplete.module';
import { PipeModule } from 'app/shared/pipes/pipe.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MasterRoutingModule } from './master-routing.module';
import {WorkstreamsServicesComponent} from './workstreams-services/workstreams-services.component';
import { WorkstreamUserAccessComponent } from './workstream-user-access/workstream-user-access.component';
import { WorkFlowComponent } from './work-flow/work-flow.component'
import { GlobalConstants } from '../common/global-constants';
@NgModule({
  declarations: [
    WorkstreamsServicesComponent,
    WorkstreamUserAccessComponent,
    WorkFlowComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
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
    MasterRoutingModule
  ],
  providers: [GlobalConstants],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class MasterModule { }
