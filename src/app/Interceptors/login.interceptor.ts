import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from "ngx-spinner";

@Injectable()
export class LoginInterceptor implements HttpInterceptor {

  constructor(private spinner: NgxSpinnerService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    console.log('Request Next -->', window.location.host);
    var hostName = window.location.host;
    //hostName = 'techdataportals.cyient.com';

    const changeUrl = request.url.slice(0, 7);
    var token = localStorage.getItem('userToken');

    var originObj = ['http://172.17.30.88','172.17.30.88','localhost:4200','localhost:4202','https://techdataportals.cyient.com','techdataportals.cyient.com',
                     'https://misapi.cyient.com']

    if (!originObj.includes(hostName)) {
      Swal.fire({text: "You are not authorized to access!",icon: 'warning'}).then(function() {
        //return;
        window.localStorage.clear();
        this.router.navigate(['/pages/login']);
      });
      this.spinner.hide();
      return;
    }

    let httpRequest;

    if(token != null){
      httpRequest = request.clone({
        setHeaders : { Authorization  :  `Bearer ${token.replace(/^"(.*)"$/, '$1')}`}
      })
    }else{
      httpRequest = request.clone({
        setHeaders : { Authorization  :  `Bearer ${token}`}
      })
    }

    // console.log(changeUrl)
    // if (changeUrl === 'http://'){
    //   httpRequest = request.clone({
    //     url: request.url.replace('http://', 'http://'),
    //     setHeaders : { Authorization  :  `Bearer ${token.replace(/^"(.*)"$/, '$1')}`}
    //   })

    //   console.log("Changed API URL", httpRequest);
    //   return next.handle(httpRequest);
    // }

    //console.log("Changed API URL 2", httpRequest);
    return next.handle(httpRequest);

  }
}
