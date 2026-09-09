# Vehicle Renting Management App — Project Plan

> **Angular v22 | Admin App | Real API + Real-Time Scenarios | Interview Focused**

---

## 1. Project Overview

| Item | Detail |
|------|--------|
| **Project Name** | `vehicle-renting-management` (suggested) |
| **Angular Version** | 22 |
| **App Type** | Admin Panel |
| **API Base URL** | `https://freeapi.gerasim.in` |
| **API Docs (Swagger)** | [https://freeapi.gerasim.in/index.html](https://freeapi.gerasim.in/index.html) → **CarRentalApp** tag |
| **UI Libraries** | Tailwind CSS v4, ng-icons (Heroicons default; swap icon sets as needed) |

### Purpose

Build a full-featured **Vehicle Renting Management Admin App** from scratch using Angular 22, integrated with the **CarRentalApp** REST API. The project is structured for **real-world scenarios** and **interview preparation** — covering setup, components, HTTP integration, state management patterns, and performance optimization.

---

## 2. Major Goals

| # | Goal | Description |
|---|------|-------------|
| 1 | **Project Setup** | Scaffold Angular 22 app, configure routing, Tailwind CSS, ng-icons, environment, HTTP client |
| 2 | **Component Creation** | Build feature modules/pages with reusable shared components |
| 3 | **API Integration** | Connect all screens to CarRentalApp endpoints with typed models and error handling |
| 4 | **Optimize App** | Lazy loading, OnPush, signals, trackBy, debounce, caching, and bundle awareness |

---

## 3. Modules / Features

### 3.1 Hard-Coded Login Page

> CarRentalApp API has **no login endpoint** — authentication is client-side only for this project.

| Feature | Detail |
|---------|--------|
| Route | `/login` |
| Auth Type | Hard-coded credentials (e.g. `admin` / `admin123`) |
| Storage | `sessionStorage` or `localStorage` for login flag |
| Guard | `authGuard` — block all admin routes if not logged in |
| Redirect | After login → `/dashboard`; on logout → `/login` |

**Interview topics:** Route guards (`CanActivateFn`), functional guards, auth service, redirect URL.

---

### 3.2 Vehicle Listing (Create / Manage Vehicles)

| Feature | Detail |
|---------|--------|
| Route | `/vehicles` |
| List | Display all cars in table/card view |
| Create | Form to add new vehicle |
| Update | Edit existing vehicle |
| Delete | Remove vehicle by ID |

**API Endpoints Used:**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/CarRentalApp/GetCars` | Fetch all vehicles |
| `POST` | `/api/CarRentalApp/CreateNewCar` | Create new vehicle |
| `PUT` | `/api/CarRentalApp/UpdateCar` | Update vehicle |
| `DELETE` | `/api/CarRentalApp/DeleteCarbyCarId?carid={id}` | Delete vehicle |

**Model: `RentCar`**

```typescript
interface RentCar {
  CarId?: number;
  Brand: string;       // required
  Model: string;       // required
  Year: number;        // required
  Color?: string;
  DailyRate: number;   // required
  CarImage?: string;
  RegNo: string;       // required
}
```

**Interview topics:** Reactive forms, validation, CRUD service, `HttpClient`, image URL handling.

---

### 3.3 Book Vehicle

| Feature | Detail |
|---------|--------|
| Route | `/book-vehicle` |
| Form fields | Customer (select to pre-fill, or enter manually), car, booking date, rental days (UI only), discount, total preview |
| Submit | `POST CreateNewBooking` with `RentBookingView` (no `CustomerId` in API — customer data is sent inline) |

**API Endpoints Used:**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/CarRentalApp/GetCars` | Populate car dropdown |
| `GET` | `/api/CarRentalApp/GetCustomers` | Populate customer dropdown (pre-fill only) |
| `POST` | `/api/CarRentalApp/CreateNewBooking` | Create booking |

**Model: `RentBookingView`** (matches Swagger — no rental-days field)

```typescript
interface RentBookingView {
  CustomerName: string;      // required
  CustomerCity?: string;
  MobileNo?: string;         // exactly 10 digits when provided
  Email: string;             // required
  BookingId?: number;
  CarId: number;             // required
  BookingDate: string;       // ISO date-time, required
  Discount?: number;         // integer in API
  TotalBillAmount: number;   // required — sent to API
}
```

**UI-only field (not sent to API):**

```typescript
// Local form state only — used to calculate TotalBillAmount
rentalDays: number;  // min 1
```

**Business logic (real-time scenario):**

1. User selects car → read `DailyRate` from selected `RentCar`
2. User enters `rentalDays` (UI field) and optional `Discount`
3. Compute: `TotalBillAmount = (DailyRate × rentalDays) - Discount` (floor at 0)
4. Bind computed value into `TotalBillAmount` before submit
5. Validate mobile: exactly 10 digits when not empty
6. Show live bill preview as car / rental days / discount change

> **API note:** Swagger has no `RentalDays` or `ReturnDate`. Rental days exist only in the form for bill calculation.

**Interview topics:** Reactive forms, `computed()` signals, cross-field validation, value pre-fill from dropdown.

---

### 3.4 Booking Listing

| Feature | Detail |
|---------|--------|
| Route | `/bookings` (list), `/bookings/:id` (detail — optional route or modal) |
| List | All bookings in sortable/filterable table |
| Filter | By customer name, mobile, car, date range |
| View | Single booking detail via `GetBookingByBookingId` |
| Delete | Remove booking (confirm dialog first) |
| Update | **Not available** — API has no update-booking endpoint |

**API Endpoints Used:**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/CarRentalApp/geAllBookings` | All bookings |
| `POST` | `/api/CarRentalApp/FilterBookings` | Filtered bookings |
| `GET` | `/api/CarRentalApp/GetBookingByBookingId?bookingId={id}` | Single booking |
| `DELETE` | `/api/CarRentalApp/DeletBookingById?id={id}` | Delete booking |

**Model: `RentBookingFilter`**

```typescript
interface RentBookingFilter {
  MobileNo?: string;
  CustomerName?: string;
  CarId?: number;
  FromBookingDate?: string;  // ISO date-time
  ToBookingDate?: string;    // ISO date-time
}
```

**Interview topics:** Server-side vs client-side filtering, pagination UI, `trackBy`, loading/error states.

---

### 3.5 Customer Ledger

| Feature | Detail |
|---------|--------|
| Route | `/customer-ledger` |
| List | All customers with summary (total bookings, total spend) |
| Drill-down | Select customer → show all their bookings |
| CRUD | Create / update / delete customers (optional admin actions) |

**API Endpoints Used:**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/CarRentalApp/GetCustomers` | All customers |
| `POST` | `/api/CarRentalApp/CreateNewCustomer` | Add customer |
| `PUT` | `/api/CarRentalApp/UpdateCustomer` | Update customer |
| `DELETE` | `/api/CarRentalApp/DeletCustomerById?id={id}` | Delete customer |
| `GET` | `/api/CarRentalApp/geAllBookingsByCustomerId?custId={id}` | Customer booking history |

**Model: `RentCustomer`**

```typescript
interface RentCustomer {
  CustomerId?: number;
  CustomerName: string;   // required
  CustomerCity?: string;
  MobileNo?: string;      // min 10 chars
  Email?: string;
}
```

**Ledger columns (computed on client):**

- Customer Name, City, Mobile, Email
- Total Bookings (count from booking history)
- Total Amount Spent (sum of `TotalBillAmount`)
- Last Booking Date

**Customer ledger load strategy:**

1. `GET GetCustomers` → render customer list
2. On row expand / select → `GET geAllBookingsByCustomerId?custId={id}`
3. Aggregate on client: booking count, total spend, last booking date

> **Performance note:** One API call per customer if you load all histories upfront. For this learning project, load history on demand (expand row) to avoid N+1 calls on page load.

**Interview topics:** Nested data aggregation, master-detail UI, RxJS `switchMap` on row select.

---

### 3.6 Dashboard

| Feature | Detail |
|---------|--------|
| Route | `/dashboard` (default after login) |
| Data | Summary cards, charts, recent bookings |

**API Endpoint Used:**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/CarRentalApp/GetDashboardData` | Dashboard stats |

**Suggested UI widgets:**

- Total Cars / Customers / Bookings
- Revenue summary
- Recent bookings table
- Available vs booked cars (if returned by API)

**Interview topics:** Resolver vs component fetch, skeleton loaders, chart library integration (optional).

> **First step when building:** Call `GetDashboardData` in Swagger and note the `Data` shape before binding UI widgets.

---

## 4. Common API Response Wrapper

All CarRentalApp endpoints return:

```typescript
interface ApiResponse<T = unknown> {
  Message?: string;
  Result: boolean;
  Data?: T;
}
```

**HTTP interceptor responsibilities:**

- Unwrap `ApiResponse` and throw on `Result === false`
- Global error toast / snackbar
- Optional loading spinner via `HttpContext` token

---

## 5. Suggested Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── guards/
│   │   │   ├── auth.guard.ts
│   │   │   └── guest.guard.ts
│   │   ├── interceptors/
│   │   │   ├── api-response.interceptor.ts
│   │   │   └── loading.interceptor.ts
│   │   ├── models/
│   │   │   ├── api-response.model.ts
│   │   │   ├── rent-car.model.ts
│   │   │   ├── rent-customer.model.ts
│   │   │   ├── rent-booking.model.ts
│   │   │   └── rent-booking-filter.model.ts
│   │   └── services/
│   │       ├── auth.service.ts
│   │       ├── car.service.ts
│   │       ├── customer.service.ts
│   │       ├── booking.service.ts
│   │       └── dashboard.service.ts
│   ├── layouts/
│   │   └── admin-layout/          # sidebar + navbar shell for auth routes
│   ├── shared/
│   │   ├── components/
│   │   │   ├── navbar/
│   │   │   ├── sidebar/
│   │   │   ├── loader/
│   │   │   ├── confirm-dialog/
│   │   │   └── toast/             # success / error feedback
│   │   └── pipes/
│   ├── features/
│   │   ├── auth/
│   │   │   └── login/
│   │   ├── dashboard/
│   │   ├── vehicles/
│   │   ├── book-vehicle/
│   │   ├── bookings/
│   │   └── customer-ledger/
│   ├── app.config.ts
│   ├── app.routes.ts
│   └── app.component.ts
├── environments/
│   ├── environment.ts
│   └── environment.prod.ts
├── styles.css              # @import 'tailwindcss' (configured by ng new)
└── .postcssrc.json         # @tailwindcss/postcss plugin
```

---

## 6. Routing Plan

| Path | Component | Guard | Load Strategy |
|------|-----------|-------|---------------|
| `/login` | LoginComponent | `guestGuard` (redirect if already logged in) | Eager |
| `` (empty) | — | — | Redirect → `/dashboard` |
| `/dashboard` | DashboardComponent | `authGuard` | Lazy (child of admin layout) |
| `/vehicles` | VehicleListComponent | `authGuard` | Lazy |
| `/book-vehicle` | BookVehicleComponent | `authGuard` | Lazy |
| `/bookings` | BookingListComponent | `authGuard` | Lazy |
| `/bookings/:id` | BookingDetailComponent | `authGuard` | Lazy (or modal on list page) |
| `/customer-ledger` | CustomerLedgerComponent | `authGuard` | Lazy |
| `**` | — | — | Redirect → `/dashboard` if logged in, else `/login` |

**Layout:** `AdminLayoutComponent` wraps all authenticated routes as a parent route with `children`.

```typescript
// app.routes.ts (simplified)
{
  path: '',
  component: AdminLayoutComponent,
  canActivate: [authGuard],
  children: [
    { path: 'dashboard', loadComponent: () => import('...') },
    { path: 'vehicles', loadComponent: () => import('...') },
    // ...
  ]
}
```

---

## 7. Setup Commands

### 7.1 Create Project

```bash
ng new vehicle-renting-management
```

**Recommended `ng new` options:**

- Routing: **Yes**
- Stylesheet: **Tailwind CSS** (auto-installs Tailwind v4 + PostCSS)
- SSR: **No** (unless needed for interview demo)
- AI integration: **Cursor** (optional — adds `AGENTS.md` + MCP config)

### 7.2 Run Project

```bash
cd vehicle-renting-management
ng serve
```

App URL: `http://localhost:4200`

### 7.3 Tailwind CSS (Already Configured)

`ng new` with **Tailwind CSS** selected sets up Tailwind v4 automatically:

**`src/styles.css`**

```css
@import 'tailwindcss';
```

**`.postcssrc.json`**

```json
{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}
```

**How to test Tailwind works:** Add a test element in `app.html`:

```html
<button class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
  Tailwind works
</button>
```

### 7.4 Install ng-icons

```bash
npm install @ng-icons/core @ng-icons/heroicons
```

**Register in `app.config.ts`:**

```typescript
import { provideNgIconsConfig } from '@ng-icons/core';
import { provideAppIcons } from './shared/icons/app-icons';

export const appConfig: ApplicationConfig = {
  providers: [
    provideNgIconsConfig({ size: '1.25rem' }),
    provideAppIcons(),
  ],
};
```

**Central icon registry (`src/app/shared/icons/app-icons.ts`):**

```typescript
import { provideIcons } from '@ng-icons/core';
import { heroHome, heroTruck } from '@ng-icons/heroicons/outline';

export const provideAppIcons = () =>
  provideIcons({ heroHome, heroTruck });
```

**Usage in templates:**

```html
<ng-icon name="heroHome" class="text-blue-600" />
```

> **Flexibility:** Install additional sets only when needed — e.g. `@ng-icons/lucide`, `@ng-icons/bootstrap-icons`, `@ng-icons/material-icons` — and register icons in `app-icons.ts`.

### 7.5 node_modules Symlink (Optional — Disk Space Saver)

Create a directory junction so this project reuses `node_modules` from another location:

```cmd
cmd /c mklink /d node_modules D:\youtubeProjects\node_modules
```

> **Note:** Run from the project root. Requires Administrator privileges on Windows. Remove existing `node_modules` folder first if present.

### 7.6 Optional Tailwind Plugins (Phase 2+)

```bash
# Only if you need them later
npm install @tailwindcss/forms
```

Add to `styles.css` if installed:

```css
@import 'tailwindcss';
@plugin '@tailwindcss/forms';
```

---

## 8. Environment Configuration

```typescript
// environment.ts
export const environment = {
  production: false,
  apiBaseUrl: 'https://freeapi.gerasim.in',
  carRentalApi: 'https://freeapi.gerasim.in/api/CarRentalApp',
};
```

---

## 9. Implementation Phases (Small Steps)

> Follow steps in order. Each step should compile and run before moving to the next.

---

### Phase 1 — Project Foundation (Steps 1–10)

| Step | Task | Done |
|------|------|------|
| 1.1 | Run `ng new vehicle-renting-management` (routing: Yes, Tailwind CSS: Yes, SSR: No, Cursor: optional) | [x] |
| 1.2 | Verify Tailwind in `styles.css`; install ng-icons, register icons in `app.config.ts` | [x] |
| 1.3 | Create `environment.ts` and `environment.prod.ts` with `apiBaseUrl` + `carRentalApi` | [ ] |
| 1.4 | Create all TypeScript models in `core/models/` (`ApiResponse`, `RentCar`, `RentCustomer`, `RentBookingView`, `RentBookingFilter`) | [ ] |
| 1.5 | Register `provideHttpClient(withInterceptors([apiResponseInterceptor, loadingInterceptor]))` in `app.config.ts` | [ ] |
| 1.6 | Build `api-response.interceptor.ts` — unwrap `Data`, throw on `Result === false` | [ ] |
| 1.7 | Build `loading.interceptor.ts` — toggle global loader via service | [ ] |
| 1.8 | Create shared `LoaderComponent` and bind to loading service | [ ] |
| 1.9 | Create `AdminLayoutComponent` with sidebar + navbar placeholders | [ ] |
| 1.10 | Verify app runs at `http://localhost:4200` with layout shell visible | [ ] |

---

### Phase 2 — Auth & Routing (Steps 11–18)

| Step | Task | Done |
|------|------|------|
| 2.1 | Create `AuthService` — `login()`, `logout()`, `isLoggedIn()`, storage read/write | [ ] |
| 2.2 | Create `authGuard` — block unauthenticated access to admin routes | [ ] |
| 2.3 | Create `guestGuard` — redirect logged-in users away from `/login` | [ ] |
| 2.4 | Build `LoginComponent` with reactive form (`username`, `password`) | [ ] |
| 2.5 | Hard-code credentials check (`admin` / `admin123`); show error on failure | [ ] |
| 2.6 | On success → save flag → navigate to `/dashboard` | [ ] |
| 2.7 | Wire `app.routes.ts`: `/login` (guestGuard), admin layout children (authGuard), wildcards | [ ] |
| 2.8 | Add logout button in navbar → clear storage → navigate to `/login` | [ ] |

---

### Phase 3 — Shared UI Building Blocks (Steps 19–22)

| Step | Task | Done |
|------|------|------|
| 3.1 | Build `SidebarComponent` with nav links to all 5 feature routes | [ ] |
| 3.2 | Build `ConfirmDialogComponent` (reusable delete confirmation) | [ ] |
| 3.3 | Build `ToastComponent` + `ToastService` for success/error messages | [ ] |
| 3.4 | Add empty-state template pattern (icon + message) for lists with no data | [ ] |

---

### Phase 4 — Vehicles Module (Steps 23–30)

| Step | Task | Done |
|------|------|------|
| 4.1 | Create `CarService` with `getCars`, `createCar`, `updateCar`, `deleteCar` | [ ] |
| 4.2 | Lazy-load `/vehicles` route | [ ] |
| 4.3 | Build vehicle list table — `GET GetCars`, loading + empty + error states | [ ] |
| 4.4 | Build create form (reactive) with validation for required `RentCar` fields | [ ] |
| 4.5 | Wire `POST CreateNewCar` — toast on success, refresh list | [ ] |
| 4.6 | Add edit mode (inline or modal) — `PUT UpdateCar` | [ ] |
| 4.7 | Add delete with confirm dialog — `DELETE DeleteCarbyCarId` | [ ] |
| 4.8 | Use `@for` with `track car.CarId` on vehicle list | [ ] |

---

### Phase 5 — Customer Ledger Module (Steps 31–38)

| Step | Task | Done |
|------|------|------|
| 5.1 | Create `CustomerService` with full CRUD + `getBookingsByCustomerId` | [ ] |
| 5.2 | Lazy-load `/customer-ledger` route | [ ] |
| 5.3 | Build customer list table — `GET GetCustomers` | [ ] |
| 5.4 | On row expand → `GET geAllBookingsByCustomerId` — show booking history panel | [ ] |
| 5.5 | Compute ledger columns: total bookings, total spend, last booking date | [ ] |
| 5.6 | Add create customer form — `POST CreateNewCustomer` | [ ] |
| 5.7 | Add edit customer — `PUT UpdateCustomer` | [ ] |
| 5.8 | Add delete customer with confirm — `DELETE DeletCustomerById` | [ ] |

---

### Phase 6 — Book Vehicle Module (Steps 39–46)

| Step | Task | Done |
|------|------|------|
| 6.1 | Create `BookingService` with `createBooking`, `getBookings`, `filterBookings`, `getBookingById`, `deleteBooking` | [ ] |
| 6.2 | Lazy-load `/book-vehicle` route | [ ] |
| 6.3 | Load cars + customers on init (`forkJoin` or parallel calls) | [ ] |
| 6.4 | Build reactive form: customer fields, car select, booking date, rental days (UI), discount | [ ] |
| 6.5 | Customer dropdown → pre-fill `CustomerName`, `Email`, `MobileNo`, `CustomerCity` | [ ] |
| 6.6 | `computed()` bill: `(DailyRate × rentalDays) - Discount` → bind `TotalBillAmount` | [ ] |
| 6.7 | Validate mobile (10 digits) and required API fields before submit | [ ] |
| 6.8 | `POST CreateNewBooking` — toast on success → optional navigate to `/bookings` | [ ] |

---

### Phase 7 — Booking Listing Module (Steps 47–53)

| Step | Task | Done |
|------|------|------|
| 7.1 | Lazy-load `/bookings` route | [ ] |
| 7.2 | Load all bookings on init — `GET geAllBookings` | [ ] |
| 7.3 | Build filter form (`RentBookingFilter`) — debounced `POST FilterBookings` | [ ] |
| 7.4 | Add clear-filters button → reload all bookings | [ ] |
| 7.5 | View detail — modal or `/bookings/:id` via `GET GetBookingByBookingId` | [ ] |
| 7.6 | Delete booking with confirm — `DELETE DeletBookingById` → refresh list | [ ] |
| 7.7 | Loading, empty, and error states on list + filter | [ ] |

---

### Phase 8 — Dashboard Module (Steps 54–58)

| Step | Task | Done |
|------|------|------|
| 8.1 | Create `DashboardService` — `getDashboardData()` | [ ] |
| 8.2 | Lazy-load `/dashboard` as default child route (`path: ''` redirect) | [ ] |
| 8.3 | Call API; inspect response shape; bind summary cards | [ ] |
| 8.4 | Add recent bookings table (if returned in `Data`) | [ ] |
| 8.5 | Add skeleton loader while dashboard data loads | [ ] |

---

### Phase 9 — Polish & Real-Time UX (Steps 59–64)

| Step | Task | Done |
|------|------|------|
| 9.1 | Ensure every screen has loading / empty / error UI | [ ] |
| 9.2 | Toast on all CRUD success and failure paths | [ ] |
| 9.3 | After new booking → invalidate or refresh dashboard/booking caches | [ ] |
| 9.4 | Confirm dialog on every delete action (cars, customers, bookings) | [ ] |
| 9.5 | Mobile-responsive sidebar (collapse on small screens) | [ ] |
| 9.6 | Optional: `proxy.conf.json` if CORS blocks local dev API calls | [ ] |

---

### Phase 10 — Optimize (Steps 65–70)

| Step | Task | Done |
|------|------|------|
| 10.1 | `ChangeDetectionStrategy.OnPush` on all list/table components | [ ] |
| 10.2 | `@for` with `track` on every list (no untracked loops) | [ ] |
| 10.3 | `shareReplay(1)` cache on `getCars()` and `getCustomers()` in services | [ ] |
| 10.4 | Replace manual subscriptions with `takeUntilDestroyed()` or signals | [ ] |
| 10.5 | Run `ng build --stats-json` and review bundle size | [ ] |
| 10.6 | Final pass: remove unused imports, console logs, dead code | [ ] |

---

## 10. Interview Focus Checklist

### Angular 22 Concepts to Demonstrate

| Topic | Where to Apply |
|-------|----------------|
| Standalone components | All feature components |
| `inject()` function | Services, guards, interceptors |
| Signals & `computed()` | Dashboard stats, bill calculator |
| Functional route guards | `authGuard`, `guestGuard` |
| `provideHttpClient` + interceptors | Core module |
| Reactive forms | Vehicle, Booking, Customer forms |
| Lazy loading | Feature routes |
| `OnPush` change detection | List/table components |
| `@for` with `track` | All lists |
| `takeUntilDestroyed()` | Component subscriptions |
| Environment-based config | API base URL |
| Error handling | Interceptor + component level |
| Tailwind CSS utility classes | Layout, tables, forms, responsive sidebar |

### Common Interview Questions This Project Covers

1. How do you structure a medium Angular admin app?
2. How do you implement route protection without a backend login API?
3. How do you type HTTP responses and handle a wrapper like `ApiResponse`?
4. How do you implement CRUD with `HttpClient`?
5. What is the difference between eager and lazy loading?
6. How do you optimize a list with 100+ items?
7. How do you share data between components (service vs signals vs `@Input`)?
8. How do you handle loading and error states in HTTP calls?
9. What are HTTP interceptors and when do you use them?
10. How do you calculate derived state reactively (bill amount)?

---

## 11. UI / UX Guidelines (Admin)

- **Color scheme:** `bg-slate-900` dark sidebar + `bg-blue-600` primary actions
- **Layout:** `flex` admin shell — fixed sidebar (`w-64`) + top navbar with logout; `md:` breakpoints for mobile collapse
- **Tables:** `min-w-full divide-y divide-gray-200` with `hover:bg-gray-50` rows and action icon buttons
- **Forms:** Tailwind inputs — `block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500`; red border + text for validation errors
- **Cards (dashboard):** `rounded-xl bg-white p-6 shadow-sm border border-gray-100`
- **Buttons:** Primary `bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2`; danger `bg-red-600 hover:bg-red-700`
- **Icons:** ng-icons (`<ng-icon name="heroTrash" />`) for nav, actions (edit, delete, view); style with Tailwind (`text-gray-500`, `size-5`)
- **Feedback:** Custom toast component styled with Tailwind (`bg-green-50` success, `bg-red-50` error)
- **Empty states:** Centered icon + muted text (`text-gray-500`)
- **Confirm dialogs:** Tailwind modal overlay (`fixed inset-0 bg-black/50`) before delete operations
- **Loading:** Spinner with `animate-spin` or skeleton placeholders (`animate-pulse bg-gray-200`)

---

## 12. API Endpoint Quick Reference

**Base:** `https://freeapi.gerasim.in/api/CarRentalApp`

| # | Method | Endpoint | Module |
|---|--------|----------|--------|
| 1 | GET | `GetDashboardData` | Dashboard |
| 2 | GET | `GetCars` | Vehicles, Book Vehicle |
| 3 | POST | `CreateNewCar` | Vehicles |
| 4 | PUT | `UpdateCar` | Vehicles |
| 5 | DELETE | `DeleteCarbyCarId?carid=` | Vehicles |
| 6 | GET | `GetCustomers` | Customer Ledger, Book Vehicle |
| 7 | POST | `CreateNewCustomer` | Customer Ledger |
| 8 | PUT | `UpdateCustomer` | Customer Ledger |
| 9 | DELETE | `DeletCustomerById?id=` | Customer Ledger |
| 10 | GET | `geAllBookings` | Bookings |
| 11 | POST | `FilterBookings` | Bookings |
| 12 | GET | `geAllBookingsByCustomerId?custId=` | Customer Ledger |
| 13 | GET | `GetBookingByBookingId?bookingId=` | Bookings |
| 14 | POST | `CreateNewBooking` | Book Vehicle |
| 15 | DELETE | `DeletBookingById?id=` | Bookings |

> **API naming note:** Endpoints `geAllBookings`, `DeletCustomerById`, and `DeletBookingById` use the exact spelling from the Swagger spec — keep URLs as-is to avoid 404 errors.

---

## 13. Known API Limitations

| Limitation | Impact | Plan handling |
|------------|--------|---------------|
| No login endpoint | Auth is client-side only | Hard-coded login + guards |
| No `RentalDays` in `RentBookingView` | Cannot send rental days to API | UI-only field; compute `TotalBillAmount` client-side |
| No `CustomerId` in booking | Cannot link booking to existing customer by ID | Dropdown pre-fills inline customer fields |
| No update booking endpoint | Bookings are create + delete only | No edit button on bookings |
| Typos in API paths | `geAllBookings`, `DeletCustomerById`, `DeletBookingById` | Use exact spelling from Swagger |

---

## 14. Plan Review Notes

| Area | Status | Notes |
|------|--------|-------|
| Module coverage | ✅ Complete | All 6 modules map to 15 API endpoints |
| Build order | ✅ Fixed | See Phase 1–8 implementation steps |
| Book Vehicle bill logic | ✅ Fixed | `rentalDays` is UI-only; `TotalBillAmount` sent to API |
| Routing & guards | ✅ Fixed | `authGuard`, `guestGuard`, admin layout parent route |
| Customer Ledger | ✅ Fixed | Load booking history on demand (avoid N+1) |
| Real-time scenarios | ✅ Defined | Bill calculator, debounced filters, toasts |
| Interview focus | ✅ Built in | 70 small steps map to Angular 22 concepts |
| Tech stack | ✅ Aligned | Angular 22 + Tailwind CSS v4 + ng-icons |
| Symlink command | ⚠️ Optional | Use `node_modules` (no space) in path |

---

## 15. Status

| Item | Status |
|------|--------|
| Plan documented | ✅ Done |
| Project created | ✅ Done (`ng new` with Tailwind CSS) |
| Tailwind configured | ✅ Done (via `styles.css` + `.postcssrc.json`) |
| ng-icons | ✅ Installed (`@ng-icons/core`, `@ng-icons/heroicons`) |
| Implementation | ⏳ Not started |

---

*Last updated: September 10, 2026 — ng-icons adoption*
