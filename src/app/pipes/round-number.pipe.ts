import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'roundNumber'
})
export class RoundNumberPipe implements PipeTransform {

  transform(value: number, args?: number): any {
    console.log(value + '   ' + args);
    return Number(value.toFixed(args));
  }

}
