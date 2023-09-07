// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
//http://172.17.30.73:8095/gpvpn_mistest

// export const environment = {
//   //Local
  // ApiUrl:'https://localhost:9695/api/'

//   //Live
//   //ApiUrl:'http://172.17.30.73:8052/api/', //Testing

//   //ApiUrl:'http://172.17.30.73:8096/api/', //(GPVPN Tetsing API given to Eeswar)
//   production: true
// };


export const environment = { 

  // ApiUrl:'https://localhost:44313/api/',

  // ApiUrl: 'https://misapi.cyient.com/mis-stagingapi/api/', 

ApiUrl: 'https://techdataportals.cyient.com/misapi/api/',   
// ApiUrl: 'https://techdataportals.cyient.com/misnodeapi/api/',
// 


  // ApiUrl: 'https://misapi.cyient.com/mis-liveapi/api/', 
  //ApiUrl:'http://172.17.30.83:80/api/',

  // ApiUrl: 'https://techdataportals.cyient.com/misapi/api/',

  // ApiUrl: 'https://misapi.cyient.com:443/api/',

  //ApiUrl: 'https://192.168.66.12:443/api/',


 // ApiUrl: 'http://172.17.30.88/misapi/api/',

  // ApiUrl:'http://172.17.30.73:8096/api/', //(GPVPN Tetsing API given to Eeswar)
  //ApiUrl:'http://172.17.30.73:443/api/',
  //ApiUrl:'http://172.17.30.73:443/api/',  //(Live API)

  production: false

  };
