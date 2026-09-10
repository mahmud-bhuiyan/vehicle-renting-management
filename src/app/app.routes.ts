import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login').then((m) => m.LoginComponent),
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then((m) => m.DashboardComponent),
      },
      {
        path: 'vehicles',
        loadComponent: () =>
          import('./features/vehicles/vehicle-list/vehicle-list').then((m) => m.VehicleListComponent),
      },
      {
        path: 'vehicles/create',
        loadComponent: () =>
          import('./features/vehicles/vehicle-create/vehicle-create').then((m) => m.VehicleCreateComponent),
      },
      {
        path: 'vehicles/:id/edit',
        loadComponent: () =>
          import('./features/vehicles/vehicle-edit/vehicle-edit').then((m) => m.VehicleEditComponent),
      },
      {
        path: 'customer-ledger',
        loadComponent: () =>
          import('./features/customer-ledger/customer-ledger/customer-ledger').then(
            (m) => m.CustomerLedgerComponent,
          ),
      },
      {
        path: 'customer-ledger/create',
        loadComponent: () =>
          import('./features/customer-ledger/customer-create/customer-create').then(
            (m) => m.CustomerCreateComponent,
          ),
      },
      {
        path: 'customer-ledger/:id/edit',
        loadComponent: () =>
          import('./features/customer-ledger/customer-edit/customer-edit').then(
            (m) => m.CustomerEditComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
