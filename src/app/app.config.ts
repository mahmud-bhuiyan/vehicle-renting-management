import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideNgIconsConfig } from '@ng-icons/core';
import { routes } from './app.routes';
import { provideAppIcons } from './shared/icons/app-icons';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideNgIconsConfig({ size: '1.25rem' }),
    provideAppIcons(),
  ],
};
