import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'soundCommand'
})
export class SoundCommandPipe implements PipeTransform {

  transform(value: any, args?: string): any {
    if (value) {
      return value.filter(object => {
        return object.command.includes(args) || object.description.includes(args);
      })
    }
  }
}
