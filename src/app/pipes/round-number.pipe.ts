import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'roundNumber'
})
export class RoundNumberPipe implements PipeTransform {

  transform(value: number, args?: number): any {
    if (typeof value !== 'number') {
      return 0;
    }
    return Number(value.toFixed(args));
  }

}
