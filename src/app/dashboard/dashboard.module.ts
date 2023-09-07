import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";

import { DashboardRoutingModule } from "./dashboard-routing.module";
import { ChartistModule } from 'ng-chartist';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularResizedEventModule } from 'angular-resize-event';
import { MatchHeightModule } from "../shared/directives/match-height.directive";

import { DashboardComponent } from "./dashboard/dashboard.component";
import { Dashboard2Component } from "./dashboard2/dashboard2.component";
import { NgxSpinnerModule } from 'ngx-spinner';
import { GlobalConstants } from '../common/global-constants';


@NgModule({
    imports: [
        CommonModule,
        DashboardRoutingModule,
        ChartistModule,
        NgbModule,
        MatchHeightModule,
        NgApexchartsModule,
        AngularResizedEventModule,
        NgxSpinnerModule
    ],
    exports: [],
    declarations: [
        DashboardComponent,
        Dashboard2Component
    ],
    providers: [GlobalConstants],
})
export class DashboardModule { }
