export interface DataTableColumn<T = unknown> {
  key: string;
  header: string;
  align?: 'left' | 'right' | 'center';
  /** Dot-notation path or function used for default cell text and search */
  value?: string | ((row: T) => string | number | null | undefined);
}

export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 500] as const;

export const DEFAULT_PAGE_SIZE = 20;

export type PaginationItem =
  | { type: 'page'; page: number }
  | { type: 'ellipsis' };
