import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';


export class GlobalConstants {
  public static currentURL : string = '';
  public static requentUrls : any = [];
  // public static EncryptKey = '1203199320052021';
  // public static EncryptIV = '1203199320052021';

  public static EncryptKey = '1433199320052021';
  public static EncryptIV = '1433199320052021';
 //Excel Export with Full object

 exportArrayToExcel(arr: any[], name?: string) {

  var wb = XLSX.utils.book_new();

  var ws = XLSX.utils.json_to_sheet(arr);

  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  XLSX.writeFile(wb, `${name}.xlsx`);

}

  checkOriginAccess(dt){
    var hostName = window.location.host;
    if(dt.Item2 &&  dt.Item2 == 'You are not authorized to access!'){
      //window.location.href = "pages/login";
      //Window.location = "http://www.yoururl.com";
      //window.location.replace('#/pages/login');
      Swal.fire({text: dt.Item2,icon: 'warning'}).then(function(){
        window.localStorage.clear();
        document.location = "/pages/login";
      });

    }
  }
}
