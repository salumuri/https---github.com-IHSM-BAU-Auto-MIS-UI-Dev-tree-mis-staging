import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";

import { environment } from '../../environments/environment';

import { Router } from '@angular/router';

import { map } from 'rxjs/operators';





@Injectable({

  providedIn: 'root'

})





export class ApiService {

  fullUrl = `${environment.ApiUrl}`;
  partUrl: any = 'https://techdataportals.cyient.com/mis-stagingapi/api/'

  //fullUrl = 'https://172.17.30.73:8082/mis/api/'

  private loggedIn = new BehaviorSubject<boolean>(false); // {1}




  get isLoggedIn() {

    return this.loggedIn.asObservable(); // {2}

  }

  constructor(private http: HttpClient, private router: Router,) {

    //Stop consoles in the production mode
    if(environment.production){
      if(window){
        window.console.log = function(){};
      }
    }


  }

  login(user: any) {

    if (user.username !== '' && user.password !== '') { // {3}

      this.router.navigate(['/dashboard']);

      // this.loggedIn.next(true);

      //   console.log('dddd', this.loggedIn.value);

      //this.global.Showmenu=true;

      //  console.log('afterlogin',this.global.Showmenu);

    }

  }

  logout() {// {4}

    this.loggedIn.next(false);

    this.router.navigate(['/login']);

  }



  //Http Header

  private htttpOptions() {

    let httpOptions: any;

    return httpOptions = {

      headers: new HttpHeaders({

        "Content-Type": "application/json",




      })

    }




    return;

  }

  Putmethod(url: string, obj: object): Observable<any> {

    return this.http.put(`${this.fullUrl}${url}`, obj)

      .pipe(map(

        (res: Response) => {

          return res;

        }));

  }

  get(path: string): Observable<any> {

    return this.http.get(`${this.fullUrl}${path}`, {})

      .pipe(map(

        (res: Response) => {

          if (res) {

            return res;

          } else {

            return '';

          }

        }));

  }

  getStrMethod(path: string): Observable<any> {

    return this.http.get(`${this.partUrl}${path}`, { responseType: 'text' });




  }

  delete(path: string): Observable<any> {

    return this.http.delete(`${this.fullUrl}${path}`, {})

      .pipe(map(

        (res: Response) => {

          console.log(res);

          if (res) {

            return res;

          } else {

            return '';

          }

        }));

  }

  getMethod(path: string): Observable<any> {

    return this.http.get(`${this.fullUrl}${path}`, {})

      .pipe(map(

        (res: Response) => {

          if (res) {

            return res;

          } else {

            return 0;

          }

        }));

  }

  public getIPAddress()
  {
    return this.http.get("http://api.ipify.org/?format=json");
  }

  //post

  postmethod(url: string, obj: object): Observable<any> {




    let headers = new HttpHeaders().set('content-type', 'application/json').set
    ('Access-Control-Allow-Origin', '*')



    // let headers = new HttpHeaders();

    // headers = headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // return this.http.post(`${this.fullUrl}${url}`, obj,{ headers: headers })

    return this.http.post(`${this.fullUrl}${url}`, obj, { headers: headers })

      .pipe(map(

        (res: Response) => {

          return res;

        }));

  }




}
