import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import {
  DataTableColumn,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_SIZE_OPTIONS,
  PaginationItem,
} from './data-table.model';
import { TableCellTemplateDirective } from './table-cell-template.directive';

@Component({
  selector: 'app-data-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, NgIcon, NgTemplateOutlet],
  template: `
    <div class="space-y-4">
      @if (searchable()) {
        <div class="relative max-w-sm">
          <ng-icon
            name="heroMagnifyingGlass"
            class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            class="block w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-surface-800 dark:text-slate-100 dark:placeholder:text-slate-500"
            [placeholder]="searchPlaceholder()"
            [value]="searchQuery()"
            (input)="onSearchInput($event)"
          />
        </div>
      }

      <div
        class="overflow-hidden rounded-2xl border border-white/80 bg-white shadow-lg shadow-slate-200/60 dark:border-white/10 dark:bg-surface-900 dark:shadow-black/20"
      >
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200 dark:divide-white/10">
            <thead class="bg-slate-50 dark:bg-white/5">
              <tr>
                @for (column of columns(); track column.key) {
                  <th
                    scope="col"
                    [class]="headerClass(column)"
                  >
                    {{ column.header }}
                  </th>
                }
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-white/10">
              @for (row of paginatedData(); track trackRow($index, row)) {
                <tr class="transition hover:bg-slate-50 dark:hover:bg-white/5">
                  @for (column of columns(); track column.key) {
                    <td [class]="cellClass(column)">
                      @if (getCellTemplate(column.key); as cellTemplate) {
                        <ng-container
                          [ngTemplateOutlet]="cellTemplate"
                          [ngTemplateOutletContext]="{ $implicit: row, row }"
                        />
                      } @else {
                        {{ getCellValue(row, column) }}
                      }
                    </td>
                  }
                </tr>
              } @empty {
                <tr>
                  <td
                    [attr.colspan]="columns().length"
                    class="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    {{ emptySearchMessage() }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (filteredData().length > 0) {
          <div
            class="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="flex flex-wrap items-center gap-3">
              <label class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                Rows per page
                <select
                  class="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-surface-800 dark:text-slate-100"
                  [ngModel]="pageSize()"
                  (ngModelChange)="onPageSizeChange($event)"
                >
                  @for (size of pageSizeOptions(); track size) {
                    <option [ngValue]="size">{{ size }}</option>
                  }
                </select>
              </label>

              <p class="text-sm text-slate-500 dark:text-slate-400">
                Showing
                <span class="font-medium text-slate-700 dark:text-slate-300">{{ rangeStart() }}</span>
                –
                <span class="font-medium text-slate-700 dark:text-slate-300">{{ rangeEnd() }}</span>
                of
                <span class="font-medium text-slate-700 dark:text-slate-300">{{ filteredData().length }}</span>
              </p>
            </div>

            <div class="inline-flex flex-wrap items-center gap-1">
              <button
                type="button"
                class="inline-flex min-h-8 items-center justify-center rounded-lg border border-slate-200 px-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                [disabled]="currentPage() <= 1"
                (click)="goToPage(1)"
              >
                First
              </button>

              <button
                type="button"
                class="inline-flex min-h-8 items-center justify-center rounded-lg border border-slate-200 px-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                [disabled]="currentPage() <= 1"
                (click)="goToPage(currentPage() - 1)"
              >
                Prev
              </button>

              @for (item of paginationItems(); track paginationTrack(item, $index)) {
                @if (item.type === 'ellipsis') {
                  <span
                    class="inline-flex size-8 items-center justify-center text-sm text-slate-400 dark:text-slate-500"
                    aria-hidden="true"
                  >
                    …
                  </span>
                } @else {
                  <button
                    type="button"
                    class="inline-flex size-8 items-center justify-center rounded-lg border text-sm font-medium transition disabled:cursor-not-allowed"
                    [class]="pageButtonClass(item.page)"
                    [attr.aria-label]="'Page ' + item.page"
                    [attr.aria-current]="item.page === currentPage() ? 'page' : null"
                    (click)="goToPage(item.page)"
                  >
                    {{ item.page }}
                  </button>
                }
              }

              <button
                type="button"
                class="inline-flex min-h-8 items-center justify-center rounded-lg border border-slate-200 px-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                [disabled]="currentPage() >= totalPages()"
                (click)="goToPage(currentPage() + 1)"
              >
                Next
              </button>

              <button
                type="button"
                class="inline-flex min-h-8 items-center justify-center rounded-lg border border-slate-200 px-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                [disabled]="currentPage() >= totalPages()"
                (click)="goToPage(totalPages())"
              >
                Last
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class DataTableComponent<T = unknown> {
  readonly data = input.required<T[]>();
  readonly columns = input.required<DataTableColumn<T>[]>();
  readonly trackBy = input<keyof T | ((row: T) => unknown)>('id' as keyof T);
  readonly searchable = input(true);
  readonly searchPlaceholder = input('Search...');
  readonly searchKeys = input<string[]>([]);
  readonly emptySearchMessage = input('No matching results found.');
  readonly pageSizeOptions = input<number[]>([...DEFAULT_PAGE_SIZE_OPTIONS]);
  readonly defaultPageSize = input(DEFAULT_PAGE_SIZE);

  private readonly cellTemplates = contentChildren(TableCellTemplateDirective<T>);

  protected readonly searchQuery = signal('');
  protected readonly pageSize = linkedSignal(() => this.defaultPageSize());
  protected readonly currentPage = signal(1);

  protected readonly filteredData = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const rows = this.data();

    if (!query) {
      return rows;
    }

    const keys = this.resolveSearchKeys();

    return rows.filter((row) =>
      keys.some((key) => this.getSearchableValue(row, key).toLowerCase().includes(query)),
    );
  });

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredData().length / this.pageSize())),
  );

  protected readonly paginatedData = computed(() => {
    const page = Math.min(this.currentPage(), this.totalPages());
    const start = (page - 1) * this.pageSize();
    return this.filteredData().slice(start, start + this.pageSize());
  });

  protected readonly rangeStart = computed(() => {
    if (this.filteredData().length === 0) {
      return 0;
    }

    return (Math.min(this.currentPage(), this.totalPages()) - 1) * this.pageSize() + 1;
  });

  protected readonly rangeEnd = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.filteredData().length),
  );

  protected readonly paginationItems = computed(() =>
    this.buildPaginationItems(this.currentPage(), this.totalPages()),
  );

  protected onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.currentPage.set(1);
  }

  protected onPageSizeChange(value: number): void {
    this.pageSize.set(value);
    this.currentPage.set(1);
  }

  protected goToPage(page: number): void {
    const nextPage = Math.min(Math.max(page, 1), this.totalPages());
    this.currentPage.set(nextPage);
  }

  protected paginationTrack(item: PaginationItem, index: number): string {
    return item.type === 'page' ? `page-${item.page}` : `ellipsis-${index}`;
  }

  protected pageButtonClass(page: number): string {
    if (page === this.currentPage()) {
      return 'border-indigo-600 bg-indigo-600 text-white dark:border-indigo-500 dark:bg-indigo-500';
    }

    return 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5';
  }

  protected getCellTemplate(key: string) {
    return this.cellTemplates().find((template) => template.columnKey() === key)?.templateRef ?? null;
  }

  protected getCellValue(row: T, column: DataTableColumn<T>): string {
    const value = this.resolveColumnValue(row, column);
    return value === null || value === undefined || value === '' ? '—' : String(value);
  }

  protected trackRow(index: number, row: T): unknown {
    const trackBy = this.trackBy();

    if (typeof trackBy === 'function') {
      return trackBy(row);
    }

    const key = trackBy as keyof T;
    const value = row[key];
    return value ?? index;
  }

  protected headerClass(column: DataTableColumn<T>): string {
    const align = column.align ?? 'left';
    const base =
      'px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400';

    if (align === 'right') {
      return `${base} text-right`;
    }

    if (align === 'center') {
      return `${base} text-center`;
    }

    return `${base} text-left`;
  }

  protected cellClass(column: DataTableColumn<T>): string {
    const align = column.align ?? 'left';
    const base = 'whitespace-nowrap px-4 py-3 text-sm text-slate-700 dark:text-slate-300';

    if (align === 'right') {
      return `${base} text-right`;
    }

    if (align === 'center') {
      return `${base} text-center`;
    }

    return `${base} text-left`;
  }

  private buildPaginationItems(currentPage: number, totalPages: number): PaginationItem[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => ({
        type: 'page' as const,
        page: index + 1,
      }));
    }

    const pages = new Set<number>([1, totalPages]);

    for (let page = currentPage - 1; page <= currentPage + 1; page++) {
      if (page >= 1 && page <= totalPages) {
        pages.add(page);
      }
    }

    const sortedPages = [...pages].sort((left, right) => left - right);
    const items: PaginationItem[] = [];

    for (let index = 0; index < sortedPages.length; index++) {
      const page = sortedPages[index];
      const previousPage = sortedPages[index - 1];

      if (index > 0 && page - previousPage > 1) {
        items.push({ type: 'ellipsis' });
      }

      items.push({ type: 'page', page });
    }

    return items;
  }

  private resolveSearchKeys(): string[] {
    const explicitKeys = this.searchKeys();

    if (explicitKeys.length > 0) {
      return explicitKeys;
    }

    return this.columns().map((column) => column.key);
  }

  private getSearchableValue(row: T, key: string): string {
    const column = this.columns().find((item) => item.key === key);

    if (column) {
      const value = this.resolveColumnValue(row, column);
      return value === null || value === undefined ? '' : String(value);
    }

    const value = this.readPath(row, key);
    return value === null || value === undefined ? '' : String(value);
  }

  private resolveColumnValue(row: T, column: DataTableColumn<T>): string | number | null | undefined {
    if (column.value) {
      return typeof column.value === 'function'
        ? column.value(row)
        : this.readPath(row, column.value);
    }

    return this.readPath(row, column.key);
  }

  private readPath(row: T, path: string): string | number | null | undefined {
    const value = path.split('.').reduce<unknown>((current, segment) => {
      if (current === null || current === undefined) {
        return undefined;
      }

      return (current as Record<string, unknown>)[segment];
    }, row);

    if (typeof value === 'string' || typeof value === 'number') {
      return value;
    }

    return value === null || value === undefined ? undefined : String(value);
  }
}
