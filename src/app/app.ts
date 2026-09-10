import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog';
import { LoaderComponent } from './shared/components/loader/loader';
import { ToastComponent } from './shared/components/toast/toast';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, LoaderComponent, ToastComponent, ConfirmDialogComponent],
  selector: 'app-root',
  template: `
    <router-outlet />
    <app-loader />
    <app-toast />
    <app-confirm-dialog />
  `,
})
export class App {}
