import { Component, OnInit, ChangeDetectorRef, AfterViewInit, OnDestroy } from '@angular/core';
import { HROUTES, HROUTES2, CLIENTDASHBOARD , HROUTES3} from './navigation-routes.config';
import { LayoutService } from '../services/layout.service';
import { ConfigService } from '../services/config.service';
import { Subscription } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { CustomizerService } from '../../shared/services/customizer.service';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


@Component({
  selector: 'app-horizontal-menu',
  templateUrl: './horizontal-menu.component.html',
  styleUrls: ['./horizontal-menu.component.scss']
})

export class HorizontalMenuComponent implements OnInit, AfterViewInit, OnDestroy {

  public menuItems: any[];
  public config: any = {};
  level: number = 0;
  transparentBGClass = "";
  menuPosition = 'Side';
  userInfo : any;
  userWorkStrms : any;
  userType = localStorage.getItem('UserType');
  layoutSub: Subscription;
  userRules = localStorage.getItem('UserRules');
  userMnu : any;
  userCorp =localStorage.getItem('CorpId');
    



  constructor(private layoutService: LayoutService,
    private configService: ConfigService,
    private cdr: ChangeDetectorRef,
    private router: Router, public customVars : CustomizerService) {
    this.userWorkStrms = JSON.parse(localStorage.getItem('WorkStreams'));
    this.config = this.configService.templateConf;


    //alert('URL : '+this.router.url);

  }

  ngOnInit() {
    //console.log('User type-->', this.userType);
    //console.log('Rules -->', JSON.parse(this.userRules));

    console.log('CORP type-->', this.userCorp);

    // if (this.userCorp == 'GK60353')
    // {
    //   this.menuItems = E3Sync;
    //   console.log(this.menuItems)
    // }


    console.log('CORP type-->', this.userCorp);
    console.log('CORP type-->', this.userType);


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
      console.log(userDesg)
      if(userDesg.includes("Manager")){
        if (this.userCorp == 'GK60353'  || this.userCorp == 'SK28079'){
              this.menuItems = HROUTES3;
              //console.log(this.menuItems)
        }
          else
              this.menuItems = HROUTES;
      }else if (this.userCorp == 'GK60353' || this.userCorp == 'SK28079'){
        this.menuItems = HROUTES3;
       // alert('hi')
      }
      else
     {
        this.menuItems = HROUTES2;
      }
    }else if(this.userType == 'client'){
        this.menuItems = CLIENTDASHBOARD
    }

    console.log('Menu---> ', this.menuItems)

    this.userInfo = this.customVars.loginUserInfo;
    this.userRules = this.customVars.userRules;
    //console.log('User Info menu page--->', this.userRules)
  }

  ngAfterViewInit() {
    this.layoutSub = this.configService.templateConf$.subscribe((templateConf) => {
      if (templateConf) {
        this.config = templateConf;
      }
      this.loadLayout();
      this.cdr.markForCheck();
    })
  }

  loadLayout() {
    if (this.config.layout.menuPosition && this.config.layout.menuPosition.toString().trim() != "") {
      this.menuPosition = this.config.layout.menuPosition;
    }
    if (this.config.layout.variant === "Transparent") {
      this.transparentBGClass = this.config.layout.sidebar.backgroundColor;
    }
    else {
      this.transparentBGClass = "";
    }
  }


  getMenuAccess(submn){
    //console.log('User info-->', this.userRules)
    if(submn.submenu.length === 0 && !submn.isExternalLink && submn.title == 'Maps' && this.userRules && this.userRules['mapsupload'] == 0){
          return false
    }
    // else if(submn.submenu.length === 0 && !submn.isExternalLink && submn.title != 'Maps' && this.userRules['mapsupload'] == 1){
    //     return true
    // }
    else{
        return true
    }
  }
  ngOnDestroy() {
    if (this.layoutSub) {
      this.layoutSub.unsubscribe();
    }
  }

}
