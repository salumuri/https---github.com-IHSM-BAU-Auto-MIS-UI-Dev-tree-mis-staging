import { Component, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NgxPaginationModule } from 'ngx-pagination';
import { GlobalConstants } from './common/global-constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {

  subscription: Subscription;

  constructor(private router: Router) {
    window.addEventListener("resize", this.displayWindowSize);

    // Calling the function for the first time
    this.displayWindowSize();
   // var resp = this.httpGet('https://api.ipify.org/?format=jsonp&callback=JSONP_CALLBACK');
   // console.log('Client IP : ', resp);
    // alert(resp)

    router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        console.log('URL :', e.url);
        GlobalConstants.currentURL = e.url;
        //window.localStorage.removeItem("frequentlyUrls");
        var freqUrl = localStorage.getItem('frequentlyUrls');
        if (e.url == '/pages/error') {
          console.log('Erro Page');
        } else if (e.url == '/pages/login') {
          console.log('Login Page');
        } else {
          if (freqUrl == null) {
            console.log('create local var')
            var frequrl1 = [{
              url: e.url,
              count: 1,
            }]
            localStorage.setItem('frequentlyUrls', JSON.stringify(frequrl1))
          } else {
            var frequrl2 = {
              url: e.url,
              count: 1,
            }
            var localStor = JSON.parse(freqUrl);
            var resp = localStor.map(function (x) { return x.url; }).indexOf(e.url);

            if (resp == -1) {
              localStor.push(frequrl2);
            } else {
              localStor[resp].count = localStor[resp].count + 1;
            }

            localStorage.setItem('frequentlyUrls', JSON.stringify(localStor))

          }
        }


        var result = localStorage.getItem('frequentlyUrls');
        console.log('localStoreage value -->', JSON.parse(result))


        // var frequrl = {
        //   url : e.url,
        //   count : 1,
        // }
        // if(GlobalConstants.requentUrls.length > 0){
        //   var resp = GlobalConstants.requentUrls.map(function (x) { return x.url; }).indexOf(e.url);
        //   console.log('Index-------------------------------> ',resp)
        //   if(resp == -1){
        //     GlobalConstants.requentUrls.push(frequrl);
        //   }else{
        //     GlobalConstants.requentUrls[resp].count = GlobalConstants.requentUrls[resp].count + 1;
        //   }

        // }else{
        //   GlobalConstants.requentUrls.push(frequrl);
        // }

        //console.log('GLob Vars -->', GlobalConstants.requentUrls)
      });



  }

  ngOnInit() {
    this.subscription = this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe(() => window.scrollTo(0, 0));

    //alert('URL : '+ this.subscription)
  }
  httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false); // false for synchronous request
    xmlHttp.send(null);
    return xmlHttp.responseText;
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }


  displayWindowSize(){
    // Get width and height of the window excluding scrollbars
    var w = document.documentElement.clientWidth;
    var h = document.documentElement.clientHeight;
    console.log('WIdth :', w , " Height :", h);
    document.body.classList.remove('vertical-menu');
    document.body.classList.remove('menu-expanded');
    document.body.classList.remove('menu-open');
    document.body.classList.add('menu-hide');



    // Display result inside a div element
   // document.getElementById("result").innerHTML = "Width: " + w + ", " + "Height: " + h;
}
}
