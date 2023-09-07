import { Pipe, PipeTransform } from '@angular/core';
import { filter } from 'rxjs/operators';

@Pipe({
  name: 'empFilter'
})

export class EmpFilterPipe implements PipeTransform {

  transform(data: any[], filterType: Object): any {
    if (!data || !filter) {
        return data;
    }
    return data.filter(item => item.emp_id.indexOf(filterType) !== -1);
  }

}
