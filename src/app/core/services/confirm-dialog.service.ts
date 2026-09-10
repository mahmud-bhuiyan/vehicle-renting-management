import { Injectable, signal } from '@angular/core';

export interface ConfirmDialogConfig {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  readonly config = signal<ConfirmDialogConfig | null>(null);

  private resolveFn: ((value: boolean) => void) | null = null;

  open(config: ConfirmDialogConfig): Promise<boolean> {
    this.config.set({
      confirmLabel: 'Confirm',
      cancelLabel: 'Cancel',
      destructive: false,
      ...config,
    });

    return new Promise((resolve) => {
      this.resolveFn = resolve;
    });
  }

  confirm(): void {
    this.resolveFn?.(true);
    this.close();
  }

  cancel(): void {
    this.resolveFn?.(false);
    this.close();
  }

  private close(): void {
    this.config.set(null);
    this.resolveFn = null;
  }
}
