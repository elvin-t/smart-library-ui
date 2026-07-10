import { CurrencyPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'appCurrency',
  standalone: true
})
export class CurrencyFormatPipe implements PipeTransform {

  private readonly currencyPipe = new CurrencyPipe('en-IN');

  transform(value: number | null | undefined): string {
    const amount = value ?? 0;

    return this.currencyPipe.transform(amount, 'INR', 'symbol', '1.2-2') ?? '₹0.00';
  }
}