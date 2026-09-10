import { Directive, inject, input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[appTableCell]',
})
export class TableCellTemplateDirective<T = unknown> {
  readonly columnKey = input.required<string>({ alias: 'appTableCell' });
  readonly templateRef = inject(TemplateRef<{ $implicit: T; row: T }>);
}
