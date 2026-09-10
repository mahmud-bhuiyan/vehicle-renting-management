import { APP_INITIALIZER, ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideNgIconsConfig } from '@ng-icons/core';
import { apiResponseInterceptor } from './core/interceptors/api-response.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { ThemeService } from './core/services/theme.service';
import { routes } from './app.routes';
import { provideAppIcons } from './shared/icons/app-icons';

function initTheme(themeService: ThemeService): () => void {
  return () => themeService.initTheme();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([loadingInterceptor, apiResponseInterceptor])),
    provideNgIconsConfig({ size: '1.25rem' }),
    provideAppIcons(),
    {
      provide: APP_INITIALIZER,
      useFactory: initTheme,
      deps: [ThemeService],
      multi: true,
    },
  ],
};
