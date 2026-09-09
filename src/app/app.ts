import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoaderComponent } from './shared/components/loader/loader';

@Component({
  imports: [RouterOutlet, LoaderComponent],
  selector: 'app-root',
  template: `
    <router-outlet />
    <app-loader />
  `,
})
export class App {}
