import {
  Component, OnInit, ViewChild, OnDestroy,
  ElementRef, AfterViewInit, ChangeDetectorRef, HostListener
} from "@angular/core";
import { ROUTES ,ROUTES2, VCLIENTDASHBOARD} from './vertical-menu-routes.config';
import { HROUTES, HROUTES2, CLIENTDASHBOARD } from '../horizontal-menu/navigation-routes.config';

import { Router } from "@angular/router";
import { TranslateService } from '@ngx-translate/core';
import { customAnimations } from "../animations/custom-animations";
import { DeviceDetectorService } from 'ngx-device-detector';
import { ConfigService } from '../services/config.service';
import { Subscription } from 'rxjs';
import { LayoutService } from '../services/layout.service';

@Component({
  selector: "app-sidebar",
  templateUrl: "./vertical-menu.component.html",
  animations: customAnimations
})
export class VerticalMenuComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('toggleIcon') toggleIcon: ElementRef;
  public menuItems: any[];
  level: number = 0;
  logoUrl = 'assets/img/logo.png';
  public config: any = {};
  protected innerWidth: any;
  layoutSub: Subscription;
  configSub: Subscription;
  perfectScrollbarEnable = true;
  collapseSidebar = false;
  resizeTimeout;
  userType = localStorage.getItem('UserType');
  userInfo : any;
  userWorkStrms : any;
  userRules = localStorage.getItem('UserRules');
  userMnu : any;

  constructor(
    private router: Router,
    public translate: TranslateService,
    private layoutService: LayoutService,
    private configService: ConfigService,
    private cdr: ChangeDetectorRef,
    private deviceService: DeviceDetectorService
  ) {
    this.config = this.configService.templateConf;
    this.innerWidth = window.innerWidth;
    this.isTouchDevice();
  }


  ngOnInit() {
    if(this.userType == 'cuser'){
      var menuResp = JSON.parse(localStorage.getItem('UserMenu'));
      console.log('UserMenu :', menuResp);

      var selWorkstream = Number(localStorage.getItem('selectedWrkStrm'));
      //alert(selWorkstream);
      this.userMnu = menuResp.filter(function (d) {
        return (d.wid === selWorkstream)
      });

      localStorage.setItem('selectedWrkStrmObj',this.userMnu);
      console.log('Final Menu -->', this.userMnu)

      var userDesg = localStorage.getItem('Role');
      if(userDesg.includes("Manager")){
        this.menuItems = ROUTES;
      }else{
        this.menuItems = ROUTES2;
      }
    }else if(this.userType == 'client'){
        this.menuItems = VCLIENTDASHBOARD
    }

    console.log('Menu Items -->', this.menuItems);
  }


  ngAfterViewInit() {

    this.configSub = this.configService.templateConf$.subscribe((templateConf) => {
      if (templateConf) {
        this.config = templateConf;
      }
      this.loadLayout();
      this.cdr.markForCheck();

    });

    this.layoutSub = this.layoutService.overlaySidebarToggle$.subscribe(
      collapse => {
        if (this.config.layout.menuPosition === "Side") {
          this.collapseSidebar = collapse;
        }
      });

  }


  @HostListener('window:resize', ['$event'])
  onWindowResize(event) {
      if (this.resizeTimeout) {
          clearTimeout(this.resizeTimeout);
      }
      this.resizeTimeout = setTimeout((() => {
        this.innerWidth = event.target.innerWidth;
          this.loadLayout();
      }).bind(this), 500);
  }

  loadLayout() {

    if (this.config.layout.menuPosition === "Top") { // Horizontal Menu
      if (this.innerWidth < 1200) { // Screen size < 1200
        if(this.userType == 'cuser'){
          var menuResp = JSON.parse(localStorage.getItem('UserMenu'));
          console.log('UserMenu :', menuResp);

          var selWorkstream = Number(localStorage.getItem('selectedWrkStrm'));
          //alert(selWorkstream);
          this.userMnu = menuResp.filter(function (d) {
            return (d.wid === selWorkstream)
          });

          localStorage.setItem('selectedWrkStrmObj',this.userMnu);
          console.log('Final Menu -->', this.userMnu)

          var userDesg = localStorage.getItem('Role');
          if(userDesg.includes("Manager")){
            this.menuItems = HROUTES;
          }else{
            this.menuItems = HROUTES2;
          }
        }else if(this.userType == 'client'){
            this.menuItems = CLIENTDASHBOARD
        }
      }
    }
    else if (this.config.layout.menuPosition === "Side") { // Vertical Menu{

      if(this.userType == 'cuser'){
        var menuResp = JSON.parse(localStorage.getItem('UserMenu'));
        console.log('UserMenu :', menuResp);

        var selWorkstream = Number(localStorage.getItem('selectedWrkStrm'));
        //alert(selWorkstream);
        this.userMnu = menuResp.filter(function (d) {
          return (d.wid === selWorkstream)
        });

        localStorage.setItem('selectedWrkStrmObj',this.userMnu);
        console.log('Final Menu -->', this.userMnu)

        var userDesg = localStorage.getItem('Role');
        if(userDesg.includes("Manager")){
          this.menuItems = ROUTES;
        }else{
          this.menuItems = ROUTES2;
        }
      }else if(this.userType == 'client'){
          this.menuItems = VCLIENTDASHBOARD
      }
    }




    if (this.config.layout.sidebar.backgroundColor === 'white') {
      this.logoUrl = 'assets/img/logo-dark.png';
    }
    else {
      this.logoUrl = 'assets/img/logo.png';
    }

    if(this.config.layout.sidebar.collapsed) {
      this.collapseSidebar = true;
    }
    else {
      this.collapseSidebar = false;
    }
  }

  toggleSidebar() {
    let conf = this.config;
    conf.layout.sidebar.collapsed = !this.config.layout.sidebar.collapsed;
    this.configService.applyTemplateConfigChange({ layout: conf.layout });

    setTimeout(() => {
      this.fireRefreshEventOnWindow();
    }, 300);
  }

  fireRefreshEventOnWindow = function () {
    const evt = document.createEvent("HTMLEvents");
    evt.initEvent("resize", true, false);
    window.dispatchEvent(evt);
  };

  CloseSidebar() {
    this.layoutService.toggleSidebarSmallScreen(false);
  }

  isTouchDevice() {

    const isMobile = this.deviceService.isMobile();
    const isTablet = this.deviceService.isTablet();

    if (isMobile || isTablet) {
      this.perfectScrollbarEnable = false;
    }
    else {
      this.perfectScrollbarEnable = true;
    }

  }


  ngOnDestroy() {
    if (this.layoutSub) {
      this.layoutSub.unsubscribe();
    }
    if (this.configSub) {
      this.configSub.unsubscribe();
    }

  }



}
