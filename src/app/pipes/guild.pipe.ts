import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'guild'
})
export class GuildPipe implements PipeTransform {

  transform(value: any[], args?: string): any[] {
    if (value) {
      return value.filter(object => {
        return object[args] !== undefined;
      })
    }
  }

}
