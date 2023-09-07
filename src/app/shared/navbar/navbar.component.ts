import { Component, Output, EventEmitter, OnDestroy, OnInit, AfterViewInit, ChangeDetectorRef, Inject, Renderer2, ViewChild, ElementRef, ViewChildren, QueryList, HostListener } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LayoutService } from '../services/layout.service';
import { Subscription } from 'rxjs';
import { ConfigService } from '../services/config.service';
import { DOCUMENT } from '@angular/common';
import { CustomizerService } from '../services/customizer.service';
import { FormControl } from '@angular/forms';
import { LISTITEMS } from '../data/template-search';
import { Router } from '@angular/router';
import { ApiService } from 'app/Api/api.service';
import { NgxSpinnerService } from "ngx-spinner";
import Swal from 'sweetalert2';

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"]
})
export class NavbarComponent implements OnInit, AfterViewInit, OnDestroy {
  emp_name :string;
  currentLang = "en";
  selectedLanguageText = "English";
  selectedLanguageFlag = "./assets/img/flags/us.png";
  toggleClass = "ft-maximize";
  placement = "bottom-right";
  logoUrl = 'assets/img/logo.png';
  clientLogo = 'assets/img/logo-client.png'
  menuPosition = 'Side';
  isSmallScreen = false;
  protected innerWidth: any;
  searchOpenClass = "";
  transparentBGClass = "";
  hideSidebar: boolean = true;
  public isCollapsed = true;
  layoutSub: Subscription;
  configSub: Subscription;
  userInfo : any;

  @ViewChild('search') searchElement: ElementRef;
  @ViewChildren('searchResults') searchResults: QueryList<any>;

  @ViewChild("customizer") customizer: ElementRef;

  @Output()
  toggleHideSidebar = new EventEmitter<Object>();

  @Output()
  seachTextEmpty = new EventEmitter<boolean>();

  listItems = [];
  control = new FormControl();

  size: string;
  isBgImageDisplay: boolean = true;
  isOpen = true;
  public config: any = {};
  userInfos : any;
  userWorkStrms : any;
  selectedWrkStrm : any = '';


  userType = localStorage.getItem('UserType');
  clientName = localStorage.getItem('Name');

  constructor(private spinner: NgxSpinnerService,public translate: TranslateService,
    private renderer: Renderer2,
    private layoutService: LayoutService,
    private router: Router,
    private configService: ConfigService, private cdr: ChangeDetectorRef,
    public customizerService: CustomizerService,public customVars : CustomizerService,
    private  Apiservice:ApiService
    ) {

      // Attaching the event listener function to window's resize event


    //.log('User INfo --->', this.userInfo)
    const browserLang: string = translate.getBrowserLang();
    translate.use(browserLang.match(/en|es|pt|de/) ? browserLang : "en");
    this.config = this.configService.templateConf;
    this.innerWidth = window.innerWidth;

    this.layoutSub = layoutService.toggleSidebar$.subscribe(
      isShow => {
        this.hideSidebar = !isShow;
    });

    this.config = this.configService.templateConf;
    this.isOpen = !this.config.layout.customizer.hidden;

    if (this.config.layout.sidebar.size) {
      this.size = this.config.layout.sidebar.size;
    }
  }

  ngOnInit() {
    if(this.userType == 'client'){
      this.emp_name=localStorage.getItem('Name');

      this.userInfo = {
        'UserName' : localStorage.getItem('Name')
      }
    }else{
      console.log('S w -->',this.selectedWrkStrm);
      console.log('localhost w s-->', localStorage.getItem('selectedWrkStrm'));

      //this.selectedWrkStrm = Number(localStorage.getItem('selectedWrkStrm'));

      if(localStorage.getItem('selectedWrkStrm') === null){
          this.spinner.show();
          let id=localStorage.getItem('LoginId');
          this.Apiservice.get('WorkAllotment/GetWorkStream?id=' + id).subscribe((data: any) => {
            console.log('Navbar workstream-->',data);
            if (data.Item2 == false && data.Item2 == 'You are not authorized to access!')
            {
              Swal.fire({text: data.Item2,icon: 'warning'}).then(function(){
                //hadsf;
              });
              this.spinner.hide();
              return;
            }
            this.spinner.hide();
            this.userWorkStrms = data;
            if(this.userWorkStrms && this.userWorkStrms?.length >= 1){
                this.selectedWrkStrm = this.userWorkStrms[0]['wid'];
                //alert('IF-->'+this.selectedWrkStrm)
                localStorage.setItem('selectedWrkStrm',this.selectedWrkStrm);
                var ind = this.userWorkStrms.findIndex(x => x.wid === this.selectedWrkStrm);
                var finalObj = this.userWorkStrms[ind];
                localStorage.setItem('selectedWrkStrmObj', JSON.stringify(finalObj))
            }
          });
      }
      else{
        this.spinner.show();
        let id=localStorage.getItem('LoginId');
        this.Apiservice.get('WorkAllotment/GetWorkStream?id=' + id).subscribe((data: any) => {
          console.log('Navbar workstream-->',data);
          if (data = 'You are not authorized to access!')
          {
            return;
          }
          this.spinner.hide();
          this.userWorkStrms = data;
          this.selectedWrkStrm = Number(localStorage.getItem('selectedWrkStrm'));
          //alert('Else ->'+this.selectedWrkStrm);
        });

        this.spinner.hide();
      }



      this.userInfo = {
        'UserName' : localStorage.getItem('Name'),
        'corpId' : localStorage.getItem('CorpId'),
        'designation' : localStorage.getItem('Role'),
        'profileImg' : ''
      }
      //console.log('User Info--->', this.userInfo)

      this.emp_name=localStorage.getItem('Name');
      this.listItems = LISTITEMS;
    }


    if (this.innerWidth < 1200) {
      this.isSmallScreen = true;
    }
    else {
      this.isSmallScreen = false;
    }
  }

  ngAfterViewInit() {

    this.configSub = this.configService.templateConf$.subscribe((templateConf) => {
      if (templateConf) {
        this.config = templateConf;
      }
      this.loadLayout();
      this.cdr.markForCheck();

    })
  }

  ngOnDestroy() {
    if (this.layoutSub) {
      this.layoutSub.unsubscribe();
    }
    if (this.configSub) {
      this.configSub.unsubscribe();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = event.target.innerWidth;
    if (this.innerWidth < 1200) {
      this.isSmallScreen = true;
    }
    else {
      this.isSmallScreen = false;
    }
  }

  loadLayout() {

    if (this.config.layout.menuPosition && this.config.layout.menuPosition.toString().trim() != "") {
      this.menuPosition = this.config.layout.menuPosition;
    }

    if (this.config.layout.variant === "Light") {
      this.logoUrl = 'assets/img/misLogo.png';
    }
    else {
      this.logoUrl = 'assets/img/logo.png';
    }

    if (this.config.layout.variant === "Transparent") {
      this.transparentBGClass = this.config.layout.sidebar.backgroundColor;
    }
    else {
      this.transparentBGClass = "";
    }

  }

  onSearchKey(event: any) {
    if (this.searchResults && this.searchResults.length > 0) {
      this.searchResults.first.host.nativeElement.classList.add('first-active-item');
    }

    if (event.target.value === "") {
      this.seachTextEmpty.emit(true);
    }
    else {
      this.seachTextEmpty.emit(false);
    }
  }

  removeActiveClass() {
    if (this.searchResults && this.searchResults.length > 0) {
      this.searchResults.first.host.nativeElement.classList.remove('first-active-item');
    }
  }

  onEscEvent() {
    this.control.setValue("");
    this.searchOpenClass = '';
    this.seachTextEmpty.emit(true);
  }

  onEnter() {
    if (this.searchResults && this.searchResults.length > 0) {
      let url = this.searchResults.first.url;
      if (url && url != '') {
        this.control.setValue("");
        this.searchOpenClass = '';
        this.router.navigate([url]);
        this.seachTextEmpty.emit(true);
      }
    }
  }

  redirectTo(value) {
    this.router.navigate([value]);
    this.seachTextEmpty.emit(true);
  }


  ChangeLanguage(language: string) {
    this.translate.use(language);

    if (language === 'en') {
      this.selectedLanguageText = "English";
      this.selectedLanguageFlag = "./assets/img/flags/us.png";
    }
    else if (language === 'es') {
      this.selectedLanguageText = "Spanish";
      this.selectedLanguageFlag = "./assets/img/flags/es.png";
    }
    else if (language === 'pt') {
      this.selectedLanguageText = "Portuguese";
      this.selectedLanguageFlag = "./assets/img/flags/pt.png";
    }
    else if (language === 'de') {
      this.selectedLanguageText = "German";
      this.selectedLanguageFlag = "./assets/img/flags/de.png";
    }
  }

  ToggleClass() {
    if (this.toggleClass === "ft-maximize") {
      this.toggleClass = "ft-minimize";
    } else {
      this.toggleClass = "ft-maximize";
    }
  }

  toggleSearchOpenClass(display) {
    this.control.setValue("");
    if (display) {
      this.searchOpenClass = 'open';
      setTimeout(() => {
        this.searchElement.nativeElement.focus();
      }, 0);
    }
    else {
      this.searchOpenClass = '';
    }
    this.seachTextEmpty.emit(true);



  }



  toggleNotificationSidebar() {
    this.layoutService.toggleNotificationSidebar(true);
  }

  toggleSidebar() {
    this.layoutService.toggleSidebarSmallScreen(this.hideSidebar);
  }


  toggleCustomizer() {
    if (this.isOpen) {
      this.renderer.removeClass(this.customizer.nativeElement, "open");
      this.isOpen = false;
    } else {
      this.renderer.addClass(this.customizer.nativeElement, "open");
      this.isOpen = true;
    }
  }

  changeWrkStrm(){
    //alert('Change-->'+this.selectedWrkStrm)
    localStorage.setItem('selectedWrkStrm', this.selectedWrkStrm)
    //var wrkObj = JSON.parse(localStorage.getItem('WorkStreams'));
   // alert(this.selectedWrkStrm)
    //var ind = wrkObj.findIndex(x => {return (x.wid === this.selectedWrkStrm)});
    // console.log('Wks :', this.selectedWrkStrm)
    // var finalObj = wrkObj.filter(function (d) {
    //   return (d.wid === Number(this.selectedWrkStrm))
    // });



    //localStorage.setItem('selectedWrkStrmObj', JSON.stringify(finalObj));
//console.log('Selecte WOrkstream -->', finalObj)
   // return;
    //this.router.navigate(['/dashboard/dashboard']);
    location.reload();
  }

  logout(){
    //alert(1)
    var utype = localStorage.getItem('UserType');
    //alert(utype)
    if(utype == 'client'){
      var pstObj = {
        user    : localStorage.getItem('CorpId'),
        password: ""
      }

      this.Apiservice.postmethod('Login/UpdateLogout',pstObj).subscribe(async (data: any) => {
        console.log("Logout  --->", data);

      });
    }

    window.localStorage.clear();
    this.router.navigate(['/pages/login']);
  }





}
