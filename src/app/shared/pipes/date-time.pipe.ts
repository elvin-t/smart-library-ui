import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'appDateTime',
  standalone: true
})
export class DateTimePipe implements PipeTransform {

  private readonly datePipe = new DatePipe('en-IN');

  transform(value: string | Date | null | undefined): string {
    if (!value) {
      return '-';
    }

    return this.datePipe.transform(value, 'medium') ?? '-';
  }
}