import { NgModule } from "@angular/core";
import { CommonModule, DatePipe } from '@angular/common';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { AngularFireModule } from "@angular/fire";
import { AngularFireAuthModule } from "@angular/fire/auth";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ToastrModule } from "ngx-toastr";
import { AgmCoreModule } from "@agm/core";
import { HttpClientModule, HttpClient,HTTP_INTERCEPTORS } from "@angular/common/http";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { StoreModule } from "@ngrx/store";
import { DragulaService } from "ng2-dragula";
import { NgxSpinnerModule } from 'ngx-spinner';
import { ExcelService } from '../app/Api/ExcelService';
import { CsvService } from '../app/Api/CsvService';
import { NgxPaginationModule } from 'ngx-pagination';
import { Routes, RouterModule } from '@angular/router';
import { LoginInterceptor } from "./Interceptors/login.interceptor";
import { Ng2SearchPipeModule } from 'ng2-search-filter';

import {
  PerfectScrollbarModule,
  PERFECT_SCROLLBAR_CONFIG,
  PerfectScrollbarConfigInterface
} from 'ngx-perfect-scrollbar';

import { AppRoutingModule } from "./app-routing.module";
import { SharedModule } from "./shared/shared.module";
import { InputsModule } from "./inputs/inputs.module";
import { MasterModule } from "./masters/master.module";
import { ReportsModule } from "./reports/reports.module";
//import * as fromApp from './store/app.reducer';
import { AppComponent } from "./app.component";
import { ContentLayoutComponent } from "./layouts/content/content-layout.component";
import { FullLayoutComponent } from "./layouts/full/full-layout.component";

import { AuthService } from "./shared/auth/auth.service";
import { AuthGuard } from "./shared/auth/auth-guard.service";
import { WINDOW_PROVIDERS } from './shared/services/window.service';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RemarksComponent } from './modals/remarks/remarks.component';
import { MaperrorComponent } from './modals/maperror/maperror.component';
import { ExternalfeedbackComponent } from './modals/externalfeedback/externalfeedback.component';
import { ClientViewFeedbackListComponent } from './modals/client-view-feedback-list/client-view-feedback-list.component';
import { MapDetailsComponent } from './modals/map-details/map-details.component';
import { ExternalFeedbackErrorlistComponent } from './modals/external-feedback-errorlist/external-feedback-errorlist.component';




// import { JwtModule } from "@auth0/angular-jwt";


// import { EmpFilterPipe } from './pipes/emp-filter.pipe';
// import { AttendanceReportComponent } from './reports/attendance-report/attendance-report.component';
// import { FeedbackComponent } from './modals/feedback/feedback.component';
// import { MapsComponent } from './inputs/maps/maps.component';
// import { WorkAllotmentComponent } from './inputs/work-allotment/work-allotment.component';


var firebaseConfig = {
  apiKey: "YOUR_API_KEY", //YOUR_API_KEY
  authDomain: "YOUR_AUTH_DOMAIN", //YOUR_AUTH_DOMAIN
  databaseURL: "YOUR_DATABASE_URL", //YOUR_DATABASE_URL
  projectId: "YOUR_PROJECT_ID", //YOUR_PROJECT_ID
  storageBucket: "YOUR_STORAGE_BUCKET", //YOUR_STORAGE_BUCKET
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", //YOUR_MESSAGING_SENDER_ID
  appId: "YOUR_APP_ID", //YOUR_APP_ID
  measurementId: "YOUR_MEASUREMENT_ID" //YOUR_MEASUREMENT_ID
};


const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
  wheelPropagation: false
};

const routes: Routes = [];

export function tokenGetter() {
  return localStorage.getItem("jwt");
}

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

@NgModule({
  declarations: [AppComponent, FullLayoutComponent, ContentLayoutComponent, RemarksComponent, MaperrorComponent, 
    ExternalfeedbackComponent, ClientViewFeedbackListComponent, MapDetailsComponent,
    ExternalFeedbackErrorlistComponent,
    ],
  imports: [

    FormsModule,
    // JwtModule.forRoot({
    //   config:{
    //     tokenGetter : tokenGetter,
    //     allowedDomains : ["localhost:44313"],
    //     disallowedRoutes : []
    //   }
    // }),
    ReactiveFormsModule,
    BrowserAnimationsModule,
   // StoreModule.forRoot(fromApp.appReducer),
    AppRoutingModule,
    InputsModule,
    MasterModule,
    ReportsModule,
    SharedModule,
    HttpClientModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
    ToastrModule.forRoot(),
    NgbModule,
    Ng2SearchPipeModule,
    NgxSpinnerModule,
    NgxPaginationModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }),
    AgmCoreModule.forRoot({
      apiKey: "YOUR_GOOGLE_MAP_API_KEY"
    }),
    PerfectScrollbarModule,
    RouterModule.forRoot(routes, { useHash: true })
  ],
  providers: [
    AuthService,
    AuthGuard,
    DragulaService,
    CsvService,
    ExcelService,
    DatePipe,
    {

      provide: HTTP_INTERCEPTORS,

      useClass: LoginInterceptor,

      multi:true

    },
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    },
    { provide: PERFECT_SCROLLBAR_CONFIG, useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG },
    WINDOW_PROVIDERS
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
