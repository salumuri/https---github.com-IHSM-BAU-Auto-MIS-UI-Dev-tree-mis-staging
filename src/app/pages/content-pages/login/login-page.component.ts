import { Component, ViewChild, OnInit } from '@angular/core';
import { NgForm, FormGroup, FormControl, Validators, FormBuilder, } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { AuthService } from 'app/shared/auth/auth.service';
import { NgxSpinnerService } from "ngx-spinner";
import { ApiService } from '../../../Api/api.service';
import { CustomizerService } from '../../../shared/services/customizer.service';
import Swal from 'sweetalert2';
import { LocationStrategy } from '@angular/common';
import * as CryptoJS from 'crypto-js';
import { EncryptDecryptService } from '../../../common/encryptionAES.service';
import { GlobalConstants } from '../../../common/global-constants';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})

export class LoginPageComponent {

  public submitted  : boolean = false;
  public loginForm: FormGroup;
  public usertype = 'client';
  public userTypeSelection = false;
  chk:boolean=false;
  modelRadio = 1;
  clientInfo : any;
  logoClient = 'assets/img/logos/capture-login.png'
  disable:boolean=true;
  cData:any=''
  txtbody:any="";
  constructor(public encryptAES : EncryptDecryptService,private location: LocationStrategy,private router: Router, private authService: AuthService,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,private fB: FormBuilder, private  Apiservice:ApiService,
    public customVars : CustomizerService) {
      //console.log("URL -->",this.customVars.base_url)

      this.loginForm = this.fB.group({
        username   : ['', [Validators.required]],
        password     : ['', [Validators.required]],
        chkclient:['']
      })

      history.pushState(null, null, window.location.href);
      this.location.onPopState(() => {
        history.pushState(null, null, window.location.href);
      });
  }
  ngOnInit() {
    //localStorage.clear();
    // console.log($event.target.checked)
    var utype = localStorage.getItem('UserType');

    document.querySelector('body').setAttribute('themebg-pattern', 'theme1');
    if (this.authService.isAuthenticated() && utype != 'client') {
      this.router.navigate(['dashboard/dashboard']);
    }
  }

  //Check Login
  async onSubmit() {
    this.submitted = true;
    this.spinner.show();
    this.txtbody="Please find below link to Authenticate you login session. This OTP will valid till 2 minutes time only.";
    if (this.loginForm.invalid) {
      // this.errorMsg="";
       return;
    }

    if(this.usertype == ''){
      this.spinner.hide();
      this.swapAlerts('Please select type before you proceed.!','warning');
    }else{


    if(this.loginForm.value.chkclient==true)
      this.chk=true
    else
      this.chk=false;

    var uid = (this.loginForm.value.username).toLowerCase();
    var pwd = (this.loginForm.value.password).toLowerCase();

    let obj={
      "user": this.encryptAES.encryptUsingAES256(uid),
      "password": this.encryptAES.encryptUsingAES256(pwd),

      // "user": this.loginForm.value.username,
      // "password": this.loginForm.value.password,
      // "isClient": this.chk,
      "isClient":false,
    }



      var userid = obj.user.toString().replace('+','plus');
      var upwd = obj.password.toString().replace('+','plus');

      console.log('testlogin', obj);
      //return
      if(this.usertype == 'client'){

       this.Apiservice.get('Login/GetClientLogin?user='+userid+'&password='+upwd).subscribe(async (data:any)=>{
          console.log('Client Info-->', data);

          if(data.length > 0 && data[0].Status == "True"){
            var userInfo = data[0];

            var date1 = new Date(data[0].authoTime);
            var date2 = new Date(data[0].currenttime);

            let seconds = Math.round((date2.getTime() - date1.getTime()) / 1000);
            const minutes = Math.floor(seconds / 60);
            //var minutes = Math.floor(res / 60) % 60;

            //console.log('Selected Mints-->', minutes);
            localStorage.setItem('UserCientInfo',JSON.stringify(userInfo))
            localStorage.setItem('CorpId', userInfo.emp_no);
            localStorage.setItem('UserType', 'client');
            localStorage.setItem('Name',userInfo.emp_name);
            localStorage.setItem('Role','client');
            localStorage.setItem('LoginId', data[0].id);
            localStorage.setItem('UserId', data[0].EmailAddress);
            //localStorage.setItem('Islogin','Y');

            if(minutes >= 2){
              //alert('Blocl 1');
              var randamCode  = this.randomString(30,16);

              var pstObj = {
                randCode : randamCode,
                id       : data[0].id
              }

              this.Apiservice.postmethod('Login/UpdateRandCode',pstObj).subscribe(async (data: any) => {
                console.log("Updated Code  --->", data);
                  if(data[0] && data[0].Status == '1'){
                        //return data[0].status;
                    localStorage.setItem('AuthCode',randamCode);

                     this.sendMail(userInfo.emp_name,userInfo.email,randamCode,this.txtbody);

                      var txt = '<h5>Enter code sent to your EMail ID!</h5>'
                      const { value : authVal } = await Swal.fire({
                        html : txt,
                        text: "",
                        width: '700px',
                        input: 'password',
                        showCancelButton: true,
                        inputPlaceholder: 'Enter your Authentication code',
                        inputValidator: (result) => {
                          return !result && 'Code Required'
                        }
                      })

                        if(authVal != ''){

                          this.Apiservice.get('Login/GetClientLogin?user='+userid+'&password='+upwd).subscribe(async (data:any)=>{
                            console.log('Client Info 2-->', data);

                            if(data.length > 0 && data[0].Status == "True"){
                              let userInfo = data[0];
                              this.clientInfo = userInfo;
                              localStorage.setItem('UserCientInfo', JSON.stringify(this.clientInfo));
                              localStorage.setItem('Name',userInfo.emp_name);
                              // if(data.Item2.length >  0){
                              //   localStorage.setItem('UserMenu', JSON.stringify(data.Item2));
                              // }

                              let date1 = new Date(data[0].authoTime);
                              let date2 = new Date(data[0].currenttime);

                              let seconds = Math.round((date2.getTime() - date1.getTime()) / 1000);
                              const minutes = Math.floor(seconds / 60);
                              //var minutes = Math.floor(res / 60) % 60;

                              console.log('Selected Mints 2 > 2-->', minutes);

                              if(minutes >= 2){
                                //alert('Blocl 1 - 2');
                                let randamCode3  = this.randomString(30,16);

                                this.updateRandomCode(userInfo.id,userInfo.emp_name,userInfo.email,randamCode3);
                              }

                              var pstObj = {
                                user : obj.user,
                                password : obj.password,
                                authcode : authVal
                              }

                              this.Apiservice.postmethod('Login/AuthenticationAuthCode',pstObj).subscribe(async (data: any) => {
                                  console.log('Data Resp 11: ',data)
                                  if(data[0] && data[0].Status == '1'){
                                    localStorage.setItem('Islogin','Y');
                                    this.router.navigate(['/dashboard/dashboard']);
                                  }else{
                                    this.swapAlerts('Invalid Authnetication Code.!','warning');
                                    return false;
                                  }
                              });
                          }
                        });
                        }else{
                          this.swapAlerts('Please enter Authnetication Code.!','warning');
                        }

                        // localStorage.setItem('Islogin','Y');
                        // this.router.navigate(['dashboard/dashboard']);
                  }

              });


            }else if(minutes < 2 && data[0].authCodeValidate == 'False' && data[0].authCode != ''){
              //alert('I am else;')
              //alert('Blocl 2');
              randamCode  = this.randomString(30,16);

              var txt = '<h5>Enter code sent to your EMail ID!</h5>'
              const { value : authVal } = await Swal.fire({
                html : txt,
                text: "",
                width: '700px',
                input: 'text',
                showCancelButton: true,
                inputPlaceholder: 'Enter your Authentication code',
                inputValidator: (result) => {
                  return !result && 'Code Required'
                }
              })

              if(authVal != ''){
                //alert('Blocl 2');
                this.Apiservice.get('Login/GetClientLogin?user='+userid+'&password='+upwd).subscribe(async (data:any)=>{
                  console.log('Client Info 3-->', data);

                  if(data.length > 0 && data[0].Status == "True"){
                    let userInfo = data[0];

                    let date1 = new Date(data[0].authoTime);
                    let date2 = new Date(data[0].currenttime);

                    let seconds = Math.round((date2.getTime() - date1.getTime()) / 1000);
                    const minutes = Math.floor(seconds / 60);
                    //var minutes = Math.floor(res / 60) % 60;

                    console.log('Selected Mints 2 > 3-->', minutes);

                    if(minutes >= 2){
                      //alert('Blocl 2 -> 2');
                      let randamCode1  = this.randomString(30,16);

                      this.updateRandomCode(userInfo.id,userInfo.emp_name,userInfo.email,randamCode1);
                    }



                      var pstObj2 = {
                        user : obj.user,
                        password : obj.password,
                        authcode : authVal
                      }

                      this.Apiservice.postmethod('Login/AuthenticationAuthCode',pstObj2).subscribe(async (data: any) => {
                          console.log('Data Resp 22: ',data);

                          if(data[0].Status == '1'){
                            localStorage.setItem('Islogin','Y');
                            this.router.navigate(['/dashboard/dashboard']);
                          }else{
                            this.swapAlerts('Invalid Authnetication Code.!','warning');
                          }
                      });
                    }
              });
            }
            }else if(minutes < 2 && data[0].authCodeValidate == 'False' && data[0].authCode == ''){
             // alert('Blocl 3');
             //alert('Blocl 3');
             var randamCode  = this.randomString(30,16);

              var pstObj = {
                randCode : randamCode,
                id       : data[0].id
              }

              this.Apiservice.postmethod('Login/UpdateRandCode',pstObj).subscribe(async (data: any) => {
                console.log("Updated Code  --->", data);
                  if(data[0] && data[0].Status == '1'){
                        //return data[0].status;
                      localStorage.setItem('AuthCode',randamCode);
                      
                      var htmlBody = this.authCodeEmailContent(userInfo.emp_name,randamCode,this.txtbody);

                      var mailObj = {
                        FromMailID  : 'dontreply.miskakinada@cyient.com',
                        ToMailId    : userInfo.email,
                        subject     : 'Login Authentication',
                        body        : htmlBody,
                        CcMailId    : '',
                        BCcMailId   : '',
                        attachmentfilepath : ''
                      }

                      this.Apiservice.postmethod('Login/SendClientAuthCode',mailObj).subscribe(async (data: any) => {
                          //console.log('Mail Resp -->', data);
                          if(data.Item2.Result == 'True' || data.Item2.Result == true){

                          }else{
                            this.swapAlerts('Unable to Send Email.!','warning');
                            return false;
                          }
                      });


              var txt = '<h5>Enter code sent to your EMail ID!</h5>'
              const { value : authVal } = await Swal.fire({
                html : txt,
                text: "",
                width: '700px',
                input: 'text',
                showCancelButton: true,
                inputPlaceholder: 'Enter your Authentication code',
                inputValidator: (result) => {
                  return !result && 'Code Required'
                }
              })

              if(authVal != ''){


                this.Apiservice.get('Login/GetClientLogin?user='+obj.user+'&password='+obj.password).subscribe(async (data:any)=>{
                  console.log('Client Info 4-->', data);

                  if(data.length > 0 && data[0].Status == "True"){
                    let userInfo = data[0];

                    let date1 = new Date(data[0].authoTime);
                    let date2 = new Date(data[0].currenttime);

                    let seconds = Math.round((date2.getTime() - date1.getTime()) / 1000);
                    const minutes = Math.floor(seconds / 60);
                    //var minutes = Math.floor(res / 60) % 60;

                    console.log('Selected Mints 3 > 3-->', minutes);

                    if(minutes >= 2){
                      //alert('Blocl 3 -> 3');
                      let randamCode2  = this.randomString(30,16);

                      this.updateRandomCode(userInfo.id,userInfo.emp_name,userInfo.email,randamCode2);
                    }


                var pstObj2 = {
                  user : obj.user,
                  password : obj.password,
                  authcode : authVal
                }

                this.Apiservice.postmethod('Login/AuthenticationAuthCode',pstObj2).subscribe(async (data: any) => {
                    console.log('Data Resp 22: ',data);

                    if(data[0].Status == '1'){
                      localStorage.setItem('Islogin','Y');
                      this.router.navigate(['/dashboard/dashboard']);
                    }else{
                      this.swapAlerts('Invalid Authnetication Code.!','warning');
                    }
                });
              }
              });
              }
               }
              });
            }else if(data[0].authCodeValidate == 'True'){
                //alert('Else.!')
                localStorage.setItem('Islogin','Y');
                this.router.navigate(['/dashboard/dashboard']);

            }


            this.spinner.hide();
          }else{

                this.spinner.hide();
                this.swapAlerts('Invalid UserName or Password.!','error');
          }

        });

        // alert(email);

        // if (email) {
        //   Swal.fire(`Entered email: ${email}`)
        // }


      }else{
        let obj1={
          "user": this.encryptAES.encryptUsingAES256(this.loginForm.value.username),
          "password": this.encryptAES.encryptUsingAES256(this.loginForm.value.password),
          "isClient":false,
        }

        this.Apiservice.postmethod('Login',obj1).subscribe((data:any)=>{
              console.log('login Data--->',data);
              //return;
              if(!data.Item1 || data.Item1 == undefined || data == null || data == 'null'){
                this.spinner.hide();
                this.swapAlerts('Something went wrong please try again.!','error');
              }


              if(data.Item1==true && data.Item2.length != 0 && data.Item2 != null && data.Item2 != 'null'){

                if(data.Item2.length >  0){
                    localStorage.setItem('UserMenu', JSON.stringify(data.Item2));
                }

                if(data?.Item3){
                  localStorage.setItem('userToken', JSON.stringify(data.Item3));
                }

                var workStrms = []
                var userRule = [];
                data.Item2.forEach(x => {
                    var obj = {
                      'wid' : x.wid,
                      'w_name' : x.w_name
                    }

                    workStrms.push(obj);
                });

                var rules = {
                  'checklist' : data.Item2[0].checklist,
                  'mapsupload' : data.Item2[0].mapsupload,
                  'bulkAllot' : data.Item2[0].bulkWorkallot,
                  'bulkTimeentry' : data.Item2[0].bulkTimeentry
                }

                // this.getEmpdeatails(data.item3);
                this.customVars.loginUserInfo = data.Item2[0];
                localStorage.setItem('UserType', 'cuser');
                localStorage.setItem('CorpId', data.Item2[0].emp_id);
                localStorage.setItem('LoginId',data.Item2[0].id);
                localStorage.setItem('Name',data.Item2[0].emp_name);
                localStorage.setItem('Role',data.Item2[0].designation);
                localStorage.setItem('Project',data.Item2[0].workstream);
                localStorage.setItem('Service',data.Item2[0].service);
                localStorage.setItem('Batch',data.Item2[0].batch);
                localStorage.setItem('taskManagerId',data.Item2[0].taskManagerId);
                localStorage.setItem('taskManagerName',data.Item2[0].taskManagerName);
                localStorage.setItem('WorkStreams',  JSON.stringify(workStrms));
                localStorage.setItem('UserRules', JSON.stringify(rules));
                localStorage.setItem('glid',data.Item2[0].glid);
                localStorage.setItem('glName',data.Item2[0].glName);
                localStorage.setItem('level_code',data.Item2[0].level_code);
                //this.CheckSurvey();
                this.router.navigate(['dashboard/dashboard']);
                localStorage.setItem('Islogin','Y');
                setTimeout(() => {
                  this.loginForm.reset();
                }, 2000);

                this.spinner.hide();
              }
              else{
                //alert(data.Item2);
                this.spinner.hide();
                var resp = data.Item2;
                this.swapAlerts('User does not exist..','error');
              }
          });
      }

      // this.router.navigate(['/dashboard/home'])

    }
  }



  updateRandomCode(id,empname,email,randcode){
    //alert("updateRandomCode Mail --"+email);

    //var randamCode  = this.randomString(30,16);

    var pstObj = {
      randCode : randcode,
      id       : id
    }

    this.Apiservice.postmethod('Login/UpdateRandCode',pstObj).subscribe(async (data: any) => {
      console.log('Re Rand Code Updated.!');
      
      this.sendMail(empname,email,randcode,this.txtbody);
    });

  }

  sendMail(empname,email,randcode,body){
    //alert("Send Mail --"+email);
     
     var htmlBody = this.authCodeEmailContent(empname,randcode,body);

     var mailObj = {
      FromMailID  : 'dontreply.miskakinada@cyient.com',
      ToMailId    : email,
      subject     : 'Login Authentication',
      body        : htmlBody,
      CcMailId    : '',
      BCcMailId   : '',
      attachmentfilepath : ''
    }


     this.Apiservice.postmethod('Login/SendClientAuthCode',mailObj).subscribe(async (data: any) => {
      console.log('Mail Resp -->', data);
      if(data.Item2.Result == 'True' || data.Item2.Result == true){

      }else{
        this.swapAlerts('Unable to Send Email.!','warning');
        return false;
      }
  });

  }




  authCodeEmailContent(name,code,body){
    return `<!doctype html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Simple Transactional Email</title>
        <style>
      @media only screen and (max-width: 850px) {
      table.body h1 {
        font-size: 28px !important;
        margin-bottom: 10px !important;
      }

      table.body p,
      table.body ul,
      table.body ol,
      table.body td,
      table.body span,
      table.body a {
        font-size: 16px !important;
      }

      table.body .wrapper,
      table.body .article {
        padding: 10px !important;
      }

      table.body .content {
        padding: 0 !important;
      }

      table.body .container {
        padding: 0 !important;
        width: 100% !important;
      }

      table.body .main {
        border-left-width: 0 !important;
        border-radius: 0 !important;
        border-right-width: 0 !important;
      }

      table.body .btn table {
        width: 100% !important;
      }

      table.body .btn a {
        width: 100% !important;
      }

      table.body .img-responsive {
        height: auto !important;
        max-width: 100% !important;
        width: auto !important;
      }
    }
    @media all {
      .ExternalClass {
        width: 100%;
      }

      .ExternalClass,
    .ExternalClass p,
    .ExternalClass span,
    .ExternalClass font,
    .ExternalClass td,
    .ExternalClass div {
        line-height: 100%;
      }

      .apple-link a {
        color: inherit !important;
        font-family: inherit !important;
        font-size: inherit !important;
        font-weight: inherit !important;
        line-height: inherit !important;
        text-decoration: none !important;
      }

      #MessageViewBody a {
        color: inherit;
        text-decoration: none;
        font-size: inherit;
        font-family: inherit;
        font-weight: inherit;
        line-height: inherit;
      }

      .btn-primary table td:hover {
        background-color: #34495e !important;
      }

      .btn-primary a:hover {
        background-color: #34495e !important;
        border-color: #34495e !important;
      }
    }
    </style>

      </head>
      <body style="background-color: #f6f6f6; font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.4; margin: 0; padding: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
        <span class="preheader" style="color: transparent; display: none; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden; width: 0;">This is preheader text. Some clients will show this text as a preview.</span>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f6f6f6; width: 100%;" width="100%" bgcolor="#f6f6f6">
          <tr>
            <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
            <td class="container" style="font-family: sans-serif; font-size: 14px; vertical-align: top; display: block; max-width: 880px; padding: 10px; width: 880px; margin: 0 auto;" valign="top">
              <div class="content" style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 880px; padding: 10px;">

                <!-- START CENTERED WHITE CONTAINER -->
                <table role="presentation" class="main" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #ffffff; border-radius: 3px; width: 100%;" width="100%">

                  <!-- START MAIN CONTENT AREA -->
                  <tr>
                    <td class="wrapper" style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;" valign="top">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
                        <tr>
                          <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">
                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Dear `+ name +`,</p>
                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">`+ body +`</p>
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; box-sizing: border-box; width: 100%;" width="100%">
                              <tbody>
                                <tr>
                                  <td align="left" style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding-bottom: 15px;" valign="top">
                                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: auto;">
                                      <tbody>
                                        <tr>
                                          <td style="color:white; font-family: sans-serif; font-size: 14px; vertical-align: top; border-radius: 5px; text-align: center; background-color: #3498db;" valign="top" align="center" bgcolor="#3498db">
                                         <span id="authcode" value="`+ code +`" style="border: solid 1px #3498db; border-radius: 5px; box-sizing: border-box; cursor: pointer; display: inline-block; font-size: 14px; font-weight: bold; margin: 0; padding: 12px 25px; text-decoration: none; text-transform: capitalize; background-color: #3498db; border-color: #3498db; color: #ffffff;"> Code : `+ code +`</span>
                                         &nbsp;&nbsp;
                                         </td>

                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Thank you.</p>
                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Regards,<br>S&P Global Team</p>

                            </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                <!-- END MAIN CONTENT AREA -->
                </table>
                <!-- END CENTERED WHITE CONTAINER -->

                <!-- START FOOTER -->
                <div class="footer" style="clear: both; margin-top: 10px; text-align: center; width: 100%;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">

                    <tr>
                      <td class="content-block powered-by" style="font-family: sans-serif; vertical-align: top; padding-bottom: 10px; padding-top: 10px; color: #999999; font-size: 12px; text-align: center;" valign="top" align="center">
                        Powered by <a href="https://www.cyient.com/" style="color: #999999; font-size: 12px; text-align: center; text-decoration: none;">Cyient</a>.
                      </td>
                    </tr>
                  </table>
                </div>
                <!-- END FOOTER -->
              </div>
            </td>
            <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
          </tr>
        </table>

      </body>
    </html>`
  }

  //Randaom Code

  randomString (len, bits)
  {
      bits = bits || 36;
      var outStr = "", newStr;
      while (outStr.length < len)
      {
          newStr = Math.random().toString(bits).slice(2);
          outStr += newStr.slice(0, Math.min(newStr.length, (len - outStr.length)));
      }
      return outStr.toUpperCase();
  }

  diffGetTime(date1, date2) {
    return date2.getTime() - date1.getTime();
  }


  time_convert(num)
 {
  var hours = Math.floor(num / 60);
  var minutes = num % 60;
  return hours + ":" + minutes;
}

  //Sweet Alert
  swapAlerts(msg,icon){
    return Swal.fire({
        icon: icon,title: '',text: msg,
        customClass: {
          confirmButton: 'btn btn-danger',
        },
        buttonsStyling: false
      }).then(function() {
        return false;
      });
    }

  CheckSurvey() {
    let id=localStorage.getItem('LoginId');
    this.Apiservice.get('Survey/GetEmpSurveyStatus?Empid='+id).subscribe((data: any) => {
     if(data==0)
    localStorage.setItem('Survey','0');
    else
    localStorage.setItem('Survey','1');
    });
  }

  changeUserType(utype){
    //console.log('User TYpe-->', utype)
    if(utype != ''){
      this.userTypeSelection = false;
    }else{
      this.userTypeSelection = true;
    }
  }


  getUserType(utype){
    this.spinner.show();
    this.usertype = utype;


    this.spinner.hide();
  }


  chkclient(ev){
    // var target = ''
    // console.log(ev.target.checked)
    //   if(ev.target.checked == true){
    //     this.usertype = 'client';
    //   }
    //   else{
    //     this.usertype = 'cuser';
    //   }
    console.log(ev.target.checked)
    if(ev.target.checked == true){
      this.usertype = 'client';      
      this.disable=true;     
    }
    if (ev.target.checked == false ){
      this.usertype = 'cuser';
      this.disable=false;           
    }
  }
  forgotClient(){
    this.txtbody="Please find below is your Password.";
    console.log('forgot my pwd');
    var uid = (this.loginForm.value.username).toLowerCase();
    if(uid!="")
    {
      var cUser= this.encryptAES.encryptUsingAES256(uid);
      var rUser = cUser.replace('+','plus');
      console.log('forgot my pwd2',rUser);
      this.Apiservice.get('Login/ClientUserCheck?user='+rUser).subscribe((data: any) => {
        
        console.log('hi');
        if(data.length > 0 && data[0].Status == "True"){        
          this.cData = data[0];
          console.log('My Response--->',  this.cData.email);
          console.log('Response--->', data);
          var mypw=this.encryptAES.decryptUsingAES256(this.cData.pwd)
          this.sendMail(this.cData.emp_name,this.cData.email,mypw,this.txtbody);
          
          Swal.fire({text: "Password Shared to Your Registered Mail Id.",icon: 'success'});
         
        }
        else{
          this.swapAlerts('Please enter valid User Id','warning');
          return false;
        }
        
      });
      
    }
    else{
      this.swapAlerts('Please enter User Id','warning');
      return false;
    }
    


  }

}
